# API Endpoint Reference

## 🎯 Correct Endpoints (Currently Working)

### 1. Text/Chat Generation (Firebase AI SDK)
**Endpoint:** `/api/firebase-ai/generate`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Used For:**
- Text generation
- Chat responses
- Gemini 2.0 Flash text model

**Request:**
```json
{
  "prompt": "your text prompt",
  "model": "gemini-2.0-flash",
  "temperature": 1.0,
  "topP": 0.95,
  "maxOutputTokens": 4096,
  "safetyLevel": "off"
}
```

**Response:**
```json
{
  "response": "generated text...",
  "model": "gemini-2.0-flash",
  "usage": {...}
}
```

---

### 2. Image Generation (Imagen - Paid Only)
**Endpoint:** `/api/imagen/generate`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Used For:**
- High-quality image generation
- Imagen 4.0 models
- **Requires billing/paid tier**

**Request:**
```json
{
  "prompt": "image description",
  "model": "imagen-4.0-fast-generate-001"
}
```

**Response:**
```json
{
  "image": {
    "imageBytes": "base64...",
    "mimeType": "image/png"
  }
}
```

---

### 3. Image Generation (Legacy Gemini - Free)
**Endpoint:** `/api/gemini/generate`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Used For:**
- Free image generation
- Gemini 2.5 Flash Image Preview
- Legacy endpoint

**Request:**
```json
{
  "prompt": "image description"
}
```

**Response:**
```json
{
  "image": {
    "imageBytes": "base64...",
    "mimeType": "image/png"
  }
}
```

---

### 4. Image Editing (Gemini)
**Endpoint:** `/api/gemini/edit`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Used For:**
- Edit existing images
- Image-to-image transformations

**Request:** (FormData)
```
prompt: "edit instruction"
imageFile: [File] or imageBase64: "base64..." + imageMimeType: "image/png"
```

**Response:**
```json
{
  "image": {
    "imageBytes": "base64...",
    "mimeType": "image/png"
  }
}
```

---

### 5. Video Generation (Veo)
**Endpoint:** `/api/veo/generate`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Used For:**
- Video generation from text
- Video generation from image+text

**Request:** (FormData)
```
prompt: "video description"
model: "veo-3.0-generate-001"
aspectRatio: "16:9"
negativePrompt: "things to avoid"
imageFile: [File] (optional)
```

**Response:**
```json
{
  "name": "projects/.../operations/123456789"
}
```

---

### 6. Video Status Check
**Endpoint:** `/api/veo/operation`  
**Method:** `GET`  
**Query Params:** `?name=operation_name`

**Used For:**
- Check video generation progress

**Response:**
```json
{
  "name": "...",
  "done": true/false,
  "videoUrl": "https://..."
}
```

---

### 7. Video Download
**Endpoint:** `/api/veo/download`  
**Method:** `GET`  
**Query Params:** `?name=operation_name`

**Used For:**
- Download completed video

**Response:** Binary video file (MP4)

---

## 📊 UI Model Selection Flow

### When UI selects different models:

| Selected Model | Endpoint Called | Purpose |
|---------------|----------------|---------|
| `gemini-2.0-flash` | `/api/firebase-ai/generate` | Text generation |
| `gemini-2.5-flash-image` | `/api/firebase-ai/generate` | Text (Nano Banana) |
| `gemini-2.5-flash-image-preview` | `/api/gemini/generate` | Image (Legacy) |
| `imagen-4.0-fast-generate-001` | `/api/imagen/generate` | Image (Paid) |
| `veo-3.0-generate-001` | `/api/veo/generate` | Video |

---

## 🔑 Authentication

All endpoints require authentication:

**Development:**
```
Authorization: Bearer dev-token
```

**Production:**
```
Authorization: Bearer <firebase-id-token>
```

---

## 🚨 Common Issues

### Issue: "API endpoint not found"
**Solution:** Make sure you're using the correct endpoint for the operation

### Issue: "Image not generated from Firebase AI endpoint"
**Solution:** Firebase AI SDK generates TEXT, not images. Use `/api/gemini/generate` or `/api/imagen/generate` for images.

### Issue: "Safety filter blocking content"
**Solution:** See `SAFETY_SETTINGS_EXPLAINED.md` - your settings are already configured correctly. Model-level policies cannot be bypassed.

---

## ✅ Quick Test Commands

```bash
# Test Firebase AI (Text)
curl -X POST "http://localhost:3001/api/firebase-ai/generate" \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "model": "gemini-2.0-flash", "safetyLevel": "off"}'

# Test Legacy Gemini (Image)
curl -X POST "http://localhost:3001/api/gemini/generate" \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A red apple"}'

# Test Imagen (Image - requires billing)
curl -X POST "http://localhost:3001/api/imagen/generate" \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A red apple"}'

# Test Veo (Video)
curl -X POST "http://localhost:3001/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=A bouncing ball"
```

---

*Last Updated: October 11, 2025*  
*Server running on: http://localhost:3001*

