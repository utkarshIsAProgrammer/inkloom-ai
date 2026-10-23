#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  🚀 Starting Inkloom AI — Brand-Governance Platform"
echo "  Track: Enterprise AI & Workflow Automation"
echo "  Team: indiedevs (Utkarsh Yadav & Shreya Kumari)"
echo "=========================================================="

# Free port 8000 if already occupied by an old process
OLD_PID=$(lsof -ti:8000 2>/dev/null || true)
if [ -n "$OLD_PID" ]; then
    echo "🔄 Freeing existing process on port 8000 (PID: $OLD_PID)..."
    kill -9 $OLD_PID 2>/dev/null || true
    sleep 0.5
fi

# Activate virtualenv if present
if [ -d "$DIR/.venv" ]; then
    source "$DIR/.venv/bin/activate"
fi

# Build client if dist doesn't exist
if [ ! -d "$DIR/client/dist" ]; then
    echo "📦 Building client assets..."
    cd "$DIR/client"
    bun run build || npm run build
    cd "$DIR"
fi

echo "✨ Server starting on http://localhost:8000"
echo "📖 Swagger API Docs on http://localhost:8000/docs"
echo "🖥️  Opening interactive Web UI on http://localhost:8000"
echo "Press Ctrl+C to stop."

exec python3 -m uvicorn server.main:app --host 0.0.0.0 --port 8000
