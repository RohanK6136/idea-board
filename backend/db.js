const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

const dbPath = path.join(__dirname, 'ideas.db');
const db = new sqlite3.Database(dbPath);

const dbAll = promisify(db.all.bind(db));
const dbGet = promisify(db.get.bind(db));
function dbRun(sql, ...params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }

      // sqlite3 exposes statement metadata through the callback context.
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

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
  db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Backlog',
      labels TEXT,
      priority TEXT DEFAULT 'Low',
      votes INTEGER DEFAULT 0,
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER,
      parent_id INTEGER,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      filename TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
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
  return await dbGet('SELECT * FROM ideas WHERE id = ?', result.lastID);
}

async function upvoteIdea(id) {
  const result = await dbRun('UPDATE ideas SET votes = votes + 1 WHERE id = ?', id);
  return result.changes > 0;
}

// Boards
async function getAllBoards() {
  return await dbAll('SELECT * FROM boards ORDER BY created_at DESC');
}

async function getBoardById(id) {
  return await dbGet('SELECT * FROM boards WHERE id = ?', id);
}

async function addBoard(name, description) {
  const result = await dbRun('INSERT INTO boards (name, description) VALUES (?, ?)', name, description);
  return await dbGet('SELECT * FROM boards WHERE id = ?', result.lastID);
}

async function updateBoard(id, name, description) {
  const result = await dbRun('UPDATE boards SET name = ?, description = ? WHERE id = ?', name, description, id);
  return result.changes > 0;
}

async function deleteBoard(id) {
  const result = await dbRun('DELETE FROM boards WHERE id = ?', id);
  return result.changes > 0;
}

// Users
async function getUserByUsername(username) {
  return await dbGet('SELECT * FROM users WHERE username = ?', username);
}

async function getUserById(id) {
  return await dbGet('SELECT id, username, role, created_at FROM users WHERE id = ?', id);
}

async function createUser(username, password_hash, role = 'user') {
  const result = await dbRun('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', username, password_hash, role);
  return await dbGet('SELECT id, username, role, created_at FROM users WHERE id = ?', result.lastID);
}

// Tasks
async function getTasks(boardId) {
  if (boardId) return await dbAll('SELECT * FROM tasks WHERE board_id = ? ORDER BY created_at DESC', boardId);
  return await dbAll('SELECT * FROM tasks ORDER BY created_at DESC');
}

async function getTaskById(id) {
  return await dbGet('SELECT * FROM tasks WHERE id = ?', id);
}

async function addTask(board_id, title, description, status = 'Backlog', labels = null, priority = 'Low', due_date = null) {
  const labelsStr = labels ? JSON.stringify(labels) : null;
  const result = await dbRun(
    'INSERT INTO tasks (board_id, title, description, status, labels, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    board_id, title, description, status, labelsStr, priority, due_date
  );
  return await dbGet('SELECT * FROM tasks WHERE id = ?', result.lastID);
}

async function updateTask(id, fields = {}) {
  const existing = await getTaskById(id);
  if (!existing) return null;
  const title = fields.title ?? existing.title;
  const description = fields.description ?? existing.description;
  const status = fields.status ?? existing.status;
  const labels = fields.labels !== undefined ? JSON.stringify(fields.labels) : existing.labels;
  const priority = fields.priority ?? existing.priority;
  const due_date = fields.due_date ?? existing.due_date;
  const board_id = fields.board_id ?? existing.board_id;

  await dbRun(
    'UPDATE tasks SET board_id = ?, title = ?, description = ?, status = ?, labels = ?, priority = ?, due_date = ? WHERE id = ?',
    board_id, title, description, status, labels, priority, due_date, id
  );
  return await getTaskById(id);
}

async function deleteTask(id) {
  const result = await dbRun('DELETE FROM tasks WHERE id = ?', id);
  return result.changes > 0;
}

async function moveTask(id, board_id, status) {
  const result = await dbRun('UPDATE tasks SET board_id = ?, status = ? WHERE id = ?', board_id, status, id);
  return result.changes > 0;
}

async function upvoteTask(id) {
  const result = await dbRun('UPDATE tasks SET votes = votes + 1 WHERE id = ?', id);
  return result.changes > 0;
}

async function resetTaskVotes(id) {
  const result = await dbRun('UPDATE tasks SET votes = 0 WHERE id = ?', id);
  return result.changes > 0;
}

// Comments
async function getCommentsForTask(taskId) {
  return await dbAll('SELECT c.id, c.task_id, c.user_id, c.parent_id, c.body, c.created_at, u.username FROM comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC', taskId);
}

async function addCommentToTask(taskId, userId, body, parentId = null) {
  const result = await dbRun('INSERT INTO comments (task_id, user_id, parent_id, body) VALUES (?, ?, ?, ?)', taskId, userId, parentId, body);
  return await dbGet('SELECT * FROM comments WHERE id = ?', result.lastID);
}

async function deleteComment(id) {
  const result = await dbRun('DELETE FROM comments WHERE id = ?', id);
  return result.changes > 0;
}

async function getCommentById(id) {
  return await dbGet('SELECT * FROM comments WHERE id = ?', id);
}

async function updateComment(id, body) {
  const result = await dbRun('UPDATE comments SET body = ? WHERE id = ?', body, id);
  return result.changes > 0;
}

// Attachments
async function getAttachmentsForTask(taskId) {
  return await dbAll('SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at ASC', taskId);
}

async function addAttachmentToTask(taskId, url, filename, uploadedBy) {
  const result = await dbRun('INSERT INTO attachments (task_id, url, filename, uploaded_by) VALUES (?, ?, ?, ?)', taskId, url, filename || null, uploadedBy || null);
  return await dbGet('SELECT * FROM attachments WHERE id = ?', result.lastID);
}

async function deleteAttachment(id) {
  const result = await dbRun('DELETE FROM attachments WHERE id = ?', id);
  return result.changes > 0;
}

async function getAttachmentById(id) {
  return await dbGet('SELECT * FROM attachments WHERE id = ?', id);
}

module.exports = {
  getAllIdeas, addIdea, upvoteIdea,
  getAllBoards, getBoardById, addBoard, updateBoard, deleteBoard,
  getTasks, getTaskById, addTask, updateTask, deleteTask, moveTask, upvoteTask
  ,getUserByUsername, getUserById, createUser
  ,getCommentsForTask, addCommentToTask, deleteComment
  ,getAttachmentsForTask, addAttachmentToTask, deleteAttachment
  ,resetTaskVotes
};
