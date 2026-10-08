import React from 'react';
import { 
  History, 
  Trash2, 
  X, 
  Copy, 
  Check, 
  ArrowUpRight,
  Calculator
} from 'lucide-react';
import './HistoryDrawer.css';

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  history, 
  onClearHistory, 
  onSelectCalculation,
  onCopyResult 
}) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (e, item) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.result);
    setCopiedId(item.id);
    onCopyResult?.(item.result);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="history-backdrop" onClick={onClose}>
      <aside 
        className="history-drawer animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        aria-label="Calculation History Panel"
      >
        {/* Drawer Header */}
        <div className="history-header">
          <div className="history-title-group">
            <History size={20} className="history-title-icon" />
            <h3>Calculation Tape</h3>
            <span className="history-badge">{history.length}</span>
          </div>

          <div className="history-header-actions">
            {history.length > 0 && (
              <button
                type="button"
                className="history-clear-btn"
                onClick={onClearHistory}
                title="Clear all history"
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              className="history-close-btn"
              onClick={onClose}
              aria-label="Close history drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List of calculations */}
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon-circle">
                <Calculator size={28} />
              </div>
              <p className="empty-title">No calculations yet</p>
              <p className="empty-subtitle">
                Perform calculations to record them to your persistent session tape.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onSelectCalculation(item)}
                title="Click to restore this result into calculator"
              >
                <div className="history-item-top">
                  <span className="history-time">{item.timestamp}</span>
                  <button
                    type="button"
                    className="history-item-copy-btn"
                    onClick={(e) => handleCopy(e, item)}
                    title="Copy result to clipboard"
                  >
                    {copiedId === item.id ? <Check size={14} className="copied-check" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="history-expression">{item.expression}</div>
                <div className="history-result">
                  <span className="equals-sign">=</span>
                  <span className="result-val">{item.result}</span>
                  <ArrowUpRight size={14} className="restore-indicator" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer tip */}
        {history.length > 0 && (
          <div className="history-footer">
            <span>💡 Tip: Click any row to load value back into keypad</span>
          </div>
        )}
      </aside>
    </div>
  );
}
