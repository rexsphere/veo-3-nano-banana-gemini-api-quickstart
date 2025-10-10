import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { authenticateRequest } from "@/lib/auth-middleware";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  // Check authentication
  const authResult = await authenticateRequest(req);
  if (authResult.status === 401) {
    return authResult;
  }
  try {
    const body = await req.json();
    const prompt = (body?.prompt as string) || "";

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    // Process the response to extract the image
    let imageData = null;
    let imageMimeType = "image/png";

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log("Generated text:", part.text);
      } else if (part.inlineData) {
        imageData = part.inlineData.data;
        imageMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageData) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    return NextResponse.json({
      image: {
        imageBytes: imageData,
        mimeType: imageMimeType,
      },
    });
  } catch (error: unknown) {
    console.error("Error generating image with Gemini:", error);

    // Handle specific quota errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return NextResponse.json(
        {
          error: "🚫 Gemini API Quota Exceeded",
          message: "Your free tier quota for Gemini API has been exhausted.",
          solutions: [
            "🔄 Wait for daily quota reset (resets at midnight PST)",
            "💳 Upgrade to Google AI paid plan: https://ai.google.dev/pricing",
            "🎨 Switch to 'Imagen 4.0 Fast' model (requires billing)",
            "⏰ Retry in 16+ seconds as suggested by the API"
          ],
          details: "Free tier limits: 50 requests/day, resets daily",
          retryAfter: 16
        },
        { status: 429 }
      );
    }

    // Handle other API errors
    if (error && typeof error === 'object' && 'status' in error) {
      return NextResponse.json(
        {
          error: "Gemini API Error",
          message: `API returned status ${error.status}`,
          details: error.message || "Unknown API error"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate image", details: "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
