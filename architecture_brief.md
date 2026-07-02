# Architecture Brief – Idea Board

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite with `sqlite3`
- **Category**: Keyword matching (no external API)

## AI Usage & Fixes
- AI initially suggested MongoDB → switched to SQLite.
- Forgot `async/await` in routes → fixed by adding `await` to all DB calls.
- Missing CORS → added `cors` middleware.
- CSS syntax errors → cleaned up with proper formatting.

## Improvements with 2 more hours
- User authentication (login/register)
- Real-time updates (WebSockets)
- Pagination
- Unit tests
