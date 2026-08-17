const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

async function main() {
  const sqlitePath = path.join(__dirname, '..', 'ideas.db');
  const sqlite = new sqlite3.Database(sqlitePath);
  const pg = new Client({ connectionString: process.env.DATABASE_URL });
  if (!process.env.DATABASE_URL) {
    console.error('Please set DATABASE_URL to your Postgres connection string');
    process.exit(2);
  }
  await pg.connect();

  // Create tables in Postgres
  await pg.query(`
    CREATE TABLE IF NOT EXISTS boards (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT,
      labels TEXT,
      priority TEXT,
      votes INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER,
      parent_id INTEGER,
      body TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS attachments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      url TEXT,
      filename TEXT,
      uploaded_by INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  function allSql(sql, params=[]) {
    return new Promise((resolve, reject) => sqlite.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
  }

  console.log('Reading from SQLite...');
  const boards = await allSql('SELECT * FROM boards');
  for (const b of boards) {
    await pg.query('INSERT INTO boards (id, name, description, created_at) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [b.id, b.name, b.description, b.created_at]);
  }

  const users = await allSql('SELECT * FROM users');
  for (const u of users) {
    await pg.query('INSERT INTO users (id, username, password_hash, role, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING', [u.id, u.username, u.password_hash, u.role, u.created_at]);
  }

  const tasks = await allSql('SELECT * FROM tasks');
  for (const t of tasks) {
    await pg.query('INSERT INTO tasks (id, board_id, title, description, status, labels, priority, votes, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING', [t.id, t.board_id, t.title, t.description, t.status, t.labels, t.priority, t.votes, t.due_date, t.created_at]);
  }

  const comments = await allSql('SELECT * FROM comments');
  for (const c of comments) {
    await pg.query('INSERT INTO comments (id, task_id, user_id, parent_id, body, created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [c.id, c.task_id, c.user_id, c.parent_id, c.body, c.created_at]);
  }

  const atts = await allSql('SELECT * FROM attachments');
  for (const a of atts) {
    await pg.query('INSERT INTO attachments (id, task_id, url, filename, uploaded_by, created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [a.id, a.task_id, a.url, a.filename, a.uploaded_by, a.created_at]);
  }

  console.log('Migration complete. Close connections.');
  await pg.end();
  sqlite.close();
}

main().catch(err => { console.error(err); process.exit(1); });
