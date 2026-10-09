import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  X, 
  Copy, 
  Check, 
  ArrowUpRight,
  Calculator,
  Search,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import './HistoryDrawer.css';

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  history, 
  onClearHistory, 
  onDeleteItem,
  onSelectCalculation,
  onCopyResult,
  onNotify
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCopied, setAllCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleCopy = (e, item) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.result);
    setCopiedId(item.id);
    onCopyResult?.(item.result);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDeleteSingle = (e, id) => {
    e.stopPropagation();
    onDeleteItem?.(id);
  };

  const handleCopyAll = () => {
    if (history.length === 0) return;
    const tapeText = [
      '=== CalcPulse Calculation Tape ===',
      `Exported: ${new Date().toLocaleString()}`,
      '----------------------------------',
      ...history.map(
        (h) => `[${h.timestamp}] ${h.expression} = ${h.result}`
      ),
      '=================================='
    ].join('\n');

    navigator.clipboard.writeText(tapeText);
    setAllCopied(true);
    onNotify?.('Copied full calculation tape to clipboard!', 'success');
    setTimeout(() => setAllCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const header = 'Timestamp,Expression,Result\n';
    const rows = history
      .map(
        (h) =>
          `"${h.timestamp}","${h.expression?.replace(/"/g, '""')}","${h.result?.replace(/"/g, '""')}"`
      )
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `calcpulse_tape_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify?.('Exported calculation tape as CSV!', 'success');
  };

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.expression && item.expression.toLowerCase().includes(term)) ||
      (item.result && item.result.toLowerCase().includes(term))
    );
  });

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
                title="Clear entire calculation tape"
              >
                <Trash2 size={15} />
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

        {/* Search & Export Toolbar */}
        {history.length > 0 && (
          <div className="history-toolbar">
            <div className="history-search-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tape..."
                className="history-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="history-export-actions">
              <button
                type="button"
                className={`export-action-btn ${showStats ? 'active' : ''}`}
                onClick={() => setShowStats(!showStats)}
                title="Toggle tape numerical statistics"
              >
                <BarChart3 size={14} />
                <span>{showStats ? 'Stats' : 'Stats'}</span>
              </button>

              <button
                type="button"
                className="export-action-btn"
                onClick={handleCopyAll}
                title="Copy all tape calculations"
              >
                {allCopied ? <Check size={14} className="copied-check" /> : <Copy size={14} />}
                <span>{allCopied ? 'Copied' : 'Copy Tape'}</span>
              </button>

              <button
                type="button"
                className="export-action-btn"
                onClick={handleExportCSV}
                title="Export tape as CSV spreadsheet"
              >
                <FileSpreadsheet size={14} />
                <span>CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Tape Statistics Panel */}
        {showStats && history.length > 0 && (() => {
          const validNumbers = history
            .map((h) => parseFloat(h.result))
            .filter((n) => !isNaN(n) && isFinite(n));
          if (validNumbers.length === 0) return null;

          const sum = validNumbers.reduce((a, b) => a + b, 0);
          const mean = sum / validNumbers.length;
          const min = Math.min(...validNumbers);
          const max = Math.max(...validNumbers);

          return (
            <div className="history-stats-panel animate-fade-in">
              <div className="stats-row">
                <button
                  type="button"
                  className="stat-pill"
                  onClick={() => onSelectCalculation?.({ result: String(Number(mean.toFixed(6))) })}
                  title="Click to load Average into Calculator"
                >
                  <span className="stat-label">Average (μ):</span>
                  <span className="stat-val">{Number(mean.toFixed(4))}</span>
                </button>
                <button
                  type="button"
                  className="stat-pill"
                  onClick={() => onSelectCalculation?.({ result: String(Number(sum.toFixed(6))) })}
                  title="Click to load Total Sum into Calculator"
                >
                  <span className="stat-label">Sum (Σ):</span>
                  <span className="stat-val">{Number(sum.toFixed(4))}</span>
                </button>
              </div>
              <div className="stats-row">
                <span className="stat-pill-sm">Min: {min}</span>
                <span className="stat-pill-sm">Max: {max}</span>
                <span className="stat-pill-sm">Count: {validNumbers.length}</span>
              </div>
            </div>
          );
        })()}

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
          ) : filteredHistory.length === 0 ? (
            <div className="history-empty">
              <p className="empty-title">No matching calculations</p>
              <p className="empty-subtitle">
                No entries match your search query "{searchTerm}".
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onSelectCalculation(item)}
                title="Click to restore this result into calculator"
              >
                <div className="history-item-top">
                  <span className="history-time">{item.timestamp}</span>
                  <div className="history-item-actions">
                    <button
                      type="button"
                      className="history-item-copy-btn"
                      onClick={(e) => handleCopy(e, item)}
                      title="Copy result to clipboard"
                    >
                      {copiedId === item.id ? <Check size={14} className="copied-check" /> : <Copy size={14} />}
                    </button>
                    {onDeleteItem && (
                      <button
                        type="button"
                        className="history-item-delete-btn"
                        onClick={(e) => handleDeleteSingle(e, item.id)}
                        title="Delete calculation from tape"
                        aria-label="Delete calculation"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
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
            <span>💡 Click any row to load value back into keypad</span>
          </div>
        )}
      </aside>
    </div>
  );
}
