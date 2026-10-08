import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('calcpulse_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('calcpulse_theme') || 'aurora';
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calcpulse_theme', theme);
  }, [theme]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleLoginSuccess = (user, rememberMe) => {
    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem('calcpulse_session', JSON.stringify(user));
    }
    showToast(`Welcome back, ${user.name}! Workspace ready.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('calcpulse_session');
    showToast('Successfully logged out.', 'info');
  };

  return (
    <div className="app-root">
      {/* Toast Notification Container */}
      {toast && (
        <div className={`toast-notification toast-${toast.type} animate-fade-in`}>
          <span>{toast.message}</span>
        </div>
      )}

      {!currentUser ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="authenticated-layout">
          <div className="auth-preview-header">
            <div>
              <h2>Welcome, {currentUser.name}</h2>
              <p>Logged in as {currentUser.email} • {currentUser.role}</p>
            </div>
            <button className="preview-logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
