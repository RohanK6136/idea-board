import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Reflection from './components/Reflection';
import Contact from './components/Contact';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIdeaId, setDraggedIdeaId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const normalizeIdeas = (items) =>
    items.map(item => ({
      ...item,
      votes: Number(item.votes || 0),
      status: item.status || getIdeaStatus(item),
      tags: item.tags && item.tags.length ? item.tags : deriveTags(item)
    }));

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`${API_URL}/ideas`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setIdeas(data.length ? normalizeIdeas(data) : normalizeIdeas(starterIdeas));
      } else {
        console.error('Expected array, got:', data);
        setIdeas(normalizeIdeas(starterIdeas));
        setError('Received invalid data from server');
      }
    } catch (err) {
      console.error('Fetch error:', err);
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
      const res = await fetch(`${API_URL}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }
      const newIdea = await res.json();
      const normalizedIdea = {
        ...newIdea,
        status: getIdeaStatus(newIdea),
        tags: deriveTags(newIdea),
        votes: Number(newIdea.votes || 0)
      };
      setIdeas(prev => [normalizedIdea, ...prev]);
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
      const res = await fetch(`${API_URL}/ideas/${id}/upvote`, {
        method: 'POST'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upvote failed');
      }
      setIdeas(prev =>
        prev.map(idea =>
          idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
        )
      );
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
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Reflection />
      <Contact />

      <section className="board-section">
        <div className="board-shell container">
          <div className="board-header">
            <div>
              <p className="eyebrow">Product discovery</p>
              <h1>Idea Board</h1>
            </div>
            <div className="board-metrics">
              <div className="metric">
                <span className="metric-label">Ideas</span>
                <strong>{metrics.total}</strong>
              </div>
              <div className="metric">
                <span className="metric-label">Priority</span>
                <strong>{metrics.prioritized}</strong>
              </div>
              <div className="metric">
                <span className="metric-label">Votes</span>
                <strong>{metrics.votes}</strong>
              </div>
            </div>
          </div>

          <div className="board-filters" aria-label="Board filters">
            {['all', 'high', 'other'].map(filter => (
              <button
                key={filter}
                type="button"
                className={activeFilter === filter ? 'filter-button active' : 'filter-button'}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'All ideas' : filter === 'high' ? 'High priority' : 'Needs attention'}
              </button>
            ))}
          </div>

          <div className="board-context-bar">
            <div className="context-copy">
              <span className="context-chip">Context-aware</span>
              <span>Prioritize the ideas that can deliver the strongest product impact.</span>
            </div>
            <div className="drag-hint">Drag cards between stages</div>
          </div>

          <div className="signal-grid">
            <div className="signal-card signal-main">
              <span className="signal-label">Top idea</span>
              <strong>{topIdea ? topIdea.title : 'No ideas yet'}</strong>
              <small>{topIdea ? `${topIdea.votes} votes · ${topIdea.category}` : 'Add the first opportunity'}</small>
            </div>
            <div className="signal-card">
              <span className="signal-label">In review</span>
              <strong>{metrics.review}</strong>
              <small>Ideas being validated</small>
            </div>
            <div className="signal-card">
              <span className="signal-label">Ready to build</span>
              <strong>{metrics.build}</strong>
              <small>High-confidence bets</small>
            </div>
            <div className="signal-card">
              <span className="signal-label">Momentum</span>
              <strong>{metrics.votes}</strong>
              <small>Total community votes</small>
            </div>
          </div>

          <div className="board-layout">
            <aside className="idea-form-panel">
              <div className="panel-header">
                <h2>Submit an idea</h2>
                <span>Capture the next opportunity</span>
              </div>

              <form onSubmit={handleSubmit} className="idea-form">
                <input
                  type="text"
                  placeholder="Idea title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
                <textarea
                  placeholder="Describe the problem, opportunity, or user need..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows="4"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Add to board'}
                </button>
                {error && <div className="error">{error}</div>}
              </form>
            </aside>

            <div className="board-columns">
              {boardColumns.map(column => (
                <div
                  key={column.id}
                  className={`board-column ${column.accent}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => moveIdeaToStatus(draggedIdeaId, column.status)}
                >
                  <div className="column-header">
                    <div>
                      <h3>{column.title}</h3>
                      <small>{column.subtitle}</small>
                    </div>
                    <span className="column-count">{column.ideas.length}</span>
                  </div>

                  <div className="ideas-feed">
                    {column.ideas.length === 0 ? (
                      <div className="empty-column">
                        <p>No ideas here yet.</p>
                      </div>
                    ) : (
                      column.ideas.map(idea => {
                        const status = getIdeaStatus(idea);
                        return (
                          <article
                            key={idea.id}
                            className={`idea-card status-${getStatusClass(status)}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggedIdeaId(idea.id);
                            }}
                            onDragEnd={() => setDraggedIdeaId(null)}
                          >
                            <div className="idea-topline">
                              <span className="category">{idea.category}</span>
                              <span className="status-pill">{status}</span>
                            </div>

                            <div className="idea-meta-row">
                              <span className={`priority-badge priority-${getPriorityLevel(idea).toLowerCase()}`}>
                                {getPriorityLevel(idea)} priority
                              </span>
                            </div>

                            <div className="tag-row">
                              {(idea.tags || deriveTags(idea)).map(tag => (
                                <span key={tag} className="tag-chip">{tag}</span>
                              ))}
                            </div>

                            <h4>{idea.title}</h4>
                            <p>{idea.description}</p>
                            <div className="idea-footer">
                              <button onClick={() => handleUpvote(idea.id)}>
                                ▲ {idea.votes}
                              </button>
                              <span className="timestamp">
                                {new Date(idea.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
