#!/bin/bash
set -e

REMOTE="grant@209.38.184.201"
REMOTE_PATH="/home/grant/feed"

echo "Pushing to remote..."
git push

echo "Deploying to $REMOTE..."
ssh "$REMOTE" "bash -l -c 'cd $REMOTE_PATH && git pull && (timeout 120 npm run build; pm2 restart feed)'"

echo "Deploy complete."
