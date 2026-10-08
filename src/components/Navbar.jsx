import React from 'react';
import { 
  Calculator, 
  History, 
  LogOut, 
  Palette, 
  Volume2, 
  VolumeX, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import './Navbar.css';

export default function Navbar({ 
  user, 
  onLogout, 
  theme, 
  onToggleTheme, 
  soundEnabled, 
  onToggleSound, 
  historyCount, 
  onToggleHistory, 
  isHistoryOpen 
}) {
  const getThemeLabel = () => {
    if (theme === 'cyber') return 'Cyber';
    if (theme === 'clean') return 'Slate';
    return 'Aurora';
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo-box">
            <Calculator size={20} className="navbar-logo-icon" />
          </div>
          <div className="navbar-brand-text">
            <span className="brand-name">Calc<span className="brand-glow">Pulse</span></span>
            <span className="brand-badge">Workspace</span>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="navbar-controls">
          {/* Sound Toggle */}
          <button
            type="button"
            className={`nav-action-btn ${soundEnabled ? 'active' : ''}`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute tactile clicks' : 'Enable tactile clicks'}
            aria-label="Toggle tactile sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Theme Selector Toggle */}
          <button
            type="button"
            className="nav-action-btn theme-btn"
            onClick={onToggleTheme}
            title={`Current theme: ${getThemeLabel()} (Click to toggle)`}
            aria-label="Toggle theme"
          >
            <Palette size={18} />
            <span className="theme-text">{getThemeLabel()}</span>
          </button>

          {/* Calculation History Drawer Button */}
          <button
            type="button"
            className={`nav-action-btn history-btn ${isHistoryOpen ? 'active' : ''}`}
            onClick={onToggleHistory}
            title="Toggle calculation history tape"
            aria-label="Toggle calculation history"
          >
            <History size={18} />
            <span className="history-text">History</span>
            {historyCount > 0 && (
              <span className="history-pill">{historyCount}</span>
            )}
          </button>
        </div>

        {/* User Profile & Sign out */}
        <div className="navbar-user-section">
          <div className="user-profile-badge">
            <div className="user-avatar-circle">
              {user.avatar || 'U'}
            </div>
            <div className="user-details-box">
              <span className="user-name">{user.name}</span>
              <span className="user-status-role">
                <span className="status-dot"></span>
                {user.role || 'Member'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-action-btn"
            onClick={onLogout}
            title="Sign out of CalcPulse"
            aria-label="Sign out"
          >
            <LogOut size={17} />
            <span className="logout-text">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
