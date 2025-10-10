# Quick Reference Guide

## 🚀 Getting Started

### 1. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
# Option 1: Use same key for everything (easiest)
FIREBASE_AI_API_KEY="AIza..."
GEMINI_API_KEY="AIza..."
IMAGEN_API_KEY="AIza..."
VEO_API_KEY="AIza..."

# Option 2: Separate keys (recommended for production)
FIREBASE_AI_API_KEY="AIza...1111"  # For Firebase AI SDK
GEMINI_API_KEY="AIza...2222"       # For legacy Gemini
IMAGEN_API_KEY="AIza...3333"       # For Imagen (paid)
VEO_API_KEY="AIza...4444"          # For Veo (paid)
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test API Endpoints

```bash
./test-api-separation.sh
```

## 🎛️ UI Parameter Controls

When using **Gemini models** (Firebase AI SDK), you'll see a parameter panel on the right side with these controls:

### Temperature Slider (0.0 - 2.0)
- **0.0 - 0.5:** Focused, deterministic, factual
- **0.5 - 1.0:** Balanced creativity and coherence
- **1.0 - 1.5:** Creative, varied responses
- **1.5 - 2.0:** Maximum creativity, may be less coherent

### Top P Slider (0.0 - 1.0)
- **0.8:** Only consider top 80% of probability mass
- **0.95:** Standard setting (default)
- **0.99:** Consider almost all possibilities

### Max Tokens Dropdown
- **1,024:** Short responses (quick facts)
- **2,048:** Medium responses (summaries)
- **4,096:** Long responses (default)
- **8,192:** Very long (essays, stories)
- **16,384:** Maximum length
- **32,768:** Extended (use sparingly)

### Safety Filter Dropdown
- **🟢 Off:** No filtering (most creative)
- **🟡 Low:** Block extreme content
- **🟠 Medium:** Block moderate content
- **🔴 High:** Block most potentially harmful content

### Quick Presets
- **🎯 Precise:** Best for factual answers, math, code
- **⚖️ Balanced:** Good for general purpose
- **🎨 Creative:** Best for art, stories, brainstorming

## 🎯 Model Selection Guide

### For Image Generation

| Model | Speed | Quality | Cost | Use Case |
|-------|-------|---------|------|----------|
| **Gemini 2.5 Flash (Legacy)** | Fast | Good | Free | Quick iterations, testing |
| **Gemini 1.5 Flash (Nano Banana)** | Fast | Good | Free | **Best for learning parameters** |
| **Imagen 4.0 Fast** | Fastest | Best | Paid | Production, final output |

### For Video Generation

| Model | Speed | Quality | Cost | Use Case |
|-------|-------|---------|------|----------|
| **Veo 2.0** | Slow | Good | Paid | Basic videos |
| **Veo 3.0** | Slower | Better | Paid | High quality videos |
| **Veo 3.0 Fast** | Medium | Best | Paid | **Recommended** |

## 📝 Common Parameter Combinations

### For Factual Content (News, Documentation)
```json
{
  "temperature": 0.3,
  "topP": 0.8,
  "maxOutputTokens": 2048,
  "safetyLevel": "medium"
}
```

### For Creative Writing (Stories, Poetry)
```json
{
  "temperature": 1.5,
  "topP": 0.95,
  "maxOutputTokens": 8192,
  "safetyLevel": "off"
}
```

### For Code Generation
```json
{
  "temperature": 0.2,
  "topP": 0.9,
  "maxOutputTokens": 4096,
  "safetyLevel": "low"
}
```

### For Image Descriptions (Art)
```json
{
  "temperature": 1.2,
  "topP": 0.98,
  "maxOutputTokens": 1024,
  "safetyLevel": "off"
}
```

### For Product Descriptions (Marketing)
```json
{
  "temperature": 0.8,
  "topP": 0.92,
  "maxOutputTokens": 512,
  "safetyLevel": "medium"
}
```

## 🔧 Troubleshooting

### "Quota Exceeded" Error
1. Check which API key is being used
2. Wait for daily quota reset (midnight PST)
3. Switch to a different model
4. Upgrade to paid tier
5. Use separate keys for different services

### Parameters Not Changing Output
- Only works with **Gemini models** via Firebase AI SDK
- Legacy Gemini, Imagen, and Veo use hardcoded parameters
- Clear browser cache and reload

### UI Stuck on "Loading..."
- Click "Show Login Screen" button
- Check Firebase configuration in `.env.local`
- Verify Firebase Auth is enabled in console

### 401 Unauthorized
- Make sure you're logged in
- For testing, use `Authorization: Bearer dev` header
- Check Firebase Admin credentials

## 🎨 Example Workflows

### Workflow 1: Create Artistic Image
1. Select **"Gemini 1.5 Flash (Nano Banana API)"**
2. Set mode to **"Create Image"**
3. Adjust parameters:
   - Temperature: **1.5**
   - Top P: **0.98**
   - Safety: **Off**
4. Enter prompt: "surreal landscape with floating islands"
5. Click Generate

### Workflow 2: Generate Precise Description
1. Select **"Gemini 1.5 Flash (Nano Banana API)"**
2. Click **"🎯 Precise"** preset
3. Enter prompt: "explain quantum computing"
4. Click Generate

### Workflow 3: Create Video from Image
1. Select **"Veo 3.0 Fast"**
2. Set mode to **"Create Video"**
3. Upload or generate an image
4. Enter motion prompt: "camera pans across the scene"
5. Click Generate
6. Wait for processing (can take 2-5 minutes)

## 📊 API Key Usage Tracking

### Free Tier Limits
- **Gemini API:** 50 requests/day
- **Firebase AI SDK:** 50 requests/day
- **Resets:** Daily at midnight PST

### Recommended Setup
1. **Development:** Use same key for all services
2. **Staging:** Separate key for testing
3. **Production:** Individual keys per service

### Monitor Usage
```bash
# Check Gemini API usage
https://aistudio.google.com/app/apikey

# Check Google Cloud billing
https://console.cloud.google.com/billing
```

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| **429 Quota Exceeded** | Daily limit reached | Wait or upgrade plan |
| **400 Bad Request** | Invalid parameters | Check parameter ranges |
| **401 Unauthorized** | Not logged in | Sign in or use dev token |
| **404 Not Found** | Wrong endpoint | Check API route |
| **500 Internal Error** | API key invalid | Verify key in `.env.local` |

## 📚 Additional Resources

- **Architecture:** See `ARCHITECTURE.md` for detailed system design
- **Firebase Setup:** See `FIREBASE_SETUP_GUIDE.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`
- **Security:** See `SECURITY_FAQ.md`
- **Google AI Studio:** https://aistudio.google.com
- **Firebase Console:** https://console.firebase.google.com
- **API Pricing:** https://ai.google.dev/pricing

## 💡 Pro Tips

1. **Save Custom Presets:** Bookmark parameter combinations that work well
2. **Use Lower Tokens First:** Start with shorter responses, increase if needed
3. **Temperature Matters:** Small changes (0.1-0.2) can have big effects
4. **Safety Off for Art:** Creative content often needs safety filters off
5. **Separate Keys:** Use different keys for dev/prod environments
6. **Monitor Costs:** Set up billing alerts in Google Cloud Console
7. **Cache Results:** Save good outputs to avoid regenerating
8. **Batch Requests:** Group similar prompts to optimize quota usage

---

**Need Help?** Check the main `README.md` or open an issue on GitHub.

