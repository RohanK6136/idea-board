const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Category assignment via keyword matching
function assignCategory(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('bug') || text.includes('error') || text.includes('fix')) return 'Bug';
  if (text.includes('ui') || text.includes('design') || text.includes('look') || text.includes('feel')) return 'UI/UX';
  if (text.includes('speed') || text.includes('fast') || text.includes('performance') || text.includes('slow')) return 'Performance';
  return 'Feature Request';
}

// GET all ideas – now async
app.get('/api/ideas', async (req, res) => {
  try {
    const ideas = await db.getAllIdeas();
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new idea – now async
app.post('/api/ideas', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  try {
    const category = assignCategory(title, description);
    const id = await db.addIdea(title, description, category);
    const newIdea = { id, title, description, category, votes: 0 };
    res.status(201).json(newIdea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upvote – now async
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
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend (for production)
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});