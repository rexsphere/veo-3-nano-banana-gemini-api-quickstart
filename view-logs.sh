#!/bin/bash

# View Logs Script - Easy way to check API logs
# Usage: ./view-logs.sh [options]

PORT=${PORT:-3001}
BASE_URL="http://localhost:$PORT"

echo "📋 Log Viewer - VeoStudio API Logs"
echo "=================================="
echo ""

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo "❌ Server not running on port $PORT"
    echo "   Start with: npm run dev"
    exit 1
fi

# Parse command line arguments
LIMIT=20
SERVICE=""
LEVEL=""
SHOW_PROMPTS=false
SHOW_RESPONSES=false
EXPORT_CSV=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--limit)
            LIMIT="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -l|--level)
            LEVEL="$2"
            shift 2
            ;;
        -p|--prompts)
            SHOW_PROMPTS=true
            shift
            ;;
        -r|--responses)
            SHOW_RESPONSES=true
            shift
            ;;
        --csv)
            EXPORT_CSV=true
            shift
            ;;
        --stats)
            echo "📊 Statistics:"
            curl -s -H "Authorization: Bearer dev-token" \
                "$BASE_URL/api/logs" | jq '.stats'
            exit 0
            ;;
        --clear)
            echo "🧹 Clearing all logs..."
            curl -s -X DELETE -H "Authorization: Bearer dev-token" \
                "$BASE_URL/api/logs" | jq '.'
            exit 0
            ;;
        -h|--help)
            echo "Usage: ./view-logs.sh [options]"
            echo ""
            echo "Options:"
            echo "  -n, --limit <number>     Number of logs to show (default: 20)"
            echo "  -s, --service <name>     Filter by service name"
            echo "  -l, --level <level>      Filter by level (info/warn/error)"
            echo "  -p, --prompts            Show prompts only"
            echo "  -r, --responses          Show responses only"
            echo "  --csv                    Export as CSV"
            echo "  --stats                  Show statistics"
            echo "  --clear                  Clear all logs"
            echo "  -h, --help               Show this help"
            echo ""
            echo "Examples:"
            echo "  ./view-logs.sh                          # Show last 20 logs"
            echo "  ./view-logs.sh -n 50                    # Show last 50 logs"
            echo "  ./view-logs.sh --prompts                # Show prompts only"
            echo "  ./view-logs.sh --responses              # Show responses only"
            echo "  ./view-logs.sh -l error                 # Show errors only"
            echo "  ./view-logs.sh -s \"Firebase AI SDK\"   # Show Firebase AI logs"
            echo "  ./view-logs.sh --stats                  # Show statistics"
            echo "  ./view-logs.sh --csv > logs.csv         # Export to CSV"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build query parameters
QUERY_PARAMS="limit=$LIMIT"
if [ -n "$SERVICE" ]; then
    QUERY_PARAMS="$QUERY_PARAMS&service=$SERVICE"
fi
if [ -n "$LEVEL" ]; then
    QUERY_PARAMS="$QUERY_PARAMS&level=$LEVEL"
fi

# Export as CSV
if [ "$EXPORT_CSV" = true ]; then
    curl -s -H "Authorization: Bearer dev-token" \
        "$BASE_URL/api/logs?$QUERY_PARAMS&format=csv"
    exit 0
fi

# Fetch logs
RESPONSE=$(curl -s -H "Authorization: Bearer dev-token" \
    "$BASE_URL/api/logs?$QUERY_PARAMS")

# Check if logs are empty
COUNT=$(echo "$RESPONSE" | jq -r '.count // 0')
if [ "$COUNT" -eq 0 ]; then
    echo "📭 No logs found"
    echo ""
    echo "💡 Logs are stored in memory and cleared on server restart."
    echo "   Make some API requests to generate logs."
    exit 0
fi

echo "Found $COUNT log entries"
echo ""

# Show prompts only
if [ "$SHOW_PROMPTS" = true ]; then
    echo "🎯 Prompts:"
    echo "$RESPONSE" | jq -r '.logs[] | select(.details.prompt != null) | 
        "\(.timestamp) | \(.details.prompt)"'
    exit 0
fi

# Show responses only
if [ "$SHOW_RESPONSES" = true ]; then
    echo "💬 Responses:"
    echo "$RESPONSE" | jq -r '.logs[] | select(.details.response != null) | 
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ \(.timestamp)
📝 Prompt: \(.details.prompt // "N/A")
💬 Response: \(.details.response // "N/A")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"'
    exit 0
fi

# Show full logs (default)
echo "📜 Recent Logs:"
echo ""
echo "$RESPONSE" | jq -r '.logs[] | 
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[\(.level | ascii_upcase)] \(.timestamp)
🔧 Service: \(.service)
🎬 Action: \(.action)
⏱️  Duration: \(if .duration then "\(.duration)ms" else "N/A" end)
📊 Status: \(if .statusCode then "\(.statusCode)" else "N/A" end)
\(if .details.prompt then "📝 Prompt: \(.details.prompt)" else "" end)
\(if .details.response then "💬 Response: \(.details.response[0:200])\(if (.details.response | length) > 200 then "..." else "" end)" else "" end)
\(if .details.error then "❌ Error: \(.details.error)" else "" end)"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Use ./view-logs.sh --help for more options"

