# Logging System - Complete Guide

## 📋 Overview

Your application has a **comprehensive logging system** that tracks:
- ✅ All API requests and responses
- ✅ Input prompts (full text)
- ✅ Generated outputs (full text)
- ✅ Request duration and performance
- ✅ Errors and safety warnings
- ✅ User authentication events

---

## 🔍 What's Being Logged

### From Your Terminal Output (Lines 45-93):

```
ℹ️ [Firebase AI SDK] POST /api/firebase-ai/generate {
  model: 'gemini-2.5-flash-image',
  temperature: 1,
  topP: 0.95,
  maxOutputTokens: 4096,
  safetyLevel: 'off',              ← Safety is OFF
  promptLength: 19,
  prompt: 'laptop image in see'     ← INPUT LOGGED
}

Firebase AI initialized with Google AI backend

ℹ️ [Firebase AI SDK] POST /api/firebase-ai/generate - 200 {
  timestamp: '2025-10-11T06:33:51.067Z',
  duration: '2597ms',               ← How long it took
  statusCode: 200,                  ← Success
  ...
}

ℹ️ [Firebase AI SDK] Response Generated {
  responseLength: 450,
  response: "I'm sorry, but I can't access..."  ← OUTPUT LOGGED
  model: 'gemini-2.5-flash-image',
  usage: { promptTokens: 5, responseTokens: 120 }
}
```

---

## 📊 Viewing Logs

### Method 1: Real-Time Console (Current)
Logs are displayed in your terminal where the dev server is running.

**Location:** Terminal output in real-time  
**Retention:** Visible until terminal is cleared  
**Format:** Formatted console output with emojis

### Method 2: Via API Endpoint
Access logs programmatically through the REST API.

**Endpoint:** `GET http://localhost:3001/api/logs`

**Examples:**

```bash
# Get last 10 logs
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?limit=10"

# Get only Firebase AI logs
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?service=Firebase%20AI%20SDK&limit=20"

# Get only errors
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?level=error&limit=50"

# Export as CSV
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?format=csv&limit=100" \
  -o logs.csv
```

### Method 3: Browser DevTools
Open your browser's developer console while using the app to see logs.

---

## 🗂️ Log Storage

### Current Setup: In-Memory Storage
- **Location:** Server RAM
- **Capacity:** Last 1000 log entries
- **Persistence:** Lost on server restart
- **Performance:** Very fast, no disk I/O

### Why In-Memory?
✅ Development-friendly - instant access  
✅ No database setup required  
✅ Automatic cleanup (keeps last 1000)  
⚠️ Lost on restart (by design for security)

---

## 📝 Log Entry Structure

Each log entry contains:

```typescript
{
  timestamp: "2025-10-11T06:33:51.067Z",  // When it happened
  level: "info",                           // info, warn, error, debug
  service: "Firebase AI SDK",              // Which service
  action: "POST /api/firebase-ai/generate - 200",  // What happened
  userId: undefined,                       // User (if authenticated)
  duration: 2597,                          // Response time (ms)
  statusCode: 200,                         // HTTP status
  details: {
    prompt: "laptop image in see",         // ← Full input
    response: "I'm sorry but...",          // ← Full output
    model: "gemini-2.5-flash-image",
    temperature: 1.0,
    safetyLevel: "off",
    usage: {
      promptTokens: 5,
      responseTokens: 120,
      totalTokens: 125
    }
  }
}
```

---

## 🔎 Finding Specific Requests

### Example: Finding your "laptop image in see" request

Look in the terminal output for:
1. Search for the timestamp around `12:03` (your request time)
2. Look for `promptLength: 19` (matches "laptop image in see")
3. Find the corresponding response log

**Your Request Logged:**
```
ℹ️ [Firebase AI SDK] POST /api/firebase-ai/generate {
  promptLength: 19,
  prompt: 'laptop image in see'  ← HERE
}
```

**Response Logged:**
```
ℹ️ [Firebase AI SDK] Response Generated {
  response: "I'm sorry, but I can't access or process images..."  ← HERE
}
```

---

## 🚨 Why You Got That Response

From your logs, the model returned:
> "I'm sorry, but I can't access or process images, so I'm unable to view an image and provide information about it."

### Analysis:
1. ✅ **Request was accepted** - statusCode: 200
2. ✅ **Safety filters OFF** - safetyLevel: 'off'
3. ✅ **Model responded** - No API-level blocking
4. ❌ **Model misunderstood** - Interpreted "laptop image in see" as requesting to analyze an image

### The Issue:
The prompt **"laptop image in see"** is ambiguous. The AI model interpreted it as:
- "show me an image" or "analyze this image"

But you likely meant:
- "generate an image of a laptop" or "create a laptop image"

---

## 💡 Solutions

### Better Prompts:
```
❌ "laptop image in see"
✅ "Generate an image of a laptop"
✅ "Create a laptop image"
✅ "Show me a laptop"
✅ "A modern laptop on a desk"
```

### Why It Matters:
- AI models are sensitive to phrasing
- "image in see" sounds like "show me an image you see"
- Clear, descriptive prompts = better results

---

## 📈 Log Statistics

Get statistics about your API usage:

```bash
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs" | jq '.stats'
```

**Returns:**
```json
{
  "total": 150,                    // Total requests
  "byLevel": {
    "info": 140,
    "error": 10
  },
  "byService": {
    "Firebase AI SDK": 120,
    "Imagen API": 20,
    "Veo API": 10
  },
  "avgDuration": 2500,             // Average 2.5 seconds
  "errors": 10
}
```

---

## 🧹 Managing Logs

### Clear All Logs
```bash
curl -X DELETE \
  -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs"
```

### Export Logs Before Clearing
```bash
# Save as JSON
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?limit=1000" \
  > logs-$(date +%Y%m%d-%H%M%S).json

# Save as CSV
curl -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?format=csv&limit=1000" \
  > logs-$(date +%Y%m%d-%H%M%S).csv
```

---

## 🔒 Privacy & Security

### What's Logged:
- ✅ Prompts (for debugging)
- ✅ Responses (for debugging)
- ✅ API parameters
- ✅ Performance metrics

### Security Measures:
- 🔐 Logs require authentication to access
- 🗑️ Auto-cleared on restart
- 💾 Stored in memory (not on disk)
- 🔢 Limited to 1000 entries max

### Production Recommendations:
1. **Disable prompt/response logging** in production
2. **Use external logging service** (Datadog, Sentry, etc.)
3. **Implement log rotation**
4. **Add PII redaction**

---

## 🎯 Quick Reference Commands

```bash
# View last 10 logs
curl -s -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?limit=10" | jq '.logs'

# Search for specific prompt
curl -s -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?limit=100" | \
  jq '.logs[] | select(.details.prompt != null)'

# View only responses
curl -s -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?limit=100" | \
  jq '.logs[] | select(.details.response != null) | {prompt: .details.prompt, response: .details.response}'

# Get error logs only
curl -s -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs?level=error&limit=50" | jq '.logs'

# Get stats
curl -s -H "Authorization: Bearer dev-token" \
  "http://localhost:3001/api/logs" | jq '.stats'
```

---

## ✅ Your Current Issue - Explained

Based on your logs:

**Input:** `"laptop image in see"`  
**Output:** Model refused, thinking you wanted it to analyze an image  
**Safety:** OFF (working correctly)  
**Issue:** Ambiguous prompt wording

**Fix:** Use clearer prompts like:
- "Generate an image of a modern laptop"
- "Create a laptop product photo"
- "A sleek silver laptop on a white desk"

The logging system is working perfectly - it captured everything! 🎉

---

*Last Updated: October 11, 2025*

