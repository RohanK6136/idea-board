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
