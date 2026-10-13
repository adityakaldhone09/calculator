import React, { useRef, useEffect } from 'react';
import { 
  Calculator, 
  History, 
  Palette, 
  Sun,
  Moon,
  Volume2, 
  VolumeX, 
  Sparkles,
  ArrowRightLeft,
  DollarSign,
  LineChart,
  Grid3X3,
  Infinity as InfinityIcon,
  Compass
} from 'lucide-react';
import './Navbar.css';

const WORKSPACE_TABS = [
  { id: 'calculator', label: 'Calculator', icon: Calculator, title: 'Calculator Workspace' },
  { id: 'converter', label: 'Converter', icon: ArrowRightLeft, title: 'Unit & Currency Converter' },
  { id: 'financial', label: 'Financial', icon: DollarSign, title: 'Financial & Investment Suite' },
  { id: 'grapher', label: 'Grapher', icon: LineChart, title: '2D Function Grapher' },
  { id: 'matrix', label: 'Matrix', icon: Grid3X3, title: 'Matrix & Algebra Studio' },
  { id: 'calculus', label: 'Calculus', icon: InfinityIcon, title: 'Calculus & Numerical Lab' },
  { id: 'complex', label: 'Complex & Geo', icon: Compass, title: 'Complex Numbers & Physics Lab' }
];

export default function Navbar({ 
  theme, 
  onToggleTheme, 
  soundEnabled, 
  onToggleSound, 
  historyCount, 
  onToggleHistory, 
  isHistoryOpen,
  activeTab = 'calculator',
  onSelectTab
}) {
  const activeTabDesktopRef = useRef(null);
  const activeTabMobileRef = useRef(null);
  const mobileScrollRef = useRef(null);

  const getThemeInfo = () => {
    switch (theme) {
      case 'light':
        return { label: 'Frost White', Icon: Sun };
      case 'cyber':
        return { label: 'Cyber Neon', Icon: Sparkles };
      case 'clean':
        return { label: 'Slate Dark', Icon: Moon };
      default:
        return { label: 'Aurora Dark', Icon: Palette };
    }
  };

  const { label: themeLabel, Icon: ThemeIcon } = getThemeInfo();

  // Keep active tab centered in mobile scroll view
  useEffect(() => {
    if (activeTabMobileRef.current && mobileScrollRef.current) {
      const tabEl = activeTabMobileRef.current;
      const trackEl = mobileScrollRef.current;
      const offset = tabEl.offsetLeft - (trackEl.clientWidth / 2) + (tabEl.clientWidth / 2);
      trackEl.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Main Navbar Row */}
        <div className="navbar-main-row">
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

          {/* Desktop Workspace Tabs (Single Row, balanced equal distribution) */}
          {onSelectTab && (
            <nav className="navbar-workspace-tabs desktop-tabs" aria-label="Workspaces">
              {WORKSPACE_TABS.map(({ id, label, icon: TabIcon, title }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    ref={isActive ? activeTabDesktopRef : null}
                    type="button"
                    className={`workspace-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectTab(id)}
                    title={title}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <TabIcon size={15} className="tab-icon" />
                    <span className="tab-label">{label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Symmetrical Action Controls */}
          <div className="navbar-controls">
            {/* Sound Toggle */}
            <button
              type="button"
              className={`nav-action-btn sound-btn ${soundEnabled ? 'active' : ''}`}
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute tactile clicks' : 'Enable tactile clicks'}
              aria-label="Toggle tactile sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="nav-btn-label">{soundEnabled ? 'Sound' : 'Mute'}</span>
            </button>

            {/* Theme Selector Toggle */}
            <button
              type="button"
              className="nav-action-btn theme-btn"
              onClick={onToggleTheme}
              title={`Current theme: ${themeLabel} (Click to cycle themes)`}
              aria-label="Toggle theme"
            >
              <ThemeIcon size={16} />
              <span className="nav-btn-label">{themeLabel}</span>
            </button>

            {/* Calculation History Drawer Button */}
            <button
              type="button"
              className={`nav-action-btn history-btn ${isHistoryOpen ? 'active' : ''}`}
              onClick={onToggleHistory}
              title="Toggle calculation history tape"
              aria-label="Toggle calculation history"
            >
              <History size={16} />
              <span className="nav-btn-label">History</span>
              {historyCount > 0 && (
                <span className="history-pill">{historyCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Responsive Sub-Navbar for Tablets and Mobile (No awkward wrapping, smooth horizontal track) */}
        {onSelectTab && (
          <nav className="navbar-workspace-tabs mobile-tabs" aria-label="Mobile Workspaces">
            <div className="mobile-tabs-track" ref={mobileScrollRef}>
              {WORKSPACE_TABS.map(({ id, label, icon: TabIcon, title }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    ref={isActive ? activeTabMobileRef : null}
                    type="button"
                    className={`workspace-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectTab(id)}
                    title={title}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <TabIcon size={14} className="tab-icon" />
                    <span className="tab-label">{label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
