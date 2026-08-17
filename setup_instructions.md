# Idea Board – Setup Instructions

## Prerequisites
- Node.js (v16+)
- npm

## Installation
1. Clone the repository: `git clone <your-repo-url>`
2. Change into the project directory: `cd idea-board`
3. Install dependencies for both services: `npm run install`

## Running Locally
1. Start the backend: `cd backend && npm start`
2. Start the frontend in a separate terminal: `cd frontend && npm run dev`
3. Open the browser to `http://localhost:5173`

## Production Build
1. Build the frontend: `cd frontend && npm run build`
2. Start the backend to serve the static build: `cd backend && npm start`
3. Open the browser to `http://localhost:3001`

## Deployed Live URL
https://idea-board-aj19.onrender.com

## Testing the deployed app
- A simple smoke-test script is included at `tests/run_checks.sh`. Run:

```bash
./tests/run_checks.sh
```

This will attempt to fetch `/api/ideas`, create an anonymous task (if a board exists), and upvote it.

## Submission Notes
- The app is built with React + Vite for the frontend and Node.js + Express + SQLite for the backend.
- Make sure the `ai_logs.txt`, `architecture_brief.md`, and the recorded video are included in the final zip submission.
