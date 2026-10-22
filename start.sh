#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  🚀 Starting Inkloom AI — Brand-Governance Platform"
echo "  Track: Enterprise AI & Workflow Automation"
echo "  Team: indiedevs (Utkarsh Yadav & Shreya Kumari)"
echo "=========================================================="

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
