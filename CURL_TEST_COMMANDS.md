# Curl Commands for Testing Google APIs

## Prerequisites

1. **Start the development server:**
   ```bash
   cd veo-3-nano-banana-gemini-api-quickstart
   npm run dev
   ```
   Server will run on `http://localhost:3000`

2. **Set environment variables:**
   - Copy `env.example` to `.env.local`
   - Fill in your API keys (at minimum `GEMINI_API_KEY` for testing)
   - For production testing, you'll need `IMAGEN_API_KEY` and `VEO_API_KEY`

## Authentication

In development mode, you can use:
- `Authorization: Bearer dev-token` (recommended)
- Or omit the header entirely (development bypass)

For production, you'll need a valid Firebase ID token.

---

## 🎬 Video Generation (Veo API)

### Basic Video Generation

```bash
curl -X POST "http://localhost:3000/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=A beautiful sunset over the ocean with waves crashing on the shore"
```

### Video Generation with Custom Parameters

```bash
curl -X POST "http://localhost:3000/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=A serene mountain landscape with flowing water and wildlife" \
  -F "model=veo-3.0-generate-001" \
  -F "aspectRatio=16:9" \
  -F "negativePrompt=people, buildings, cars, text"
```

### Video Generation with Reference Image

```bash
curl -X POST "http://localhost:3000/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=Create a video showing this scene coming to life with gentle movement" \
  -F "imageFile=@/path/to/your/image.jpg" \
  -F "aspectRatio=16:9"
```

### Video Generation with Base64 Image

```bash
curl -X POST "http://localhost:3000/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=Animate this landscape with flowing water and moving clouds" \
  -F "imageBase64=data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." \
  -F "imageMimeType=image/jpeg"
```

### Response Format
```json
{
  "name": "projects/your-project/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789"
}
```

---

## 🖼️ Image Generation (Free Gemini API)

### Basic Image Generation

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=YOUR_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "A photorealistic image of a futuristic city skyline at sunset with flying cars"}
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
  | base64 --decode > generated_city.png
```

### Creative Image Prompts

```bash
# Nature scene
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=YOUR_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "A mystical forest with glowing mushrooms and fireflies, fantasy art, highly detailed"}
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
  | base64 --decode > mystical_forest.png

# Abstract art
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=YOUR_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "Abstract geometric shapes in vibrant colors, modern art, clean lines, minimalistic design"}
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
  | base64 --decode > abstract_art.png

# Product visualization
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=YOUR_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "A sleek smartphone with holographic display, futuristic design, studio lighting, product photography"}
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
  | base64 --decode > smartphone.png
```

### ⚠️ Safety Settings Disabled
**Important:** All safety filters are disabled (`threshold: "OFF"`) to allow unrestricted image generation. This includes:
- Hate speech filtering
- Dangerous content filtering
- Sexually explicit content filtering
- Harassment filtering

Use with caution and ensure compliance with your organization's content policies.

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

---

## 🔍 Checking Video Generation Status

After starting a video generation, check its status using the operation name:

```bash
# Replace OPERATION_NAME with the name returned from the generate request
curl -X GET "http://localhost:3000/api/veo/operation?name=projects/your-project/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789" \
  -H "Authorization: Bearer dev-token"
```

---

## 📥 Downloading Generated Videos

Once video generation is complete, download the video:

```bash
# Replace OPERATION_NAME with the operation name
curl -X GET "http://localhost:3000/api/veo/download?name=projects/your-project/locations/us-central1/publishers/google/models/veo-3.0-generate-001/operations/123456789" \
  -H "Authorization: Bearer dev-token" \
  --output generated_video.mp4
```

---

## 🧪 Testing Scripts

### Quick Test Script (Bash)

Create a file `test-apis.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Google APIs"
echo "======================"

# Test Imagen API
echo ""
echo "🖼️  Testing Imagen API..."
curl -X POST "http://localhost:3000/api/imagen/generate" \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A simple test image of a red apple"}' \
  -w "\nStatus: %{http_code}\n"

# Test Veo API
echo ""
echo "🎬 Testing Veo API..."
curl -X POST "http://localhost:3000/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=A simple test video of a bouncing ball" \
  -w "\nStatus: %{http_code}\n"
```

Make it executable and run:
```bash
chmod +x test-apis.sh
./test-apis.sh
```

---

## 🚨 Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized: No token provided"
}
```

**400 Bad Request:**
```json
{
  "error": "Missing prompt"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate image"
}
```

---

## 🔧 Troubleshooting

1. **"API key not configured"**: Make sure you have `GEMINI_API_KEY` set in `.env.local`

2. **"Unauthorized"**: In development, use `Bearer dev-token` or omit auth header

3. **"Expected multipart/form-data"**: Make sure you're using `-F` flags for Veo API

4. **"Expected application/json"**: Make sure you set `Content-Type: application/json` for Imagen API

5. **Connection refused**: Make sure the dev server is running (`npm run dev`)

---

## 📊 API Limits & Quotas

- **Free Tier**: 50 requests/day per API key
- **Imagen/Veo**: Require paid tier for access
- **Rate Limits**: Vary by service and tier

---

## 🎯 Production Usage

For production deployment:

1. **Replace `dev-token`** with actual Firebase ID tokens
2. **Use separate API keys** for each service (`IMAGEN_API_KEY`, `VEO_API_KEY`)
3. **Set up proper authentication** in your client application
4. **Configure CORS** if needed for your domain

---

*Last updated: October 11, 2025*
