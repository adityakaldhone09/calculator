import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { 
  LineChart, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  Eye,
  Table,
  Layers
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './FunctionGrapher.css';

export default function FunctionGrapher({
  soundEnabled,
  onNotify,
  onSendToCalculator
}) {
  const [expression, setExpression] = useState('sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [hoverCoord, setHoverCoord] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, xMin: -10, xMax: 10, yMin: -5, yMax: 5 });

  const formulaInputId = useId();
  const xMinId = useId();
  const xMaxId = useId();
  const yMinId = useId();
  const yMaxId = useId();

  const handleSound = (type = 'default') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  };

  // Safe Math expression evaluator for f(x)
  const evaluateMath = useCallback((expr, x) => {
    try {
      let cleanExpr = expr.toLowerCase();

      // Replace functions and constants with Math.*
      cleanExpr = cleanExpr
        .replace(/\bpi\b/g, `${Math.PI}`)
        .replace(/\be\b/g, `${Math.E}`)
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bexp\b/g, 'Math.exp');

      // Replace powers x^y with Math.pow
      cleanExpr = cleanExpr.replace(/([a-zA-Z0-9_.\)]+)\s*\^\s*([a-zA-Z0-9_.\(]+)/g, 'Math.pow($1, $2)');

      // Replace implicit multiplications like 3x or 2sin
      cleanExpr = cleanExpr.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
      cleanExpr = cleanExpr.replace(/\)([a-zA-Z0-9(])/g, ')*$1');

      // Sanitize tokens
      if (!/^[0-9xX+\-*/%^().,\sMathsincotarqlgexp]+$/.test(cleanExpr)) {
        return NaN;
      }

      // Safe evaluation using Function
      const fn = new Function('x', `return ${cleanExpr};`);
      const val = fn(x);
      return typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : NaN;
    } catch {
      return NaN;
    }
  }, []);

  // Draw Cartesian Graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Detect theme for colors
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    const bgColor = isLightTheme ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)';
    const gridColor = isLightTheme ? 'rgba(148, 163, 184, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    const axisColor = isLightTheme ? 'rgba(71, 85, 105, 0.7)' : 'rgba(255, 255, 255, 0.45)';
    const textColor = isLightTheme ? '#475569' : '#94a3b8';
    const curveColor = isLightTheme ? '#2563eb' : '#38bdf8';
    const glowColor = isLightTheme ? 'rgba(37, 99, 235, 0.3)' : 'rgba(56, 189, 248, 0.4)';

    ctx.clearRect(0, 0, width, height);

    // Coordinate conversion helpers
    const toCanvasX = (x) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (cx) => xMin + (cx / width) * (xMax - xMin);

    // 1. Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const computeStep = (range) => {
      if (range <= 5) return 0.5;
      if (range <= 15) return 1;
      if (range <= 30) return 2;
      if (range <= 60) return 5;
      return 10;
    };

    const xStep = computeStep(xRange);
    const yStep = computeStep(yRange);

    // Vertical grid lines
    ctx.font = '10px monospace';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';

    const startX = Math.floor(xMin / xStep) * xStep;
    for (let x = startX; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(Number(x.toFixed(1)), cx, toCanvasY(0) + 14);
      }
    }

    // Horizontal grid lines
    ctx.textAlign = 'right';
    const startY = Math.floor(yMin / yStep) * yStep;
    for (let y = startY; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(Number(y.toFixed(1)), toCanvasX(0) - 6, cy + 4);
      }
    }

    // 2. Main Axes (X=0 and Y=0)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = axisColor;

    // X Axis
    const cyZero = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, cyZero);
    ctx.lineTo(width, cyZero);
    ctx.stroke();

    // Y Axis
    const cxZero = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(cxZero, 0);
    ctx.lineTo(cxZero, height);
    ctx.stroke();

    // Origin label
    ctx.fillText('0', cxZero - 6, cyZero + 14);

    // 3. Plot Curve f(x)
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = curveColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    let isDrawing = false;
    const pixelStep = 1;

    for (let px = 0; px <= width; px += pixelStep) {
      const x = toMathX(px);
      const y = evaluateMath(expression, x);

      if (isNaN(y) || !isFinite(y)) {
        isDrawing = false;
        continue;
      }

      const py = toCanvasY(y);

      // Clamp huge values to prevent rendering artifacts
      if (py < -height || py > height * 2) {
        isDrawing = false;
        continue;
      }

      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.restore();

    // 4. Hover Crosshair & Coordinate
    if (hoverCoord) {
      const hx = toCanvasX(hoverCoord.x);
      const hy = toCanvasY(hoverCoord.y);

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = isLightTheme ? '#6366f1' : '#a855f7';

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, height);
      ctx.moveTo(0, hy);
      ctx.lineTo(width, hy);
      ctx.stroke();

      // Point circle
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [expression, xMin, xMax, yMin, yMax, hoverCoord, evaluateMath]);

  // Sync canvas size on mount / resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = 360 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = '360px';

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      drawGraph();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGraph]);

  // Redraw when parameters change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Pan / Drag handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      xMin,
      xMax,
      yMin,
      yMax
    };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const width = rect.width;

    // Track math coordinate for cursor tooltip
    const mathX = xMin + (cx / width) * (xMax - xMin);
    const mathY = evaluateMath(expression, mathX);
    if (!isNaN(mathY) && isFinite(mathY)) {
      setHoverCoord({ x: Number(mathX.toFixed(2)), y: Number(mathY.toFixed(2)) });
    } else {
      setHoverCoord(null);
    }

    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const xSpan = dragStartRef.current.xMax - dragStartRef.current.xMin;
    const ySpan = dragStartRef.current.yMax - dragStartRef.current.yMin;

    const dMathX = (dx / rect.width) * xSpan;
    const dMathY = (dy / rect.height) * ySpan;

    setXMin(dragStartRef.current.xMin - dMathX);
    setXMax(dragStartRef.current.xMax - dMathX);
    setYMin(dragStartRef.current.yMin + dMathY);
    setYMax(dragStartRef.current.yMax + dMathY);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleZoom = (factor) => {
    handleSound('operator');
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const newXHalf = ((xMax - xMin) / 2) * factor;
    const newYHalf = ((yMax - yMin) / 2) * factor;

    setXMin(xCenter - newXHalf);
    setXMax(xCenter + newXHalf);
    setYMin(yCenter - newYHalf);
    setYMax(yCenter + newYHalf);
  };

  const handleResetView = () => {
    handleSound('clear');
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
    onNotify?.('Reset graph origin (X: [-10, 10], Y: [-5, 5])', 'info');
  };

  // Preset formulas
  const presets = [
    { label: 'sin(x)', expr: 'sin(x)', desc: 'Sine Wave' },
    { label: 'cos(x)', expr: 'cos(x)', desc: 'Cosine Wave' },
    { label: 'x² - 4', expr: 'x^2 - 4', desc: 'Parabola' },
    { label: 'x³ - 3x', expr: 'x^3 - 3*x', desc: 'Cubic Curve' },
    { label: '√x', expr: 'sqrt(x)', desc: 'Square Root' },
    { label: 'e^(-x²/2)', expr: 'exp(-x^2 / 2)', desc: 'Gaussian Normal' },
    { label: 'sin(x)/x', expr: 'sin(x) / x', desc: 'Sinc Wave Packet' },
    { label: '1/x', expr: '1/x', desc: 'Rational Hyperbola' }
  ];

  // Generate Table of Values
  const generateTableData = () => {
    const rows = [];
    const step = (xMax - xMin) / 10;
    for (let x = xMin; x <= xMax; x += step) {
      const roundedX = Number(x.toFixed(2));
      const val = evaluateMath(expression, roundedX);
      rows.push({
        x: roundedX,
        y: isNaN(val) ? 'Undefined' : Number(val.toFixed(4))
      });
    }
    return rows;
  };

  return (
    <div className="grapher-workspace animate-fade-in">
      <div className="grapher-card">
        {/* Header */}
        <div className="grapher-header">
          <div className="grapher-title-group">
            <h2 className="grapher-title">
              <span className="grapher-icon-box"><LineChart size={20} /></span>
              <span>2D Function Grapher & Plotter</span>
            </h2>
            <p className="grapher-subtitle">Interactive Cartesian plotter with real-time coordinate inspection</p>
          </div>

          {/* Quick Actions */}
          <div className="grapher-quick-tools">
            <button
              type="button"
              className={`tool-action-pill ${showTable ? 'active' : ''}`}
              onClick={() => { handleSound('digit'); setShowTable(!showTable); }}
              title="Toggle discrete table of values"
            >
              <Table size={15} />
              <span>{showTable ? 'Hide Table' : 'Value Table'}</span>
            </button>
            <button
              type="button"
              className="tool-action-pill"
              onClick={handleResetView}
              title="Reset view to origin"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Formula Input Bar */}
        <div className="formula-input-bar">
          <span className="formula-fx-tag">f(x) =</span>
          <input
            id={formulaInputId}
            type="text"
            className="formula-text-input"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. sin(x), x^2 - 4, sqrt(x), exp(-x^2)"
          />
        </div>

        {/* Quick Presets Carousel / Pills */}
        <div className="grapher-presets-row">
          <span className="presets-label"><Sparkles size={13} /> Presets:</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`preset-formula-btn ${expression === preset.expr ? 'active' : ''}`}
              onClick={() => {
                setExpression(preset.expr);
                handleSound('digit');
                onNotify?.(`Loaded formula ${preset.expr} (${preset.desc})`, 'info');
              }}
              title={preset.desc}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Canvas Plotting Container */}
        <div 
          className="grapher-canvas-container" 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { handleMouseUp(); setHoverCoord(null); }}
        >
          <canvas ref={canvasRef} className="cartesian-canvas" />

          {/* Hover Coordinate Badge */}
          {hoverCoord && (
            <div className="coord-tracker-pill animate-fade-in">
              <span className="coord-x">X: {hoverCoord.x}</span>
              <span className="coord-sep">•</span>
              <span className="coord-y">f(X): {hoverCoord.y}</span>
              <button
                type="button"
                className="coord-send-btn"
                onClick={() => {
                  handleSound('operator');
                  onSendToCalculator?.(String(hoverCoord.y));
                  onNotify?.(`Sent ${hoverCoord.y} to Calculator!`, 'success');
                }}
                title="Send y-value to Calculator"
              >
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Canvas Floating Zoom Controls */}
          <div className="canvas-floating-controls">
            <button
              type="button"
              className="floating-ctrl-btn"
              onClick={() => handleZoom(0.75)}
              title="Zoom In (+)"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              className="floating-ctrl-btn"
              onClick={() => handleZoom(1.33)}
              title="Zoom Out (-)"
            >
              <ZoomOut size={16} />
            </button>
            <button
              type="button"
              className="floating-ctrl-btn"
              onClick={handleResetView}
              title="Center Origin"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Domain & Range Sliders / Bounds */}
        <div className="grapher-domain-bar">
          <span className="domain-label"><Sliders size={14} /> Domain Bounds:</span>
          <div className="domain-inputs-row">
            <div className="bound-group">
              <label htmlFor={xMinId}>X Min:</label>
              <input 
                id={xMinId}
                type="number" 
                value={Math.round(xMin)} 
                onChange={(e) => setXMin(Number(e.target.value))} 
              />
            </div>
            <div className="bound-group">
              <label htmlFor={xMaxId}>X Max:</label>
              <input 
                id={xMaxId}
                type="number" 
                value={Math.round(xMax)} 
                onChange={(e) => setXMax(Number(e.target.value))} 
              />
            </div>
            <div className="bound-group">
              <label htmlFor={yMinId}>Y Min:</label>
              <input 
                id={yMinId}
                type="number" 
                value={Math.round(yMin)} 
                onChange={(e) => setYMin(Number(e.target.value))} 
              />
            </div>
            <div className="bound-group">
              <label htmlFor={yMaxId}>Y Max:</label>
              <input 
                id={yMaxId}
                type="number" 
                value={Math.round(yMax)} 
                onChange={(e) => setYMax(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        {/* Value Table Drawer (Collapsible) */}
        {showTable && (
          <div className="value-table-container animate-fade-in">
            <div className="table-header-row">
              <span className="tbl-title">Discrete Sample Table</span>
              <span className="tbl-hint">Click any f(x) row to send value directly to Calculator</span>
            </div>
            <div className="table-scroll-box">
              <table className="values-table">
                <thead>
                  <tr>
                    <th>x</th>
                    <th>f(x) = {expression}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {generateTableData().map((row, idx) => (
                    <tr key={idx}>
                      <td className="mono-cell">{row.x}</td>
                      <td className="mono-cell font-bold">{row.y}</td>
                      <td>
                        {row.y !== 'Undefined' && (
                          <button
                            type="button"
                            className="tbl-send-btn"
                            onClick={() => {
                              handleSound('operator');
                              onSendToCalculator?.(String(row.y));
                              onNotify?.(`Loaded ${row.y} into Calculator`, 'success');
                            }}
                          >
                            <span>Send</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
