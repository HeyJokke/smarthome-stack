#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/admin/smarthome"
BRANCH="main"
SERVICE_NAME="smarthome.service"

cd "$REPO_DIR"

echo "==> Fetching..."
git fetch origin "$BRANCH"

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "==> No changes."
  exit 0
fi

echo "==> Pulling..."
git pull --rebase origin "$BRANCH"

echo "==> Installing deps..."
cd "$REPO_DIR/pi-backend"

if [ -f package-lock.json ]; then
  /usr/bin/npm ci --omit=dev
else
  /usr/bin/npm install --omit=dev
fi

echo "==> Restarting service..."
sudo systemctl restart "$SERVICE_NAME"

echo "==> Done."

