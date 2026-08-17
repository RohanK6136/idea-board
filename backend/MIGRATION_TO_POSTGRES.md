Migration plan: migrate SQLite (`ideas.db`) to Postgres on Render

Overview
- Current: `backend/ideas.db` (SQLite) and local `uploads/` directory storing attachments.
- Goal: use managed Postgres for persistent relational storage and S3 for attachments (or Render Persistent Disk if needed).

Steps
1. Create a Postgres instance on Render (Managed Database).
2. Add connection string as `DATABASE_URL` env var in Render service.
3. Update `backend/db.js` to use `pg` instead of `sqlite3`, or add a small adapter layer:
   - Option A (recommended long-term): Replace DB layer with `knex` or `sequelize` and run migrations.
   - Option B (faster): Write a one-time migration script that reads from SQLite and inserts into Postgres tables.

Migration script (one-time)
- Create `scripts/migrate-sqlite-to-postgres.js` which:
  - Connects to both DBs.
  - Creates Postgres tables matching current schema.
  - Selects rows from SQLite and bulk inserts into Postgres.

Attachments
- Recommended: use S3 (or DigitalOcean Spaces) for attachments.
  - On upload, store files in S3 and save the S3 URL in the DB.
  - Alternatively, enable a Persistent Disk in Render to keep `uploads/` live.

Env vars required
- `DATABASE_URL` (postgres://...)
- `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_REGION` (if using S3)

Rollout
- Deploy backend with `DATABASE_URL` pointing to Postgres, run migration script once, then switch app to use Postgres adapter.

Notes
- Keep a backup of `ideas.db` before migrating.
- Tests: verify users, tasks, comments, attachments count parity after migration.
