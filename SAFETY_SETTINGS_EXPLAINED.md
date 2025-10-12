# Safety Settings - Current Configuration

## ✅ Current Setup (CORRECT)

Your application **already has safety settings disabled** by default. Here's how it works:

### 1. UI Default Settings
**File:** `app/page.tsx` (line 41-46)
```typescript
const [generationParams, setGenerationParams] = useState<GenerationParams>({
  temperature: 1.0,
  topP: 0.95,
  maxOutputTokens: 4096,
  safetyLevel: "off",  // ← SAFETY IS OFF BY DEFAULT
});
```

### 2. Backend Implementation  
**File:** `app/api/firebase-ai/generate/route.ts` (line 65-78)
```typescript
const safetyThresholdMap = {
  off: HarmBlockThreshold.OFF,         // ← When safetyLevel = "off"
  low: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  medium: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  high: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
};
const threshold = safetyThresholdMap[safetyLevel] || HarmBlockThreshold.OFF;

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold },
];
```

When `safetyLevel = "off"`, all four safety categories are set to `HarmBlockThreshold.OFF`.

---

## 🔄 How It Flows

1. **UI** sends request with `safetyLevel: "off"` (default)
2. **Backend** (`/api/firebase-ai/generate`) receives the parameter
3. **Backend** sets all safety thresholds to `OFF`
4. **Google API** receives the request with safety disabled

---

## ⚠️ Important Limitations

### Model-Level Safety (Cannot Be Fully Disabled)
Even with safety settings set to `OFF`, **Gemini models have built-in safety mechanisms** that cannot be completely disabled. The model itself may still refuse to generate certain types of content based on:

- Google's usage policies
- Model training constraints
- Terms of Service requirements

### What `safetySettings: OFF` Does
- **Disables API-level filtering**: Google won't automatically block/filter responses
- **Removes probability thresholds**: Won't reject based on safety probability scores
- **Still respects policies**: Model may internally refuse prohibited content

---

## 🚨 The Safety Warning You're Seeing

When you see messages like:
> "This query violates the policy regarding the generation of sexual content..."

This is **NOT** from the safety settings API filter. This is the **model itself** refusing to generate that type of content based on its internal training and Google's usage policies.

### Why This Happens
1. ✅ Safety filters ARE disabled in your API requests
2. ✅ Your backend code is correct
3. ❌ The AI model has internal content policies that cannot be overridden

---

## 📊 What You Can Control

| Setting | Can Control | Effect |
|---------|-------------|--------|
| Safety API Filters | ✅ YES | Prevents automatic blocking by API |
| Model Training Policies | ❌ NO | Built into the model itself |
| Google Usage Policies | ❌ NO | Terms of Service restrictions |

---

## 🎯 Solutions

### Option 1: Rephrase Prompts
Modify prompts to be less explicit while achieving similar results:
- ❌ "a woman in a bikini"
- ✅ "a person at the beach"
- ✅ "beachwear fashion photography"

### Option 2: Use Different Models
Some models are more permissive than others:
- **Gemini 2.0 Flash**: More restrictive
- **Imagen**: May have different policies (requires billing)
- **Third-party models**: Consider alternatives outside Google ecosystem

### Option 3: Contact Google
For legitimate business use cases requiring less restrictive content generation:
- Apply for increased access through Google Cloud support
- Explain your use case and business needs
- May require enterprise agreement

---

## 🧪 Testing Current Configuration

Run this to verify safety settings are disabled:

```bash
curl -X POST "http://localhost:3001/api/firebase-ai/generate" \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test prompt",
    "model": "gemini-2.5-flash-image",
    "safetyLevel": "off"
  }'
```

You should see in the backend logs that `HarmBlockThreshold.OFF` is being used.

---

## ✅ Verification Checklist

- [x] UI default `safetyLevel: "off"` ✓
- [x] Backend receives `safetyLevel` parameter ✓
- [x] Backend maps "off" to `HarmBlockThreshold.OFF` ✓
- [x] All 4 safety categories set to OFF ✓
- [x] Settings passed to Google API ✓

**Your configuration is correct.** The refusals you're seeing are from the model's internal policies, not the API safety filters.

---

## 📝 Key Takeaway

**Your code is already configured correctly with all safety filters disabled.** The warnings you're experiencing are from **Gemini's built-in content policies** which cannot be bypassed through API settings alone.

This is intentional by Google to ensure compliance with their usage policies and applicable laws.

---

*Last Updated: October 11, 2025*

