# Google Cloud API Calls - Actual Backend Requests

## Overview

Your backend uses the `@google/genai` SDK which internally makes HTTP requests to **Google Cloud Vertex AI REST APIs**. Below are the actual API endpoints and request formats that your code calls.

---

## 🎬 Vertex AI Video Generation (Veo)

### Actual API Endpoint
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predict
```

### Headers
```http
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "instances": [
    {
      "prompt": "A beautiful sunset over the ocean with waves crashing on the shore",
      "aspectRatio": "16:9",
      "negativePrompt": "people, buildings, cars, text"
    }
  ],
  "parameters": {
    "sampleCount": 1
  }
}
```

### With Reference Image
```json
{
  "instances": [
    {
      "prompt": "Create a video showing this scene coming to life with gentle movement",
      "aspectRatio": "16:9",
      "image": {
        "bytesBase64Encoded": "iVBORw0KGgoAAAANSUhEUgAA...",
        "mimeType": "image/jpeg"
      }
    }
  ],
  "parameters": {
    "sampleCount": 1
  }
}
```

### Response Format
```json
{
  "predictions": [
    {
      "operation": "projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789"
    }
  ]
}
```

---

## 🖼️ Free Image Generation (Gemini API)

### Actual API Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key={API_KEY}
```

### Headers
```http
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "A photorealistic image of a futuristic city skyline at sunset with flying cars"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "OFF"
    }
  ]
}
```

### Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "A description of the generated image..."
          },
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "iVBORw0KGgoAAAANSUhEUgAA..."
            }
          }
        ]
      }
    }
  ]
}
```

### Note
The **Imagen API** is only available to billed/paid users. Use the **free Gemini API** above for image generation without billing requirements.

**⚠️ Safety Settings Disabled:** All safety filters are set to `"OFF"` to allow unrestricted image generation. This bypasses hate speech, dangerous content, sexually explicit content, and harassment filtering. Use responsibly.

---

## 📝 Gemini Text/Image Generation

### Actual API Endpoint
```
POST https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={API_KEY}
```

### Headers
```http
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Describe a beautiful sunset over the ocean"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 1.0,
    "topP": 0.95,
    "maxOutputTokens": 4096
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_NONE"
    }
  ]
}
```

### Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "A beautiful sunset over the ocean would feature..."
          }
        ]
      },
      "finishReason": "STOP",
      "index": 0
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 5,
    "candidatesTokenCount": 150,
    "totalTokenCount": 155
  }
}
```

---

## 🎬 Video Generation Status Check

### Actual API Endpoint
```
GET https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789
```

### Headers
```http
Authorization: Bearer {API_KEY}
```

### Response Format (In Progress)
```json
{
  "name": "projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.GenerateVideoResponse",
    "createTime": "2025-10-11T10:00:00Z",
    "updateTime": "2025-10-11T10:00:30Z"
  },
  "done": false
}
```

### Response Format (Completed)
```json
{
  "name": "projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.GenerateVideoResponse",
    "createTime": "2025-10-11T10:00:00Z",
    "updateTime": "2025-10-11T10:02:00Z"
  },
  "done": true,
  "response": {
    "videos": [
      {
        "uri": "gs://aiplatform-predictions-{PROJECT_ID}/veo-3.0-generate-001/operations/123456789/video.mp4"
      }
    ]
  }
}
```

---

## 🎬 Video Download

### Actual API Endpoint
```
GET https://storage.googleapis.com/storage/v1/b/aiplatform-predictions-{PROJECT_ID}/o/veo-3.0-generate-001%2Foperations%2F123456789%2Fvideo.mp4?alt=media
```

### Headers
```http
Authorization: Bearer {API_KEY}
```

### Response
```
Binary video data (MP4 format)
```

---

## 🔧 SDK to API Mapping

| SDK Method | Google Cloud API | Endpoint | Cost |
|------------|------------------|----------|------|
| `ai.models.generateVideos()` | Vertex AI Video Generation (Veo) | `us-central1-aiplatform.googleapis.com/v1/.../models/veo-3.0-generate-001:predict` | Paid |
| `ai.models.generateImages()` | Vertex AI Image Generation (Imagen) | `us-central1-aiplatform.googleapis.com/v1/.../models/imagen-4.0-fast-generate-001:predict` | Paid |
| `ai.models.generateContent()` | Generative Language API (Gemini) | `generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent` | Free/Paid |
| N/A | **Free Image Generation (Gemini)** | `generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent` | **Free** |

---

## 🌐 Regional Endpoints

All Vertex AI calls go to:
- **Region:** `us-central1` (Iowa, USA)
- **Base URL:** `https://us-central1-aiplatform.googleapis.com/v1/`

Gemini API calls go to:
- **Base URL:** `https://generativelanguage.googleapis.com/v1/`

---

## 🔑 Authentication

- **Imagen & Veo:** API key in header `Authorization: Bearer {API_KEY}`
- **Gemini:** API key as query parameter `?key={API_KEY}`

---

## 📊 API Limits & Billing

- **Free Image Generation (Gemini):** 50 requests/day, no billing required
- **Imagen:** Billed per image generated (paid tier only)
- **Veo:** Billed per video generated (paid tier only)
- **Gemini Text:** Free tier available, paid for higher usage
- **Rate Limits:** Vary by model and tier

---

## 🧪 Testing with Direct API Calls

### Test Free Image Generation API Directly
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "A red apple on a white background"}
      ]
    }],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    "safetySettings": [
      {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "OFF"},
      {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "OFF"},
      {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "OFF"},
      {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "OFF"}
    ]
  }' \
  | grep -o '"data": "[^"]*"' \
  | cut -d'"' -f4 \
  | base64 --decode > test_image.png
```

### Test Veo API Directly
```bash
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predict" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{"prompt": "A bouncing ball"}],
    "parameters": {"sampleCount": 1}
  }'
```

---

*Note: Replace `{PROJECT_ID}` with your actual Google Cloud project ID and `{API_KEY}` with your API key. The SDK automatically handles project ID detection and authentication.*
