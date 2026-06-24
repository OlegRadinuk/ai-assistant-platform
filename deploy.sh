#!/bin/bash
# deploy.sh — ai-assistant-platform
# Pattern mirrors optisphere/deploy.sh (git pull → build → pm2 reload → save).
# Run from the project root on the server as the deploy user.
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "→ git pull"
git pull

echo "→ npm ci  (rebuilds better-sqlite3 natively for this Node version)"
npm ci

echo "→ npm run build"
npm run build

echo "→ pm2 startOrRestart"
pm2 startOrRestart ecosystem.config.js
pm2 save

echo "✓ Deploy complete — ai-assistant-platform"
