import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : '/api';

function App() {
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`${API_URL}/ideas`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setIdeas(data);
      } else {
        console.error('Expected array, got:', data);
        setIdeas([]);
        setError('Received invalid data from server');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setIdeas([]);
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
      setIdeas(prev => [newIdea, ...prev]);
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

  return (
    <div className="container">
      <h1>Idea Board</h1>

      <form onSubmit={handleSubmit} className="idea-form">
        <input
          type="text"
          placeholder="Idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <textarea
          placeholder="Describe your idea..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows="3"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Idea'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>

      <div className="ideas-feed">
        {ideas.length === 0 ? (
          <p className="empty">No ideas yet. Be the first!</p>
        ) : (
          ideas.map(idea => (
            <div key={idea.id} className="idea-card">
              <div className="idea-header">
                <h3>{idea.title}</h3>
                <span className="category">{idea.category}</span>
              </div>
              <p>{idea.description}</p>
              <div className="idea-footer">
                <button onClick={() => handleUpvote(idea.id)}>
                  ⬆ Upvote ({idea.votes})
                </button>
                <span className="timestamp">
                  {new Date(idea.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
