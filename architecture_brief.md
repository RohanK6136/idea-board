## Architecture Brief — Idea Board

1) What tech stack did you choose and why?

- Frontend: React + Vite — fast developer feedback, small bundle, simple to deploy.
- Backend: Node.js + Express — minimal REST API surface, easy to deploy on Render.
- Database: SQLite — zero-cost, file-based DB suitable for a small project and Render's ephemeral storage for demos.
- Hosting: Render (free tier) — connected to GitHub, auto-deploys on push.

Why: This stack minimizes operational overhead, meets the challenge constraints (zero cost), and is easy to explain and extend.

2) Where did the AI get confused, hallucinate, or write bad code, and how did you fix it?

- Dependency versions: the assistant suggested an `airtable` version that didn't exist; I checked `npm view airtable version` and corrected to a valid release before installing.
- Authentication assumptions: earlier code required authentication for creating tasks/upvotes; I intentionally changed endpoints to allow anonymous submissions to meet the challenge UX requirement and updated the frontend accordingly.
- API shapes: AI sometimes generated endpoint signatures that didn't match existing DB helpers. I inspected `backend/db.js` and aligned the server routes to the DB functions, then tested locally and on the deployed URL.

3) If I had another 2 hours, what I'd add or improve

- Add unit/integration tests (Node-based) and run them in CI.
- Implement OAuth for third-party integrations (Airtable, Miro) and robust mapping logic.
- Improve category assignment by calling a small LLM or using a trained classifier for better accuracy and edge-case handling.
- Add pagination and rate-limiting on API endpoints, and secure upvotes against duplicate votes per user.
# Architecture Brief – Idea Board

## Tech Stack
- **Frontend**: React + Vite for fast local development, a simple component model, and easy static build deployment.
- **Backend**: Node.js + Express for lightweight REST API routing and static asset serving.
- **Database**: SQLite using `sqlite3` so the app stays zero-cost and works with a file-based storage model on Render.
- **Category assignment**: Keyword matching in the backend based on title/description content. This avoids using an external LLM API and keeps the app free, deterministic, and easy to deploy.

## AI confusion, hallucination, and fixes
- The AI initially output a `POST /api/ideas` response object that did not include the `created_at` timestamp. I fixed it by returning the full inserted row from the database.
- AI suggested using MongoDB or a hosted database in early drafts; I replaced that with SQLite because the challenge explicitly allows lightweight local persistence.
- There was a missing `await` in the backend flow and a risk of incomplete response data on insertion. I verified the routes and fixed the promise handling.
- I also confirmed the deployed URL and updated the docs to reflect the real live app.

## If I had another 2 hours
- Add user authentication so ideas can be submitted and upvoted by logged-in users.
- Add idea editing, comments, and a simple admin moderation panel.
- Improve category assignment with a small fine-tuned classifier or a free LLM API if the budget allows.
- Add test coverage for API routes and UI interactions.
