Render deployment checklist for idea-board

1. Services
- Backend (Web Service)
  - Root Directory: `backend`
  - Environment: Node 18+
  - Build Command: `cd backend && npm install`
  - Start Command: `cd backend && npm start`
  - Env Vars: `JWT_SECRET` (set to a secure random value), `DATABASE_URL` (if using Postgres)
  - Persistent Disk: enable if you will keep SQLite and `uploads/` (recommended for short-term).

- Frontend (Static Site)
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

2. Auto-deploy
- Connect repository (GitHub) to Render and link branch `main`.
- Push to `main` to trigger deploy. You can also use manual deploy from the dashboard.

3. File storage
- Short-term: enable Persistent Disk for backend to persist `ideas.db` and `uploads/`.
- Long-term: migrate DB to Postgres and uploads to S3 (see `backend/MIGRATION_TO_POSTGRES.md`).

4. Post-deploy checks
- Visit the deployed URL and test authentication flows.
- Create a task, upload a file, add a comment, then delete the comment/attachment to confirm disk operations (if using Persistent Disk).
