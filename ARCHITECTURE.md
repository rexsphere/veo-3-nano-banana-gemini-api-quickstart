# Architecture & API Key Separation Guide

## 🎯 Overview

This application uses a **separated API key architecture** to provide better quota management, security, and flexibility. Each service can use its own API key, allowing you to:

- Track usage per service
- Rotate keys independently
- Manage quotas separately
- Upgrade specific services without affecting others

## 🔑 API Key Separation

### Environment Variables

```bash
# Firebase AI SDK (Nano Banana API) - Gemini via Firebase
FIREBASE_AI_API_KEY="your-key-here"

# Legacy Gemini API - Direct Google AI Studio calls
GEMINI_API_KEY="your-key-here"

# Imagen API - Image generation (paid tier)
IMAGEN_API_KEY="your-key-here"

# Veo API - Video generation (paid tier)
VEO_API_KEY="your-key-here"
```

### Fallback Chain

Each API route uses a **fallback pattern** for convenience:

| Service | Primary Key | Fallback |
|---------|------------|----------|
| Firebase AI SDK | `FIREBASE_AI_API_KEY` | `GEMINI_API_KEY` |
| Gemini (Legacy) | `GEMINI_API_KEY` | *(none)* |
| Imagen | `IMAGEN_API_KEY` | `GEMINI_API_KEY` |
| Veo | `VEO_API_KEY` | `GEMINI_API_KEY` |

**Tip:** You can use the same key for all services initially, then separate them as your usage grows.

## 📡 API Routes & Backends

### 1. Firebase AI SDK Route
**Endpoint:** `/api/firebase-ai/generate`  
**Key:** `FIREBASE_AI_API_KEY`  
**Backend:** `GoogleAIBackend` (Google AI Studio)  
**Models:** `gemini-2.0-flash`, `gemini-2.5-flash-image`  
**Features:**
- ✅ Dynamic parameters (temperature, topP, maxTokens)
- ✅ Safety level controls
- ✅ Free tier: 50 requests/day
- ✅ UI parameter controls

**Request Body:**
```json
{
  "prompt": "your prompt here",
  "model": "gemini-2.0-flash",
  "temperature": 1.0,
  "topP": 0.95,
  "maxOutputTokens": 4096,
  "safetyLevel": "off"
}
```

### 2. Legacy Gemini Route
**Endpoint:** `/api/gemini/generate`  
**Key:** `GEMINI_API_KEY`  
**Backend:** `@google/genai` SDK  
**Models:** `gemini-2.5-flash-image-preview`  
**Features:**
- ⚙️ Hardcoded parameters (in route)
- 🟢 Free tier: 50 requests/day

### 3. Imagen Route
**Endpoint:** `/api/imagen/generate`  
**Key:** `IMAGEN_API_KEY`  
**Backend:** `@google/genai` SDK  
**Models:** `imagen-4.0-fast-generate-001`  
**Features:**
- 💳 Paid tier only
- 🚀 Faster generation
- 🎨 Higher quality

### 4. Veo Route
**Endpoint:** `/api/veo/generate`  
**Key:** `VEO_API_KEY`  
**Backend:** `@google/genai` SDK  
**Models:** `veo-3.0-generate-001`, `veo-3.0-fast-generate-001`, `veo-2.0-generate-001`  
**Features:**
- 💳 Paid tier only
- 🎬 Video generation
- 🖼️ Image-to-video

## 🎛️ Dynamic Parameters (Firebase AI SDK)

### UI Controls

When using Gemini models via Firebase AI SDK, users can adjust:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Temperature** | 0.0 - 2.0 | 1.0 | Randomness (0=focused, 2=creative) |
| **Top P** | 0.0 - 1.0 | 0.95 | Nucleus sampling threshold |
| **Max Tokens** | 1024 - 32768 | 4096 | Maximum response length |
| **Safety Level** | off/low/medium/high | off | Content filtering |

### Presets

- **🎯 Precise:** `temp=0.3, topP=0.8, tokens=2048, safety=medium`
- **⚖️ Balanced:** `temp=1.0, topP=0.95, tokens=4096, safety=low`
- **🎨 Creative:** `temp=1.8, topP=0.98, tokens=8192, safety=off`

### Safety Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **Off** | No filtering | Creative content, art |
| **Low** | Block extreme content | General use |
| **Medium** | Block moderate+ | Safe-for-work content |
| **High** | Block most | Educational, family-friendly |

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (UI)                        │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Model Selector │  │ Parameter Controls│  │  Composer   │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ Firebase ID Token
                        │ + Generation Params
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │ /api/firebase-ai │  │  /api/gemini    │  │ /api/veo   │ │
│  │  (dynamic params)│  │  (hardcoded)    │  │            │ │
│  └────────┬─────────┘  └────────┬────────┘  └─────┬──────┘ │
│           │                     │                  │         │
│  ┌────────▼─────────────────────▼──────────────────▼──────┐ │
│  │         Authentication Middleware (Firebase Admin)      │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ API Keys
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Firebase AI  │  │  Gemini API  │  │  Imagen/Veo API  │  │
│  │ (Google AI)  │  │ (AI Studio)  │  │  (Vertex AI)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security

### Authentication Flow

1. **User Login** → Firebase Client SDK
2. **Get ID Token** → `user.getIdToken()`
3. **API Request** → Include `Authorization: Bearer <token>`
4. **Middleware Verification** → Firebase Admin SDK verifies token
5. **API Execution** → Uses service-specific API key

### Development Bypass

For local testing, you can use `Authorization: Bearer dev` to bypass Firebase auth:

```bash
curl -X POST http://localhost:3000/api/firebase-ai/generate \
  -H "Authorization: Bearer dev" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

**⚠️ Only works in `NODE_ENV=development`**

## 🧪 Testing

### Test Firebase AI with Parameters

```bash
curl -X POST http://localhost:3000/api/firebase-ai/generate \
  -H "Authorization: Bearer dev" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "describe a sunset",
    "model": "gemini-2.0-flash",
    "temperature": 1.5,
    "topP": 0.95,
    "maxOutputTokens": 200,
    "safetyLevel": "off"
  }'
```

### Test Legacy Gemini

```bash
curl -X POST http://localhost:3000/api/gemini/generate \
  -H "Authorization: Bearer dev" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat on a cloud"}'
```

## 📊 Model Comparison

| Model | API | Speed | Quality | Cost | Parameters |
|-------|-----|-------|---------|------|------------|
| **Gemini 2.0 Flash (Firebase)** | Firebase AI | Fast | Good | Free | ✅ Dynamic |
| **Gemini 2.5 Flash (Legacy)** | Gemini API | Fast | Good | Free | ❌ Hardcoded |
| **Imagen 4.0 Fast** | Imagen API | Fastest | Best | Paid | ❌ Hardcoded |
| **Veo 3.0** | Veo API | Slow | Best | Paid | ❌ Hardcoded |

## 🚀 Best Practices

### 1. Key Rotation
- Use separate keys for dev/staging/prod
- Rotate keys periodically
- Revoke compromised keys immediately

### 2. Quota Management
- Monitor usage per service
- Set up billing alerts
- Use free tier for development
- Separate keys for different projects

### 3. Parameter Tuning
- Start with "Balanced" preset
- Use "Precise" for factual content
- Use "Creative" for art/stories
- Adjust safety level based on content type

### 4. Error Handling
- Check for 429 (quota exceeded) responses
- Implement retry logic with exponential backoff
- Show user-friendly error messages
- Log errors for debugging

## 📝 Migration Guide

### From Hardcoded to Dynamic Parameters

**Before:**
```typescript
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  maxOutputTokens: 32768,
};
```

**After:**
```typescript
const { temperature, topP, maxOutputTokens } = req.body;
const generationConfig = {
  temperature: Number(temperature) || 1,
  topP: Number(topP) || 0.95,
  maxOutputTokens: Number(maxOutputTokens) || 4096,
};
```

### Adding New API Routes

1. Create route file in `/app/api/<service>/generate/route.ts`
2. Add service-specific API key to `env.example`
3. Import `authenticateRequest` middleware
4. Use service-specific key with fallback
5. Accept dynamic parameters from request body
6. Add to `ARCHITECTURE.md`

## 🎯 Next Steps

- [ ] Add rate limiting per user
- [ ] Implement usage analytics
- [ ] Add model switching in UI
- [ ] Cache responses for duplicate prompts
- [ ] Add webhook support for long-running tasks
- [ ] Implement batch processing
- [ ] Add streaming responses
- [ ] Support multi-modal inputs (audio, video)

---

**Last Updated:** October 10, 2025  
**Version:** 2.0.0  
**Maintainer:** Veo 3 Nano Banana Team

