#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> installing python deps"
uv pip install -r requirements.txt --quiet 2>/dev/null || pip install -r requirements.txt --quiet

echo "==> installing client deps + build"
if [ -d client/node_modules ]; then
  echo "client deps already present"
else
  cd client
  if command -v bun >/dev/null 2>&1; then
    bun install --quiet
  else
    npm install --quiet
  fi
  cd ..
fi

if [ ! -d client/dist ] || [ ! -f client/dist/index.html ]; then
  echo "==> building client"
  cd client
  if command -v bun >/dev/null 2>&1; then
    bun run build
  else
    npm run build
  fi
  cd ..
fi

echo "==> starting server on :8000"
exec uvicorn server.main:app --host 0.0.0.0 --port 8000
