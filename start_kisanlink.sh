#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "========================================"
echo "      KISANLINK PYTHON SYSTEM"
echo "========================================"
echo ""

echo "Starting FastAPI Backend..."
cd "$PROJECT_DIR/backend"
python3 -m uvicorn app:app --host 127.0.0.1 --port 8081 &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend..."
cd "$PROJECT_DIR/frontend"
python3 -m http.server 5501 &
FRONTEND_PID=$!

sleep 3

echo "Opening KisanLink..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://127.0.0.1:5501/index.html"
else
    xdg-open "http://127.0.0.1:5501/index.html" 2>/dev/null
fi

echo ""
echo "========================================"
echo "       KISANLINK STARTED"
echo "========================================"
echo ""
echo "Frontend: http://127.0.0.1:5501"
echo "Backend : http://127.0.0.1:8081"
echo ""
echo "Press Ctrl+C to stop KisanLink."

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT

wait
