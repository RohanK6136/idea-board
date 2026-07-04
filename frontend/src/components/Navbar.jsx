import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode was previously enabled
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <h1 className="navbar-title">
          ROHAN KUMAR BANGALORE SUKUMAR
        </h1>

        <div className="navbar-actions">
          <ul className="navbar-menu">
            <li><a className="nav-button" href="#home">Home</a></li>
            <li><a className="nav-button" href="#about">About</a></li>
            <li><a className="nav-button" href="#skills">Skills</a></li>
            <li><a className="nav-button" href="#projects">Projects</a></li>
            <li><a className="nav-button" href="#reflection">Reflection</a></li>
            <li><a className="nav-button" href="#contact">Contact</a></li>
          </ul>
          
          <button 
            onClick={toggleDarkMode}
            className="theme-toggle"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
