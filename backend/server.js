const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// file upload setup (moved early so routes can reference `upload`)
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g,'_')}`;
    cb(null, safe);
  }
});
const upload = multer({ storage });

function assignCategory(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('bug') || text.includes('error') || text.includes('fix')) return 'Bug';
  if (text.includes('ui') || text.includes('design') || text.includes('look') || text.includes('feel')) return 'UI/UX';
  if (text.includes('speed') || text.includes('fast') || text.includes('performance') || text.includes('slow')) return 'Performance';
  return 'Feature Request';
}

// ✅ All routes MUST be async and MUST await DB calls
app.get('/api/ideas', async (req, res) => {
  try {
    const ideas = await db.getAllIdeas();
    res.json(ideas);
  } catch (err) {
    console.error('GET /api/ideas error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ideas', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  try {
    const category = assignCategory(title, description);
    const newIdea = await db.addIdea(title, description, category);
    res.status(201).json(newIdea);
  } catch (err) {
    console.error('POST /api/ideas error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ideas/:id/upvote', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const success = await db.upvoteIdea(id);
    if (!success) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/ideas/:id/upvote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Boards CRUD
app.get('/api/boards', async (req, res) => {
  try {
    const boards = await db.getAllBoards();
    res.json(boards);
  } catch (err) {
    console.error('GET /api/boards error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boards', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Board name is required' });
  try {
    const board = await db.addBoard(name, description || '');
    res.status(201).json(board);
  } catch (err) {
    console.error('POST /api/boards error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/boards/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const board = await db.getBoardById(id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (err) {
    console.error('GET /api/boards/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/boards/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  try {
    const ok = await db.updateBoard(id, name, description || '');
    if (!ok) return res.status(404).json({ error: 'Board not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/boards/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/boards/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const ok = await db.deleteBoard(id);
    if (!ok) return res.status(404).json({ error: 'Board not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/boards/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Tasks CRUD
app.get('/api/tasks', async (req, res) => {
  try {
    const boardId = req.query.board_id ? Number(req.query.board_id) : undefined;
    const tasks = await db.getTasks(boardId);
    res.json(tasks);
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { board_id, title, description, status, labels, priority, due_date } = req.body;
  if (!board_id || !title) return res.status(400).json({ error: 'board_id and title are required' });
  try {
    const task = await db.addTask(board_id, title, description || '', status || 'Backlog', labels || null, priority || 'Low', due_date || null);
    res.status(201).json(task);
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const task = await db.getTaskById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('GET /api/tasks/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const updated = await db.updateTask(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/tasks/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const ok = await db.deleteTask(id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/move', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { board_id, status } = req.body;
  if (!board_id || !status) return res.status(400).json({ error: 'board_id and status required' });
  try {
    const ok = await db.moveTask(id, board_id, status);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/tasks/:id/move error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/upvote', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  try {
    const ok = await db.upvoteTask(id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/tasks/:id/upvote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Comments
app.get('/api/tasks/:id/comments', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const comments = await db.getCommentsForTask(id);
    res.json(comments);
  } catch (err) {
    console.error('GET /api/tasks/:id/comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Comment body required' });
  try {
    const parentId = req.body.parent_id ? Number(req.body.parent_id) : null;
    const comment = await db.addCommentToTask(id, req.user.sub, body, parentId);
    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /api/tasks/:id/comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const comment = await db.getCommentById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    const ok = await db.deleteComment(id);
    if (!ok) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/comments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Comment body required' });
  try {
    const comment = await db.getCommentById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }
    const ok = await db.updateComment(id, body);
    if (!ok) return res.status(500).json({ error: 'Failed to update comment' });
    const updated = await db.getCommentById(id);
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/comments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Attachments
app.get('/api/tasks/:id/attachments', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const list = await db.getAttachmentsForTask(id);
    res.json(list);
  } catch (err) {
    console.error('GET /api/tasks/:id/attachments error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/attachments', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { url, filename } = req.body;
  if (!url) return res.status(400).json({ error: 'Attachment url required' });
  try {
    const att = await db.addAttachmentToTask(id, url, filename || null, req.user.sub);
    res.status(201).json(att);
  } catch (err) {
    console.error('POST /api/tasks/:id/attachments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// file upload endpoint
app.post('/api/tasks/:id/attachments/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const id = Number(req.params.id);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const publicUrl = `/uploads/${req.file.filename}`; // served statically below
    const att = await db.addAttachmentToTask(id, publicUrl, req.file.originalname, req.user.sub);
    res.status(201).json(att);
  } catch (err) {
    console.error('UPLOAD /api/tasks/:id/attachments/upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/attachments/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const attachment = await db.getAttachmentById(id);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });
    if (attachment.uploaded_by !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this attachment' });
    }

    // if the attachment is a local file in /uploads, remove it from disk
    try {
      const uploadsPath = path.join(__dirname, 'uploads');
      if (attachment.url && attachment.url.startsWith('/uploads/')) {
        const filename = attachment.url.replace('/uploads/', '');
        const filePath = path.join(uploadsPath, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fsErr) {
      console.warn('Failed to remove attachment file from disk:', fsErr.message);
      // continue to delete DB record
    }

    const ok = await db.deleteAttachment(id);
    if (!ok) return res.status(404).json({ error: 'Attachment not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/attachments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend (production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Authentication (JWT) ---
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function generateToken(user) {
  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing authorization token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// register integration endpoints
try {
  const integrationsRegister = require('./integrations/register');
  integrationsRegister.register(app, authenticateToken);
} catch (e) {
  console.warn('Integrations registration failed:', e.message);
}

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const existing = await db.getUserByUsername(username);
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const user = await db.createUser(username, hash);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('POST /api/auth/register error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const user = await db.getUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const safeUser = await db.getUserById(user.id);
    const token = generateToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});