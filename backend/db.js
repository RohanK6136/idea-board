const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

const dbPath = path.join(__dirname, 'ideas.db');
const db = new sqlite3.Database(dbPath);

const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

async function getAllIdeas() {
  return await dbAll('SELECT * FROM ideas ORDER BY votes DESC, created_at DESC');
}

async function addIdea(title, description, category) {
  const result = await dbRun(
    'INSERT INTO ideas (title, description, category) VALUES (?, ?, ?)',
    title, description, category
  );
  return result.lastID;   // ✅ This returns the inserted row ID
}

async function upvoteIdea(id) {
  const result = await dbRun('UPDATE ideas SET votes = votes + 1 WHERE id = ?', id);
  return result.changes > 0;
}

module.exports = { getAllIdeas, addIdea, upvoteIdea };