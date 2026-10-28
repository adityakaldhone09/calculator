import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Calculator from './components/Calculator';
import UnitConverter from './components/UnitConverter';
import FinancialCalculator from './components/FinancialCalculator';
import FunctionGrapher from './components/FunctionGrapher';
import MatrixAlgebra from './components/MatrixAlgebra';
import CalculusLab from './components/CalculusLab';
import ComplexPhysicsLab from './components/ComplexPhysicsLab';
import HistoryDrawer from './components/HistoryDrawer';
import './App.css';

export default function App() {
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

  // Load backend history on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/history')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.success && Array.isArray(data.history)) {
          setHistory(data.history);
        }
      })
      .catch((err) => {
        console.warn('Backend history unavailable on startup:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleAddHistory = async (item) => {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: item.expression,
          result: item.result,
          timestamp: item.timestamp
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && data.success && data.entry) {
        setHistory((prev) => [data.entry, ...prev.filter((h) => h.id !== data.entry.id).slice(0, 49)]);
      }
    } catch (err) {
      showToast('Calculation computed, but could not be saved to server tape', 'error');
      console.error('History persistence failed:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      setHistory([]);
      showToast('Calculation tape cleared', 'info');
    } catch (err) {
      showToast('Failed to clear calculation tape on server', 'error');
      console.error('Clear history failed:', err);
    }
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      const res = await fetch(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      setHistory((prev) => prev.filter((item) => item.id !== id));
      showToast('Calculation entry removed', 'info');
    } catch (err) {
      showToast('Failed to delete calculation entry from server', 'error');
      console.error('Delete history item failed:', err);
    }
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

      <div className="workspace-layout">
        <Navbar 
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
            {activeTab === 'calculator' && (
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
            )}

            {activeTab === 'converter' && (
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

            {activeTab === 'financial' && (
              /* Financial & Investment Workspace */
              <FinancialCalculator 
                soundEnabled={soundEnabled}
                onNotify={showToast}
                onSendToCalculator={(val) => {
                  setSelectedCalcValue(val);
                  setActiveTab('calculator');
                  showToast(`Transferred ${val} to Calculator!`, 'success');
                }}
              />
            )}

            {activeTab === 'grapher' && (
              /* 2D Function Grapher Workspace */
              <FunctionGrapher 
                soundEnabled={soundEnabled}
                onNotify={showToast}
                onSendToCalculator={(val) => {
                  setSelectedCalcValue(val);
                  setActiveTab('calculator');
                  showToast(`Transferred ${val} to Calculator!`, 'success');
                }}
              />
            )}

            {activeTab === 'matrix' && (
              /* Matrix Studio & Linear Algebra Workspace */
              <MatrixAlgebra 
                soundEnabled={soundEnabled}
                onNotify={showToast}
                onSendToCalculator={(val) => {
                  setSelectedCalcValue(val);
                  setActiveTab('calculator');
                  showToast(`Transferred ${val} to Calculator!`, 'success');
                }}
              />
            )}

            {activeTab === 'calculus' && (
              /* Calculus & Numerical Lab Workspace */
              <CalculusLab 
                soundEnabled={soundEnabled}
                onNotify={showToast}
                onSendToCalculator={(val) => {
                  setSelectedCalcValue(val);
                  setActiveTab('calculator');
                  showToast(`Transferred ${val} to Calculator!`, 'success');
                }}
              />
            )}

            {activeTab === 'complex' && (
              /* Complex Numbers & Physics Workspace */
              <ComplexPhysicsLab 
                soundEnabled={soundEnabled}
                onNotify={showToast}
                onSendToCalculator={(val) => {
                  setSelectedCalcValue(val);
                  setActiveTab('calculator');
                  showToast(`Transferred ${val} to Calculator!`, 'success');
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
            onDeleteItem={handleDeleteHistoryItem}
            onSelectCalculation={handleSelectHistoryItem}
            onCopyResult={(val) => showToast(`Copied ${val} to clipboard!`, 'success')}
            onNotify={showToast}
          />
        </div>
    </div>
  );
}
