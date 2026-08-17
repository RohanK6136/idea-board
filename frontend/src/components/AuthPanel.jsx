import React, { useState } from 'react';

const AuthPanel = ({ apiBase, onAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const doCall = async (path) => {
    setError('');
    try {
      const res = await fetch(`${apiBase}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      const { user, token } = data;
      localStorage.setItem('idea_board_token', token);
      onAuth({ user, token });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-panel">
      <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="auth-actions">
        <button onClick={() => doCall('auth/login')}>Login</button>
        <button onClick={() => doCall('auth/register')}>Register</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default AuthPanel;
