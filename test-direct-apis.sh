#!/bin/bash

# Direct Google Cloud API Testing Script
# This tests the actual API endpoints that your backend calls

echo "🔍 Direct Google Cloud API Testing"
echo "=================================="

# Check for required environment variables
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Please set GOOGLE_API_KEY environment variable"
    echo "   export GOOGLE_API_KEY='your-api-key-here'"
    exit 1
fi

if [ -z "$GOOGLE_PROJECT_ID" ]; then
    echo "❌ Please set GOOGLE_PROJECT_ID environment variable"
    echo "   export GOOGLE_PROJECT_ID='your-project-id'"
    exit 1
fi

echo "✅ API Key: ${GOOGLE_API_KEY:0:10}..."
echo "✅ Project ID: $GOOGLE_PROJECT_ID"
echo ""

# Test Free Gemini Image Generation API directly
echo "🖼️  Testing Free Gemini Image Generation API (Direct Call)..."
GEMINI_IMG_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "A simple red apple on a white background"}
      ]
    }],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    "safetySettings": [
      {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "OFF"},
      {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "OFF"},
      {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "OFF"},
      {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "OFF"}
    ]
  }')

GEMINI_IMG_HTTP_STATUS=$(echo "$GEMINI_IMG_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
GEMINI_IMG_BODY=$(echo "$GEMINI_IMG_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$GEMINI_IMG_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Gemini Image Generation: SUCCESS"
    IMAGE_DATA=$(echo "$GEMINI_IMG_BODY" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data // empty' 2>/dev/null)
    if [ -n "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
        echo "📄 Image generated successfully (base64 length: ${#IMAGE_DATA})"
        # Save image for verification
        echo "$IMAGE_DATA" | base64 -d > test_gemini_image.png 2>/dev/null && echo "💾 Saved as test_gemini_image.png"
    fi
else
    echo "❌ Gemini Image Generation: FAILED (Status: $GEMINI_IMG_HTTP_STATUS)"
    echo "📄 Error: $GEMINI_IMG_BODY"
fi

echo ""

# Test Veo API directly (this will start generation)
echo "🎬 Testing Veo API (Direct Vertex AI Call)..."
VEO_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/$GOOGLE_PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predict" \
  -H "Authorization: Bearer $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{"prompt": "A simple bouncing ball animation"}],
    "parameters": {"sampleCount": 1}
  }')

VEO_HTTP_STATUS=$(echo "$VEO_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
VEO_BODY=$(echo "$VEO_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$VEO_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Veo API: SUCCESS (Generation started)"
    OPERATION_NAME=$(echo "$VEO_BODY" | jq -r '.predictions[0].operation // empty' 2>/dev/null)
    if [ -n "$OPERATION_NAME" ] && [ "$OPERATION_NAME" != "null" ]; then
        echo "📄 Operation: $OPERATION_NAME"

        # Extract operation ID for status checking
        OPERATION_ID=$(echo "$OPERATION_NAME" | grep -o 'operations/[^"]*' | cut -d'/' -f2)
        echo "🆔 Operation ID: $OPERATION_ID"

        echo ""
        echo "🔍 To check status, run:"
        echo "curl -H 'Authorization: Bearer $GOOGLE_API_KEY' \\"
        echo "  'https://us-central1-aiplatform.googleapis.com/v1/$OPERATION_NAME'"
    fi
else
    echo "❌ Veo API: FAILED (Status: $VEO_HTTP_STATUS)"
    echo "📄 Error: $VEO_BODY"
fi

echo ""

# Test Gemini API directly
echo "📝 Testing Gemini API (Direct Generative Language API Call)..."
GEMINI_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Say hello in exactly 3 words"}]
    }],
    "generationConfig": {
      "temperature": 0.1,
      "maxOutputTokens": 50
    }
  }')

GEMINI_HTTP_STATUS=$(echo "$GEMINI_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
GEMINI_BODY=$(echo "$GEMINI_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$GEMINI_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Gemini API: SUCCESS"
    TEXT_RESPONSE=$(echo "$GEMINI_BODY" | jq -r '.candidates[0].content.parts[0].text // empty' 2>/dev/null)
    if [ -n "$TEXT_RESPONSE" ] && [ "$TEXT_RESPONSE" != "null" ]; then
        echo "📄 Response: \"$TEXT_RESPONSE\""
    fi
else
    echo "❌ Gemini API: FAILED (Status: $GEMINI_HTTP_STATUS)"
    echo "📄 Error: $GEMINI_BODY"
fi

echo ""
echo "🎉 Direct API testing complete!"
echo ""
echo "📋 Summary of actual Google Cloud endpoints tested:"
echo "   • Free Image Gen: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent"
echo "   • Veo (Video):    https://us-central1-aiplatform.googleapis.com/v1/projects/.../models/veo-3.0-generate-001:predict"
echo "   • Gemini (Text):  https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"
