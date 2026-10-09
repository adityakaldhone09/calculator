import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Calculator from './components/Calculator';
import UnitConverter from './components/UnitConverter';
import HistoryDrawer from './components/HistoryDrawer';
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

  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'converter'

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('calcpulse_theme') || 'aurora';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('calcpulse_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('calcpulse_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedCalcValue, setSelectedCalcValue] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calcpulse_theme', theme);
  }, [theme]);

  // Sync sound preference
  useEffect(() => {
    localStorage.setItem('calcpulse_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('calcpulse_history', JSON.stringify(history));
  }, [history]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleToggleTheme = () => {
    const themes = ['aurora', 'cyber', 'clean', 'light'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
    const themeNames = {
      aurora: 'Aurora Dark',
      cyber: 'Cyber Neon',
      clean: 'Slate Dark',
      light: 'Frost White'
    };
    showToast(`Switched theme to ${themeNames[nextTheme] || nextTheme}`, 'info');
  };

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
    showToast(soundEnabled ? 'Tactile sounds muted' : 'Tactile sounds activated', 'info');
  };

  const handleLoginSuccess = (user, rememberMe) => {
    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem('calcpulse_session', JSON.stringify(user));
    }
    showToast(`Welcome back, ${user.name}! Workspace ready.`, 'success');

    // Fetch history from backend
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history && data.history.length > 0) {
          setHistory(data.history);
        }
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('calcpulse_session');
    showToast('Successfully logged out.', 'info');
  };

  const handleAddHistory = (item) => {
    const entry = {
      ...item,
      id: Date.now() + Math.random().toString(36).substring(2, 6)
    };
    setHistory((prev) => [entry, ...prev.slice(0, 49)]); // keep up to 50 entries

    // Sync with backend API
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression: item.expression,
        result: item.result,
        timestamp: item.timestamp,
        userId: currentUser?.id || 'guest'
      })
    }).catch(() => {});
  };

  const handleClearHistory = () => {
    setHistory([]);
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
    showToast('Calculation tape cleared', 'info');
  };

  const handleSelectHistoryItem = (item) => {
    setSelectedCalcValue(item.result);
    setIsHistoryOpen(false);
    showToast(`Loaded ${item.result} into calculator`, 'info');
  };

  return (
    <div className="app-root">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type} animate-fade-in`}>
          <span>{toast.message}</span>
        </div>
      )}

      {!currentUser ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <div className="workspace-layout">
          <Navbar 
            user={currentUser}
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            historyCount={history.length}
            onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
            isHistoryOpen={isHistoryOpen}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          <main className="main-content-area">
            {activeTab === 'calculator' ? (
              <>
                {/* Calculator Workspace */}
                <Calculator 
                  onAddHistory={handleAddHistory}
                  soundEnabled={soundEnabled}
                  onNotify={showToast}
                  externalValue={selectedCalcValue}
                />

                {/* Quick Keyboard shortcuts hint pill */}
                <div className="shortcuts-pill-banner">
                  <span className="pill-title">⌨ Quick Shortcuts:</span>
                  <span className="pill-item"><kbd>0-9</kbd> Digits</span>
                  <span className="pill-item"><kbd>+</kbd><kbd>-</kbd><kbd>*</kbd><kbd>/</kbd> Ops</span>
                  <span className="pill-item"><kbd>Enter</kbd> Solve</span>
                  <span className="pill-item"><kbd>Esc</kbd> Clear</span>
                  <span className="pill-item"><kbd>⌫</kbd> Del</span>
                </div>
              </>
            ) : (
              /* Unit & Currency Converter Workspace */
              <UnitConverter 
                soundEnabled={soundEnabled}
                onNotify={showToast}
                onSendToCalculator={(val) => {
                  setSelectedCalcValue(val);
                  setActiveTab('calculator');
                  showToast(`Sent ${val} to Calculator!`, 'success');
                }}
              />
            )}
          </main>

          {/* History Drawer */}
          <HistoryDrawer 
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            history={history}
            onClearHistory={handleClearHistory}
            onSelectCalculation={handleSelectHistoryItem}
            onCopyResult={(val) => showToast(`Copied ${val} to clipboard!`, 'success')}
          />
        </div>
      )}
    </div>
  );
}
