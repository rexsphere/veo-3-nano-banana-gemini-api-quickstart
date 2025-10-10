import { NextResponse } from "next/server";
import app from "@/lib/firebase";
import {
  GenerationConfig,
  getGenerativeModel,
  getAI,
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
  GoogleAIBackend,
} from "firebase/ai";
import { authenticateRequest } from "@/lib/auth-middleware";
import { logApiRequest } from "@/lib/logger";

export async function POST(req: Request) {
  // Start logging
  const log = logApiRequest(req, "Firebase AI SDK", undefined, {
    service: "firebase-ai",
  });

  // Check authentication
  const authResult = await authenticateRequest(req);
  if (authResult.status === 401) {
    log.end(401);
    return authResult;
  }

  try {
    const body = await req.json();
    const {
      prompt,
      model = "gemini-2.0-flash",
      // Dynamic generation parameters (from UI or defaults)
      temperature = 1,
      topP = 0.95,
      maxOutputTokens = 32768,
      // Safety settings (default: all OFF for creative content)
      safetyLevel = "off" // "off" | "low" | "medium" | "high"
    } = body;
    
    // Log request parameters
    log.end(0); // Close auth log
    const genLog = logApiRequest(req, "Firebase AI SDK", undefined, {
      model,
      temperature,
      topP,
      maxOutputTokens,
      safetyLevel,
      promptLength: prompt?.length || 0,
    });

    if (!prompt) {
      genLog.end(400);
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Build generation config from request params (no hardcoding!)
    const generationConfig: GenerationConfig = {
      temperature: Number(temperature),
      topP: Number(topP),
      maxOutputTokens: Number(maxOutputTokens),
    };

    // Map safety level to threshold
    const safetyThresholdMap = {
      off: HarmBlockThreshold.OFF,
      low: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      medium: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      high: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    };
    const threshold = safetyThresholdMap[safetyLevel as keyof typeof safetyThresholdMap] || HarmBlockThreshold.OFF;

    const safetySettings: SafetySetting[] = [
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold },
    ];

    // Initialize Firebase AI with Google AI backend for Gemini models
    // Use a dedicated key for Firebase AI SDK (separate from legacy Gemini key)
    const apiKey = process.env.FIREBASE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "FIREBASE_AI_API_KEY (or GEMINI_API_KEY) is not set" }, { status: 500 });
    }
    const ai = getAI(app, {
      backend: new (GoogleAIBackend as any)({ apiKey })
    });
    console.log("Firebase AI initialized with Google AI backend");

    // Map model names to Firebase AI SDK compatible names (avoid retired models)
    const validModel = (() => {
      if (model === "gemini-2.5-flash-image" || model === "gemini-2.5-flash-image-preview") {
        return "gemini-2.0-flash"; // Current, supported model
      }
      if (model === "gemini-1.5-pro" || model === "gemini-1.5-flash") {
        return "gemini-2.0-flash"; // 1.5 models are retired
      }
      return model;
    })();

    const generativeModel = getGenerativeModel(ai, {
      model: validModel,
      generationConfig,
      safetySettings,
    });

    // For multi-turn responses, start a chat session
    const chat = generativeModel.startChat();

    // Send the message
    const result = await chat.sendMessage([prompt]);

    // Extract text response
    const responseText = result.response.text();
    const usage = result.response.usageMetadata;

    // Log successful response
    genLog.end(200);

    return NextResponse.json({
      response: responseText,
      model,
      usage,
    });

  } catch (error: any) {
    // Log error
    genLog.end(error?.status || 500, error);

    // Handle specific quota errors
    if (error?.status === 429 || error?.message?.includes("quota")) {
      return NextResponse.json(
        {
          error: "🚫 Firebase AI Quota Exceeded",
          message: "Your Firebase AI quota has been exhausted.",
          solutions: [
            "🔄 Wait for quota reset",
            "💳 Upgrade your Firebase plan",
            "⏰ Retry later"
          ]
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate response", details: error?.message },
      { status: 500 }
    );
  }
}
