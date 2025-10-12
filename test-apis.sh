#!/bin/bash

echo "🧪 Testing Google APIs"
echo "======================"

# Check if server is running
if ! curl -s "http://localhost:3000" > /dev/null; then
    echo "❌ Server not running. Please start with: npm run dev"
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"
echo ""

# Check for GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY not set. Skipping free image generation test."
    echo "   Set it with: export GEMINI_API_KEY='your-api-key'"
else
    # Test Free Gemini Image Generation API
    echo "🖼️  Testing Free Gemini Image Generation API..."
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=$GEMINI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "contents": [{
          "parts": [
            {"text": "A simple test image of a red apple on a white background"}
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

    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "✅ Gemini Image Generation: SUCCESS"
        IMAGE_DATA=$(echo "$BODY" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data // empty' 2>/dev/null)
        if [ -n "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
            echo "📄 Image generated successfully (base64 length: ${#IMAGE_DATA})"
            # Save image for verification
            echo "$IMAGE_DATA" | base64 -d > test_gemini_image.png 2>/dev/null && echo "💾 Saved as test_gemini_image.png"
        fi
    else
        echo "❌ Gemini Image Generation: FAILED (Status: $HTTP_STATUS)"
        echo "📄 Error: $BODY"
    fi
    echo ""
fi

echo ""

# Test Veo API
echo "🎬 Testing Veo API..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "http://localhost:3000/api/veo/generate" \
  -H "Authorization: Bearer dev-token" \
  -F "prompt=A simple test video of a bouncing ball")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Veo API: SUCCESS"
    OPERATION_NAME=$(echo "$BODY" | jq -r '.name // empty')
    if [ -n "$OPERATION_NAME" ]; then
        echo "📄 Operation started: $OPERATION_NAME"
    fi
else
    echo "❌ Veo API: FAILED (Status: $HTTP_STATUS)"
    echo "📄 Error: $BODY"
fi

echo ""
echo "🎉 Testing complete!"
echo ""
echo "💡 Next steps:"
echo "   - Check video generation status: curl -H 'Authorization: Bearer dev-token' 'http://localhost:3000/api/veo/operation?name=$OPERATION_NAME'"
echo "   - Download completed video: curl -H 'Authorization: Bearer dev-token' 'http://localhost:3000/api/veo/download?name=$OPERATION_NAME' --output video.mp4"
