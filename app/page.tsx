"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Composer from "@/components/ui/Composer";
import Auth from "@/components/Auth";
import ChatInterface, { ChatMessage } from "@/components/ui/ChatInterface";
import {
  apiClient,
  APIError,
  ContentGenerationRequest,
  ImageGenerationRequest,
  ImageEditRequest,
  ImageComposeRequest,
  VideoGenerationRequest,
  SafetyLevel,
  VideoModel
} from "@/lib/api-client";

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
  const [generationParams] = useState({
    temperature: 1.0,
    topP: 0.95,
    maxOutputTokens: 4096,
    safetyLevel: "off" as SafetyLevel,
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
      setUser({ uid: 'dev-user', email: 'dev@example.com' } as User);
      setAuthToken('dev-token');
      setAuthLoading(false);
      // Set auth token for API client
      apiClient.setAuthToken('dev-token');
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    timeoutId = setTimeout(() => {
      console.log('Firebase auth timeout - forcing completion');
      setAuthLoading(false);
    }, 5000);

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
          // Set auth token for API client
          apiClient.setAuthToken(token);
          // Clear timeout on successful auth
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        } catch (error) {
          console.error('Error getting ID token:', error);
          setAuthToken(null);
          apiClient.setAuthToken(null);
        }
      } else {
        setAuthToken(null);
        apiClient.setAuthToken(null);
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
  const [, setUploadedImageUrl] = useState<string | null>(null);
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
      const request: ImageGenerationRequest = {
        prompt: imagePrompt,
        model: "imagen-4.0-fast-generate-001",
        aspectRatio: "16:9"
      };

      const response = await apiClient.generateImage(request);
      console.log("Imagen API response:", response);

      if (response?.image?.imageBytes) {
        const dataUrl = `data:${response.image.mimeType};base64,${response.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        addMessage("assistant", "image", "Here's your generated image!", dataUrl);
      }
    } catch (e: unknown) {
      console.error("Error in generateWithImagen:", e);
      if (e instanceof APIError) {
        if (e.status === 429) {
          addMessage("assistant", "error", "🚫 Quota Exceeded", undefined, undefined, e.message, ["Wait for daily quota reset", "Upgrade to paid plan", "Try again later"]);
        } else {
          addMessage("assistant", "error", "Failed to generate image with Imagen", undefined, undefined, e.message);
        }
      } else {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        addMessage("assistant", "error", "Failed to generate image with Imagen", undefined, undefined, errorMessage);
      }
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
      const request: ContentGenerationRequest = {
        prompt: imagePrompt,
        model: "gemini-2.5-flash-image",
        temperature: generationParams.temperature,
        topP: generationParams.topP,
        maxOutputTokens: generationParams.maxOutputTokens,
        safetyLevel: generationParams.safetyLevel as SafetyLevel,
      };

      const response = await apiClient.generateContent(request);
      console.log("Firebase AI response:", response);

      if (response?.response) {
        // For text responses, we might need to handle images differently
        // For now, let's check if the response contains image data
        const responseText = response.response;

        // Check if response contains image data (base64)
        const imageMatch = responseText.match(/data:image\/[^;]+;base64,[^"'\s]+/);
        if (imageMatch) {
          setGeneratedImage(imageMatch[0]);
          addMessage("assistant", "image", "Here's your generated image!", imageMatch[0]);
        } else {
          // If no image found, show the text response as a message
          addMessage("assistant", "text", responseText);
        }
      }
    } catch (e: unknown) {
      console.error("Error in generateWithGemini:", e);
      if (e instanceof APIError) {
        if (e.status === 429) {
          addMessage("assistant", "error", "🚫 Quota Exceeded", undefined, undefined, e.message, ["Wait for daily quota reset", "Upgrade to paid plan", "Try again later"]);
        } else {
          addMessage("assistant", "error", "Failed to generate content", undefined, undefined, e.message);
        }
      } else {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        addMessage("assistant", "error", "Failed to generate content", undefined, undefined, errorMessage);
      }
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
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;

      if (imageFile) {
        // Convert file to base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        imageBase64 = base64;
        imageMimeType = imageFile.type || "image/png";
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        imageBase64 = b64;
        imageMimeType = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
      }

      if (!imageBase64) {
        throw new Error("No image provided for editing");
      }

      const request: ImageEditRequest = {
        prompt: editPrompt,
        imageBase64,
        imageMimeType,
      };

      const response = await apiClient.editImage(request);
      console.log("Gemini edit API response:", response);

      if (response?.image?.imageBytes) {
        const dataUrl = `data:${response.image.mimeType};base64,${response.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        addMessage("assistant", "image", "Here's your edited image!", dataUrl);
      }
    } catch (e: unknown) {
      console.error("Error in editWithGemini:", e);
      if (e instanceof APIError) {
        addMessage("assistant", "error", "Failed to edit image", undefined, undefined, e.message);
      } else {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        addMessage("assistant", "error", "Failed to edit image", undefined, undefined, errorMessage);
      }
    } finally {
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
      const images = [];

      // Add newly uploaded images first
      for (const file of multipleImageFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        images.push({
          imageBytes: base64,
          mimeType: file.type || "image/png"
        });
      }

      // Include existing image last (if any)
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        images.push({
          imageBytes: base64,
          mimeType: imageFile.type || "image/png"
        });
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        images.push({
          imageBytes: b64,
          mimeType: meta?.split(";")?.[0]?.replace("data:", "") || "image/png"
        });
      }

      if (images.length === 0) {
        throw new Error("No images provided for composition");
      }

      const request: ImageComposeRequest = {
        prompt: composePrompt,
        images,
      };

      const response = await apiClient.composeImages(request);
      console.log("Gemini compose API response:", response);

      if (response?.image?.imageBytes) {
        const dataUrl = `data:${response.image.mimeType};base64,${response.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        addMessage("assistant", "image", "Here's your composed image!", dataUrl);
      }
    } catch (e: unknown) {
      console.error("Error in composeWithGemini:", e);
      if (e instanceof APIError) {
        addMessage("assistant", "error", "Failed to compose images", undefined, undefined, e.message);
      } else {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        addMessage("assistant", "error", "Failed to compose images", undefined, undefined, errorMessage);
      }
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

      try {
        let imageBase64: string | undefined;
        let imageMimeType: string | undefined;

        if (imageFile) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageBase64 = base64;
          imageMimeType = imageFile.type || "image/png";
        } else if (generatedImage) {
          const [meta, b64] = generatedImage.split(",");
          imageBase64 = b64;
          imageMimeType = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        }

        const request: VideoGenerationRequest = {
          prompt,
          model: selectedModel as VideoModel,
          aspectRatio,
          negativePrompt: negativePrompt || undefined,
          imageBase64,
          imageMimeType,
        };

        const response = await apiClient.generateVideo(request);
        setOperationName(response.operationId);
      } catch (e: unknown) {
        console.error("Video generation error:", e);
        if (e instanceof APIError) {
          addMessage("assistant", "error", "Failed to start video generation", undefined, undefined, e.message);
        } else {
          const errorMessage = e instanceof Error ? e.message : "Unknown error";
          addMessage("assistant", "error", "Failed to start video generation", undefined, undefined, errorMessage);
        }
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
    addMessage,
  ]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const status = await apiClient.getVideoStatus(operationName);
        
        if (status.status === "completed" && status.videoUrl) {
          // Download the video
          const blob = await apiClient.downloadVideo(operationName);
          videoBlobRef.current = blob;
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          originalVideoUrlRef.current = url;
          setIsGenerating(false);
          return;
        } else if (status.status === "failed") {
          console.error("Video generation failed:", status.errorMessage);
          addMessage("assistant", "error", "Video generation failed", undefined, undefined, status.errorMessage);
          setIsGenerating(false);
          return;
        }
        
        // Continue polling if still in progress
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (e: unknown) {
        console.error("Video polling error:", e);
        if (e instanceof APIError) {
          addMessage("assistant", "error", "Failed to check video status", undefined, undefined, e.message);
        } else {
          const errorMessage = e instanceof Error ? e.message : "Unknown error";
          addMessage("assistant", "error", "Failed to check video status", undefined, undefined, errorMessage);
        }
        setIsGenerating(false);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl, authToken, addMessage]);


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
    } catch (error: unknown) {
      console.error("Error downloading image:", error);
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
                <div className="w-12 h-12 text-blue-500 animate-pulse">🎬</div>
              ) : (
                <div className="w-12 h-12 text-purple-500 animate-pulse">🖼️</div>
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
