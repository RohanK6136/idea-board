#!/usr/bin/env bash
set -euo pipefail

# Simple smoke tests against the live Render app
BASE_URL="https://idea-board-aj19.onrender.com"

echo "Checking site availability..."
curl -sS -I "$BASE_URL" | head -n 1

echo "Fetching /api/ideas"
curl -sS "$BASE_URL/api/ideas" | sed -n '1,2p'

echo "Fetching /api/boards"
curl -sS "$BASE_URL/api/boards" | sed -n '1,2p'

echo "Attempting to create a test task (anonymous). Will skip if no boards exist."
BOARD_ID=$(curl -sS "$BASE_URL/api/boards" | grep -o '"id":[0-9]*' | head -n1 | grep -o '[0-9]*' || echo "")
if [ -z "$BOARD_ID" ]; then
  echo "No board id found; skipping task create test"
  exit 0
fi

CREATE_JSON=$(printf '{"board_id": %s, "title": "Smoke Test Idea", "description": "Auto-created by smoke test"}' "$BOARD_ID")
echo "POST /api/tasks -> $CREATE_JSON"
CREATED=$(curl -sS -X POST "$BASE_URL/api/tasks" -H "Content-Type: application/json" -d "$CREATE_JSON")
echo "Create response:"
echo "$CREATED" | sed -n '1,6p'

NEW_ID=$(echo "$CREATED" | grep -o '"id":[0-9]*' | head -n1 | grep -o '[0-9]*' || echo "")
if [ -n "$NEW_ID" ]; then
  echo "Upvoting created task id $NEW_ID"
  curl -sS -X POST "$BASE_URL/api/tasks/$NEW_ID/upvote" -o /dev/null && echo "Upvote request sent"
else
  echo "Could not parse created id; skipping upvote"
fi

echo "Smoke tests complete."
