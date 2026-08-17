import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Reflection from './components/Reflection';
import Contact from './components/Contact';
import Kanban from './components/Kanban';
import AuthPanel from './components/AuthPanel';

const API_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : '/api';

const starterIdeas = [
  {
    id: 101,
    title: 'AI Resume Matching Assistant',
    description: 'Help job seekers match their CV to role descriptions and suggest missing skills with clear, actionable feedback.',
    category: 'Feature Request',
    votes: 12,
    status: 'Ready to Build',
    tags: ['AI', 'Career'],
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    title: 'Portfolio Analytics Dashboard',
    description: 'Track which projects attract the most attention and understand how visitors interact with case studies.',
    category: 'UI/UX',
    votes: 9,
    status: 'In Review',
    tags: ['UX', 'Growth'],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 103,
    title: 'Smart Content Calendar',
    description: 'Plan posts, schedule launches, and spot gaps in content themes across channels with lightweight prioritization.',
    category: 'Feature Request',
    votes: 7,
    status: 'In Review',
    tags: ['Marketing', 'Planning'],
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 104,
    title: 'Faster project loading',
    description: 'Improve perceived performance by lazy-loading project assets and reducing layout shifts on portfolio pages.',
    category: 'Performance',
    votes: 15,
    status: 'Ready to Build',
    tags: ['Performance', 'UX'],
    created_at: new Date(Date.now() - 259200000).toISOString()
  }
];

const getIdeaStatus = (idea) => idea?.status || (() => {
  const text = `${idea.title} ${idea.description}`.toLowerCase();
  const score = Number(idea.votes || 0);

  if (score >= 8 || /performance|speed|bug|error|fix|security/.test(text)) {
    return 'Ready to Build';
  }

  if (score >= 3 || /ux|design|user|flow|layout|interface/.test(text)) {
    return 'In Review';
  }

  return 'Backlog';
})();

const deriveTags = (idea) => {
  const text = `${idea.title} ${idea.description}`.toLowerCase();
  const tags = [];

  if (/ai|assistant|ml|automation|model/.test(text)) tags.push('AI');
  if (/ux|design|user|layout|interface|portfolio/.test(text)) tags.push('UX');
  if (/performance|speed|loading|fast|lag/.test(text)) tags.push('Performance');
  if (/content|growth|marketing|launch/.test(text)) tags.push('Growth');
  if (/security|bug|error|fix/.test(text)) tags.push('Quality');

  return tags.slice(0, 2);
};

const getStatusClass = (status) =>
  status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const getPriorityLevel = (idea) => {
  const votes = Number(idea.votes || 0);
  if (votes >= 10 || (idea.status || getIdeaStatus(idea)) === 'Ready to Build') return 'High';
  if (votes >= 5) return 'Medium';
  return 'Low';
};

const boardConfig = [
  {
    id: 'backlog',
    status: 'Backlog',
    title: 'Backlog',
    subtitle: 'New opportunities',
    accent: 'violet'
  },
  {
    id: 'review',
    status: 'In Review',
    title: 'In Review',
    subtitle: 'Worth validating',
    accent: 'blue'
  },
  {
    id: 'build',
    status: 'Ready to Build',
    title: 'Ready to Build',
    subtitle: 'High-impact ideas',
    accent: 'green'
  }
];

function App() {
  const [ideas, setIdeas] = useState([]);
  const [boards, setBoards] = useState([]);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('idea_board_token') || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIdeaId, setDraggedIdeaId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // load stored auth
    const stored = localStorage.getItem('idea_board_token');
    if (stored) setAuthToken(stored);
    initBoardsAndTasks();
  }, []);

  const handleAuth = ({ user, token }) => {
    setAuthUser(user);
    setAuthToken(token);
    initBoardsAndTasks();
  };
  const normalizeIdeas = (items) =>
    items.map(item => ({
      ...item,
      votes: Number(item.votes || 0),
      status: item.status || getIdeaStatus(item),
      tags: item.labels ? (typeof item.labels === 'string' ? JSON.parse(item.labels) : item.labels) : (item.tags && item.tags.length ? item.tags : deriveTags(item))
    }));

  const initBoardsAndTasks = async () => {
    try {
      // fetch or create default board
      let boardsRes = await fetch(`${API_URL.replace('/api','')}/api/boards`);
      if (!boardsRes.ok) throw new Error('Failed to fetch boards');
      let boardsData = await boardsRes.json();
      if ((!Array.isArray(boardsData) || boardsData.length === 0) && authToken) {
        const createRes = await fetch(`${API_URL.replace('/api','')}/api/boards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({ name: 'Main Board', description: 'Default project board' })
        });
        boardsData = [await createRes.json()];
      }
      setBoards(boardsData);
      const boardId = boardsData[0].id;
      setCurrentBoardId(boardId);

      // fetch tasks for board
      const tasksRes = await fetch(`${API_URL.replace('/api','')}/api/tasks?board_id=${boardId}`);
      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      const tasks = await tasksRes.json();
      setIdeas(tasks.length ? normalizeIdeas(tasks) : normalizeIdeas(starterIdeas));
    } catch (err) {
      console.error('Init error:', err);
      setError(err.message);
      setIdeas(normalizeIdeas(starterIdeas));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!authToken) {
        setError('Please login to create tasks');
        return;
      }
      const res = await fetch(`${API_URL.replace('/api','')}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ board_id: currentBoardId, title, description, status: 'Backlog' })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }
      const newTask = await res.json();
      const normalizedTask = { ...newTask, status: newTask.status || 'Backlog', tags: deriveTags(newTask), votes: Number(newTask.votes || 0) };
      setIdeas(prev => [normalizedTask, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      if (!authToken) { setError('Please login to upvote'); return; }
      const res = await fetch(`${API_URL.replace('/api','')}/api/tasks/${id}/upvote`, { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` } });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upvote failed');
      }
      setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, votes: (Number(idea.votes)||0) + 1 } : idea));
    } catch (err) {
      setError(err.message);
    }
  };

  const moveIdeaToStatus = (ideaId, targetStatus) => {
    if (!ideaId || !targetStatus) return;

    setIdeas(prev =>
      prev.map(idea =>
        idea.id === ideaId
          ? { ...idea, status: targetStatus, tags: idea.tags?.length ? idea.tags : deriveTags(idea) }
          : idea
      )
    );
  };

  const visibleIdeas =
    activeFilter === 'all'
      ? ideas
      : activeFilter === 'high'
        ? ideas.filter(idea => getPriorityLevel(idea) === 'High')
        : ideas.filter(idea => getPriorityLevel(idea) !== 'High');

  const boardColumns = boardConfig.map(column => ({
    ...column,
    ideas: visibleIdeas.filter(idea => (idea.status || getIdeaStatus(idea)) === column.status)
  }));

  const topIdea = [...ideas].sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0))[0];
  const reviewIdeas = ideas.filter(idea => (idea.status || getIdeaStatus(idea)) === 'In Review').length;
  const buildIdeas = ideas.filter(idea => (idea.status || getIdeaStatus(idea)) === 'Ready to Build').length;

  const metrics = {
    total: ideas.length,
    prioritized: ideas.filter(idea => getIdeaStatus(idea) !== 'Backlog').length,
    votes: ideas.reduce((sum, idea) => sum + Number(idea.votes || 0), 0),
    review: reviewIdeas,
    build: buildIdeas
  };

  return (
    <div>
      <Navbar />
      <div className="auth-row container">
        <AuthPanel apiBase={API_URL} onAuth={handleAuth} />
      </div>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Reflection />
      <Contact />

      <Kanban
        ideas={ideas}
        setIdeas={setIdeas}
        boardConfig={boardConfig}
        getIdeaStatus={getIdeaStatus}
        deriveTags={deriveTags}
        getPriorityLevel={getPriorityLevel}
        getStatusClass={getStatusClass}
        handleUpvote={handleUpvote}
        apiBase={API_URL}
        apiToken={authToken}
      />
    </div>
  );
}

export default App;
