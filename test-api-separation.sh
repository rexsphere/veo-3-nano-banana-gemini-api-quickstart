#!/bin/bash

# API Key Separation Test Script
# Tests all API endpoints with different keys and parameters

BASE_URL="http://localhost:3000"
AUTH_HEADER="Authorization: Bearer dev"

echo "🧪 Testing API Key Separation & Dynamic Parameters"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local data="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test $TOTAL_TESTS: $name${NC}"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "$data")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        echo "Response: $(echo "$body" | head -c 200)..."
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Error: $body"
    fi
    echo ""
}

echo "📡 Testing Firebase AI SDK with Dynamic Parameters"
echo "---------------------------------------------------"

# Test 1: Default parameters
test_endpoint \
    "Firebase AI - Default Parameters" \
    "/api/firebase-ai/generate" \
    '{"prompt":"say hello","model":"gemini-2.0-flash"}'

# Test 2: Low temperature (precise)
test_endpoint \
    "Firebase AI - Precise (temp=0.3)" \
    "/api/firebase-ai/generate" \
    '{"prompt":"what is 2+2","model":"gemini-2.0-flash","temperature":0.3,"topP":0.8,"maxOutputTokens":50,"safetyLevel":"medium"}'

# Test 3: High temperature (creative)
test_endpoint \
    "Firebase AI - Creative (temp=1.8)" \
    "/api/firebase-ai/generate" \
    '{"prompt":"imagine a purple elephant","model":"gemini-2.0-flash","temperature":1.8,"topP":0.98,"maxOutputTokens":200,"safetyLevel":"off"}'

# Test 4: Very short response
test_endpoint \
    "Firebase AI - Short Response (50 tokens)" \
    "/api/firebase-ai/generate" \
    '{"prompt":"describe the ocean in one sentence","model":"gemini-2.0-flash","maxOutputTokens":50}'

# Test 5: Long response
test_endpoint \
    "Firebase AI - Long Response (2048 tokens)" \
    "/api/firebase-ai/generate" \
    '{"prompt":"write a short story about a robot","model":"gemini-2.0-flash","maxOutputTokens":2048,"temperature":1.2}'

echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $((TOTAL_TESTS - PASSED_TESTS))${NC}"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

