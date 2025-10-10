"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Upload, Film, Image as ImageIcon } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Composer from "@/components/ui/Composer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import Auth from "@/components/Auth";
import ParameterControls, { GenerationParams } from "@/components/ui/ParameterControls";
import ChatInterface, { ChatMessage } from "@/components/ui/ChatInterface";

type VeoOperationName = string | null;

type StudioMode =
  | "create-image"
  | "edit-image"
  | "compose-image"
  | "create-video";

const POLL_INTERVAL_MS = 5000;

const VeoStudio: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState<StudioMode>("create-image");
  const [prompt, setPrompt] = useState(""); // Video or image prompt
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-image-preview");
  
  // Generation parameters (dynamic, user-configurable)
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    temperature: 1.0,
    topP: 0.95,
    maxOutputTokens: 4096,
    safetyLevel: "off",
  });
  
  // Chat messages (instead of alerts)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Helper to add chat message
  const addMessage = useCallback((
    role: ChatMessage["role"],
    type: ChatMessage["type"],
    content: string,
    imageUrl?: string,
    videoUrl?: string,
    details?: string,
    solutions?: string[]
  ) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      type,
      content,
      imageUrl,
      videoUrl,
      details,
      solutions,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
  }, []);

  // Update selected model when mode changes
  useEffect(() => {
    if (mode === "create-video") {
      setSelectedModel("veo-3.0-generate-001");
    } else if (mode === "edit-image" || mode === "compose-image") {
      setSelectedModel("gemini-2.5-flash-image-preview");
    } else if (mode === "create-image") {
      if (
        !selectedModel.includes("gemini") &&
        !selectedModel.includes("imagen")
      ) {
        setSelectedModel("gemini-2.5-flash-image-preview");
      }
    }
  }, [mode, selectedModel]);

  // Listen for auth state changes and get ID token
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');

    // Development bypass - skip authentication in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping Firebase auth');
      setUser({ uid: 'dev-user', email: 'dev@example.com' } as any);
      setAuthToken('dev-token');
      setAuthLoading(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Firebase auth state changed:', user ? 'User authenticated' : 'No user');
      setUser(user);
      setAuthLoading(false);
      clearTimeout(timeoutId);

      if (user) {
        try {
          const token = await user.getIdToken();
          console.log('Got auth token');
          setAuthToken(token);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
    });

    // Force loading to complete after 5 seconds if Firebase doesn't respond
    timeoutId = setTimeout(() => {
      console.log('Firebase auth timeout - forcing completion');
      setAuthLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Image generation prompts
  const [imagePrompt, setImagePrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [composePrompt, setComposePrompt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [imagenBusy, setImagenBusy] = useState(false);
  const [geminiBusy, setGeminiBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL

  // Debug multipleImageFiles state
  useEffect(() => {
    console.log(
      "multipleImageFiles state changed:",
      multipleImageFiles.length,
      multipleImageFiles
    );
  }, [multipleImageFiles]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (imageFile) {
      objectUrl = URL.createObjectURL(imageFile);
      setUploadedImageUrl(objectUrl);
    } else {
      setUploadedImageUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageFile]);

  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);

  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  // Friendly model label for UI
  const modelLabel = useMemo(() => {
    const cleaned = selectedModel
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/preview/gi, "")
      .trim();
    return cleaned || selectedModel;
  }, [selectedModel]);

  // Model status information
  const getModelStatus = (model: string) => {
    if (model.includes("gemini")) {
      return { status: "free", limit: "50 requests/day", cost: "Free tier" };
    }
    if (model.includes("imagen")) {
      return { status: "paid", limit: "Unlimited", cost: "Requires billing" };
    }
    if (model.includes("veo")) {
      return { status: "paid", limit: "Varies", cost: "Requires billing" };
    }
    return { status: "unknown", limit: "Unknown", cost: "Unknown" };
  };

  const currentModelStatus = getModelStatus(selectedModel);

  // Rotating loading messages containing model name
  const loadingMessages = useMemo(() => {
    if (mode === "create-video") {
      return [
        `${modelLabel} is crafting your idea...`,
        "Generating keyframes and motion...",
        "Enhancing detail and lighting...",
        "Color grading and encoding...",
        "Almost there...",
        "One more step...",
        "Kidding, this takes a while...",
        "Haha sorry",
        "Did you know? That Trees are the second most photographed object in the world after the Sun.",
        "That's why we need to make sure your video is perfect.",
        "We're working on it...",
        "Hang on a sec...",
        "Almost done...",
        "One more step...",
        "Kidding, this takes a while...",
        "Haha sorry",
        "So How are you doing?",
        "Crazy what progress can be made in a few seconds?",
        "Let me check on it...",
        "Okay almost done...",
      ];
    }
    return [
      `${modelLabel} is crafting your image...`,
      "Composing layout and subject...",
      "Applying style and color...",
      "Refining edges and textures...",
      "Almost there...",
      "One more step...",
      "Kidding, this takes a while...",
      "Haha sorry",
      "So How are you doing?",
      "Crazy what progress can be made in a few seconds?",
      "Let me check on it...",
      "Okay almost done...",
      "I promise I'm working on it...",
    ];
  }, [mode, modelLabel]);

  const [loadingIndex, setLoadingIndex] = useState(0);

  // Single flag for whether we are actively generating
  const isLoadingUI = useMemo(
    () => isGenerating || imagenBusy || geminiBusy,
    [isGenerating, imagenBusy, geminiBusy]
  );

  // Advance loading message while any generation is happening
  useEffect(() => {
    if (!isLoadingUI) {
      setLoadingIndex(0);
      return;
    }
    const id = setInterval(() => {
      setLoadingIndex((i) => (i + 1) % loadingMessages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [isLoadingUI, loadingMessages]);

  const canStart = useMemo(() => {
    if (mode === "create-video") {
      if (!prompt.trim()) return false;
      // For create-video, image is optional (can be text-to-video or image-to-video)
      return true;
    } else if (mode === "create-image") {
      return imagePrompt.trim() && !imagenBusy && !geminiBusy;
    } else if (mode === "edit-image") {
      return editPrompt.trim() && (imageFile || generatedImage) && !geminiBusy;
    } else if (mode === "compose-image") {
      // Allow composition with existing image + new images, or just new images
      const hasExistingImage = imageFile || generatedImage;
      const hasNewImages = multipleImageFiles.length > 0;
      return (
        composePrompt.trim() &&
        (hasExistingImage || hasNewImages) &&
        !geminiBusy
      );
    }
    return false;
  }, [
    mode,
    prompt,
    imageFile,
    generatedImage,
    imagePrompt,
    editPrompt,
    composePrompt,
    multipleImageFiles,
    imagenBusy,
    geminiBusy,
  ]);

  const resetAll = () => {
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio("16:9");
    setImagePrompt("");
    setEditPrompt("");
    setComposePrompt("");
    setImageFile(null);
    setMultipleImageFiles([]);
    setGeneratedImage(null);
    setOperationName(null);
    setIsGenerating(false);
    setVideoUrl(null);
    setImagenBusy(false);
    setGeminiBusy(false);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
  };

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    if (!authToken) {
      addMessage("system", "info", "Please sign in to use this feature");
      return;
    }
    
    // Add user message
    addMessage("user", "text", `Generate image: "${imagePrompt}"`);

    console.log("Starting Imagen generation");
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!resp.ok) {
        console.error("Imagen API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Imagen API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        addMessage("assistant", "image", "Here's your generated image!", dataUrl);
      } else if (json?.error) {
        console.error("Imagen API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in generateWithImagen:", e);
      addMessage("assistant", "error", "Failed to generate image with Imagen", undefined, undefined, e.message);
    } finally {
      console.log("Resetting Imagen busy state");
      setImagenBusy(false);
    }
  }, [imagePrompt, authToken, addMessage]);

  // Gemini image generation helper - uses Firebase AI SDK
  const generateWithGemini = useCallback(async () => {
    if (!authToken) {
      addMessage("system", "info", "Please sign in to use this feature");
      return;
    }

    // Add user message
    addMessage("user", "text", `Generate: "${imagePrompt}"`);

    console.log("Starting Gemini image generation with Firebase AI SDK");
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/firebase-ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: "gemini-2.5-flash-image",
          // Pass dynamic parameters from UI
          temperature: generationParams.temperature,
          topP: generationParams.topP,
          maxOutputTokens: generationParams.maxOutputTokens,
          safetyLevel: generationParams.safetyLevel,
        }),
      });

      if (!resp.ok) {
        console.error("Firebase AI API error:", resp.status, resp.statusText);

        // Handle quota exceeded error specifically
        if (resp.status === 429) {
          const errorData = await resp.json().catch(() => ({}));
          const solutions = errorData.solutions || [];
          const message = errorData.message || "Firebase AI quota exceeded";
          const details = errorData.details || "";

          addMessage("assistant", "error", `🚫 Quota Exceeded: ${message}`, undefined, undefined, details, solutions);
          return;
        }

        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Firebase AI response:", json);

      if (json?.response) {
        // For text responses, we might need to handle images differently
        // For now, let's check if the response contains image data
        const responseText = json.response;

        // Check if response contains image data (base64)
        const imageMatch = responseText.match(/data:image\/[^;]+;base64,[^"'\s]+/);
        if (imageMatch) {
          setGeneratedImage(imageMatch[0]);
          addMessage("assistant", "image", "Here's your generated image!", imageMatch[0]);
        } else {
          // If no image found, show the text response as a message
          addMessage("assistant", "text", responseText);
        }
      } else if (json?.error) {
        console.error("Firebase AI returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in generateWithGemini:", e);
      addMessage("assistant", "error", "Failed to generate content", undefined, undefined, e.message);
    } finally {
      console.log("Resetting Gemini busy state");
      setGeminiBusy(false);
    }
  }, [imagePrompt, authToken, generationParams, addMessage]);

  // Gemini image edit helper
  const editWithGemini = useCallback(async () => {
    if (!authToken) {
      addMessage("system", "info", "Please sign in to use this feature");
      return;
    }
    
    // Add user message
    addMessage("user", "text", `Edit image: "${editPrompt}"`);

    console.log("Starting Gemini image edit");
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const form = new FormData();
      form.append("prompt", editPrompt);

      if (imageFile) {
        form.append("imageFile", imageFile);
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        form.append("imageBase64", b64);
        form.append("imageMimeType", mime);
      }

      const resp = await fetch("/api/gemini/edit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
        body: form,
      });

      if (!resp.ok) {
        console.error("Gemini edit API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini edit API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        addMessage("assistant", "image", "Here's your edited image!", dataUrl);
      } else if (json?.error) {
        console.error("Gemini edit API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in editWithGemini:", e);
      addMessage("assistant", "error", "Failed to edit image", undefined, undefined, e.message);
    } finally{
      console.log("Resetting Gemini busy state after edit");
      setGeminiBusy(false);
    }
  }, [editPrompt, imageFile, generatedImage, authToken, addMessage]);

  // Gemini image compose helper
  const composeWithGemini = useCallback(async () => {
    if (!authToken) {
      addMessage("system", "info", "Please sign in to use this feature");
      return;
    }
    
    // Add user message
    addMessage("user", "text", `Compose ${multipleImageFiles.length} images: "${composePrompt}"`);

    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const form = new FormData();
      form.append("prompt", composePrompt);

      // Add newly uploaded images first
      for (const file of multipleImageFiles) {
        form.append("imageFiles", file);
      }

      // Include existing image last (if any)
      if (imageFile) {
        form.append("imageFiles", imageFile);
      } else if (generatedImage) {
        // Convert base64 to blob and add as file
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        const byteCharacters = atob(b64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });

        // Create a File object from the blob
        const existingImageFile = new File([blob], "existing-image.png", {
          type: mime,
        });
        form.append("imageFiles", existingImageFile);
      }

      const resp = await fetch("/api/gemini/edit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
        body: form,
      });

      if (!resp.ok) {
        console.error(
          "Gemini compose API error:",
          resp.status,
          resp.statusText
        );
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini compose API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        addMessage("assistant", "image", "Here's your composed image!", dataUrl);
      } else if (json?.error) {
        console.error("Gemini compose API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in composeWithGemini:", e);
      addMessage("assistant", "error", "Failed to compose images", undefined, undefined, e.message);
    } finally {
      console.log("Resetting Gemini busy state after compose");
      setGeminiBusy(false);
    }
  }, [composePrompt, multipleImageFiles, imageFile, generatedImage, authToken, addMessage]);

  // Start generation based on current mode
  const startGeneration = useCallback(async () => {
    if (!canStart) return;

    if (mode === "create-video") {
      if (!authToken) {
        addMessage("system", "info", "Please sign in to use this feature");
        return;
      }
      
      // Add user message
      addMessage("user", "text", `Generate video: "${prompt}"`);

      setIsGenerating(true);
      setVideoUrl(null);

      const form = new FormData();
      form.append("prompt", prompt);
      form.append("model", selectedModel);
      if (negativePrompt) form.append("negativePrompt", negativePrompt);
      if (aspectRatio) form.append("aspectRatio", aspectRatio);

      if (imageFile || generatedImage) {
        if (imageFile) {
          form.append("imageFile", imageFile);
        } else if (generatedImage) {
          const [meta, b64] = generatedImage.split(",");
          const mime =
            meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
          form.append("imageBase64", b64);
          form.append("imageMimeType", mime);
        }
      }

      try {
        const resp = await fetch("/api/veo/generate", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
          body: form,
        });
        const json = await resp.json();
        setOperationName(json?.name || null);
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      }
    } else if (mode === "create-image") {
      // Use selected model (Imagen or Gemini)
      if (selectedModel.includes("imagen")) {
        await generateWithImagen();
      } else if (selectedModel === "gemini-2.5-flash-image") {
        // Use Firebase AI SDK for Nano Banana model
        await generateWithGemini();
      } else {
        // Use legacy Gemini API for other Gemini models
        await generateWithGemini();
      }
    } else if (mode === "edit-image") {
      await editWithGemini();
    } else if (mode === "compose-image") {
      await composeWithGemini();
    }
  }, [
    canStart,
    mode,
    prompt,
    selectedModel,
    negativePrompt,
    aspectRatio,
    imageFile,
    generatedImage,
    generateWithImagen,
    generateWithGemini,
    editWithGemini,
    composeWithGemini,
    authToken,
  ]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: operationName }),
        });
        const fresh = await resp.json();
        if (fresh?.done) {
          const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (fileUri) {
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
              },
              body: JSON.stringify({ uri: fileUri }),
            });
            const blob = await dl.blob();
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
          }
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      } finally {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl, authToken]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setGeneratedImage(null);
    }
  };

  const onPickMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const limitedFiles = imageFiles.slice(0, 10);
      setMultipleImageFiles((prevFiles) =>
        [...prevFiles, ...limitedFiles].slice(0, 10)
      );
    }
  };

  const handleTrimmedOutput = (blob: Blob) => {
    trimmedBlobRef.current = blob; // likely webm
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  };

  const handleResetTrimState = () => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    link.setAttribute("rel", "noopener");
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      // Convert base64 data URL to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      // Determine file extension from MIME type
      const mimeType = blob.type || "image/png";
      const extension = mimeType.split("/")[1] || "png";
      const safeModelName = selectedModel.replace(/[^a-zA-Z0-9-]/g, "_");
      const filename = `${safeModelName}.${extension}`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      link.setAttribute("rel", "noopener");
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Drag and drop handlers for compose mode
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const limitedFiles = imageFiles.slice(0, 10);

    if (limitedFiles.length > 0) {
      if (mode === "compose-image") {
        setMultipleImageFiles((prevFiles) =>
          [...prevFiles, ...limitedFiles].slice(0, 10)
        );
      } else if (mode === "edit-image") {
        setImageFile(limitedFiles[0]);
      }
    }
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
            <p className="mt-1 text-xs text-gray-500">Checking authentication...</p>
            <p className="mt-1 text-xs text-green-600">Development Mode: Auto-login enabled</p>
            <p className="mt-1 text-xs text-gray-400">If stuck, click below:</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              console.log('Manual bypass: showing auth screen');
              setAuthLoading(false);
            }}
          >
            Show Login Screen
          </button>
        </div>
      </div>
    );
  }

  // Show auth screen if user is not authenticated
  if (!user) {
    return <Auth onAuthStateChange={setUser} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Single unified interface - ChatGPT/Gemini style */}
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
        {/* Chat messages area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface messages={chatMessages} className="h-full" />
        </div>

        {/* Loading indicator overlay */}
        {isLoadingUI && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-3">
              {mode === "create-video" ? (
                <Film className="w-12 h-12 text-blue-500 animate-pulse" />
              ) : (
                <ImageIcon className="w-12 h-12 text-purple-500 animate-pulse" />
              )}
              <div className="text-sm font-medium text-gray-700">{modelLabel}</div>
              <div className="text-xs text-gray-500">
                {loadingMessages[loadingIndex % loadingMessages.length]}
              </div>
              <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-full animate-[shimmer_1.6s_infinite] -translate-x-full bg-blue-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      <Composer
        mode={mode}
        setMode={setMode}
        hasGeneratedImage={!!generatedImage}
        hasVideoUrl={!!videoUrl}
        prompt={prompt}
        setPrompt={setPrompt}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        canStart={canStart}
        isGenerating={isGenerating}
        startGeneration={startGeneration}
        imagePrompt={imagePrompt}
        setImagePrompt={setImagePrompt}
        editPrompt={editPrompt}
        setEditPrompt={setEditPrompt}
        composePrompt={composePrompt}
        setComposePrompt={setComposePrompt}
        geminiBusy={geminiBusy}
        resetAll={resetAll}
        downloadImage={downloadImage}
      />
    </div>
  );
};

export default VeoStudio;
