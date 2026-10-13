import React, { useState, useMemo, useId } from 'react';
import { 
  Infinity as InfinityIcon, 
  TrendingUp, 
  Search, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Layers
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './CalculusLab.css';

// Safe Math expression evaluator for f(x)
function evaluateMath(expr, x) {
  try {
    let clean = expr.toLowerCase().trim();
    // Replace powers
    clean = clean.replace(/\^/g, '**');
    // Replace constants
    clean = clean.replace(/\bpi\b/g, 'Math.PI');
    clean = clean.replace(/\be\b/g, 'Math.E');
    // Replace functions
    clean = clean.replace(/\bsin\b/g, 'Math.sin');
    clean = clean.replace(/\bcos\b/g, 'Math.cos');
    clean = clean.replace(/\btan\b/g, 'Math.tan');
    clean = clean.replace(/\bsqrt\b/g, 'Math.sqrt');
    clean = clean.replace(/\babs\b/g, 'Math.abs');
    clean = clean.replace(/\bln\b/g, 'Math.log');
    clean = clean.replace(/\blog\b/g, 'Math.log10');
    clean = clean.replace(/\bexp\b/g, 'Math.exp');

    // Create safe function
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', 'Math', `return (${clean});`);
    const val = fn(x, Math);
    return typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : null;
  } catch {
    return null;
  }
}

export default function CalculusLab({ soundEnabled, onNotify, onSendToCalculator }) {
  const [subTab, setSubTab] = useState('integral'); // 'integral' | 'derivative' | 'roots'

  // --- Sub-Tab 1: Numerical Integration ---
  const [intExpr, setIntExpr] = useState('x^3 - 3*x + 2');
  const [intA, setIntA] = useState(0);
  const [intB, setIntB] = useState(3);
  const [intN, setIntN] = useState(60); // number of subintervals (even number)

  // --- Sub-Tab 2: Derivative & Curvature ---
  const [derivExpr, setDerivExpr] = useState('sin(x) * exp(-0.1*x)');
  const [derivX0, setDerivX0] = useState(1.57);
  const [stepH, setStepH] = useState(0.0001);

  // --- Sub-Tab 3: Numerical Root Finder ---
  const [rootExpr, setRootExpr] = useState('x^3 - 2*x - 5');
  const [rootMethod, setRootMethod] = useState('newton'); // 'newton' | 'bisection'
  const [initGuess, setInitGuess] = useState(2);
  const [bisectA, setBisectA] = useState(1);
  const [bisectB, setBisectB] = useState(3);
  const [tolerance, setTolerance] = useState(0.000001);
  const [maxIter, setMaxIter] = useState(15);

  const intExprId = useId();
  const intAId = useId();
  const intBId = useId();
  const intNId = useId();
  const derivExprId = useId();
  const derivX0Id = useId();
  const stepHId = useId();
  const rootExprId = useId();

  const handleSound = (type = 'default') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  };

  // --- Integration Computations ---
  const integrationResults = useMemo(() => {
    const a = parseFloat(intA);
    const b = parseFloat(intB);
    const n = Math.max(4, Math.floor(parseInt(intN, 10) || 60));
    const evenN = n % 2 === 0 ? n : n + 1;

    if (isNaN(a) || isNaN(b) || a === b) {
      return { valid: false, error: 'Invalid bounds (a must not equal b).' };
    }

    const h = (b - a) / evenN;
    let simpsonSum = 0;
    let trapSum = 0;
    let midpointSum = 0;
    let leftSum = 0;
    let rightSum = 0;

    const samples = [];
    const numPlotPoints = 100;
    const plotH = (b - a) / numPlotPoints;

    for (let i = 0; i <= numPlotPoints; i++) {
      const px = a + i * plotH;
      const py = evaluateMath(intExpr, px);
      samples.push({ x: px, y: py !== null ? py : 0 });
    }

    // Evaluate endpoints
    const fA = evaluateMath(intExpr, a);
    const fB = evaluateMath(intExpr, b);
    if (fA === null || fB === null) {
      return { valid: false, error: 'Cannot evaluate function at endpoints.' };
    }

    simpsonSum = fA + fB;
    trapSum = (fA + fB) / 2;

    for (let i = 1; i < evenN; i++) {
      const xi = a + i * h;
      const yi = evaluateMath(intExpr, xi);
      if (yi === null) {
        return { valid: false, error: `Function undefined at x = ${xi.toFixed(4)}` };
      }
      trapSum += yi;
      simpsonSum += (i % 2 === 0 ? 2 : 4) * yi;
      leftSum += yi;
    }

    leftSum += fA;
    leftSum *= h;

    for (let i = 1; i <= evenN; i++) {
      const xi = a + i * h;
      const yi = evaluateMath(intExpr, xi);
      if (yi !== null) rightSum += yi;
    }
    rightSum *= h;

    for (let i = 0; i < evenN; i++) {
      const m = a + (i + 0.5) * h;
      const ym = evaluateMath(intExpr, m);
      if (ym !== null) midpointSum += ym;
    }
    midpointSum *= h;

    const simpsonValue = (simpsonSum * h) / 3;
    const trapValue = trapSum * h;
    const errorEstimate = Math.abs(simpsonValue - trapValue) / 3;
    const avgValue = simpsonValue / (b - a);

    return {
      valid: true,
      a,
      b,
      n: evenN,
      h,
      simpson: simpsonValue,
      trapezoid: trapValue,
      midpoint: midpointSum,
      leftRiemann: leftSum,
      rightRiemann: rightSum,
      errorEst: errorEstimate,
      avgValue,
      samples
    };
  }, [intExpr, intA, intB, intN]);

  // --- SVG Path Generator for Integration Area ---
  const svgGraph = useMemo(() => {
    if (!integrationResults.valid || !integrationResults.samples.length) return null;
    const { samples, a, b } = integrationResults;
    const width = 500;
    const height = 180;
    const padding = 20;

    let minY = Infinity;
    let maxY = -Infinity;
    samples.forEach(pt => {
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });

    if (minY > 0) minY = 0;
    if (maxY < 0) maxY = 0;
    if (Math.abs(maxY - minY) < 1e-6) {
      maxY = minY + 1;
    }

    const scaleX = (x) => padding + ((x - a) / (b - a)) * (width - 2 * padding);
    const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding);

    const zeroY = scaleY(0);

    let pathD = `M ${scaleX(samples[0].x)} ${scaleY(samples[0].y)}`;
    samples.slice(1).forEach(pt => {
      pathD += ` L ${scaleX(pt.x)} ${scaleY(pt.y)}`;
    });

    const areaD = `${pathD} L ${scaleX(samples[samples.length - 1].x)} ${zeroY} L ${scaleX(samples[0].x)} ${zeroY} Z`;

    return {
      width,
      height,
      pathD,
      areaD,
      zeroY,
      minY,
      maxY
    };
  }, [integrationResults]);

  // --- Derivative & Curvature Computations ---
  const derivResults = useMemo(() => {
    const x0 = parseFloat(derivX0);
    const h = Math.max(1e-7, parseFloat(stepH) || 1e-4);

    if (isNaN(x0)) return { valid: false, error: 'Invalid evaluation point x₀.' };

    const f0 = evaluateMath(derivExpr, x0);
    const fPlus = evaluateMath(derivExpr, x0 + h);
    const fMinus = evaluateMath(derivExpr, x0 - h);
    const fPlus2 = evaluateMath(derivExpr, x0 + 2 * h);
    const fMinus2 = evaluateMath(derivExpr, x0 - 2 * h);

    if (f0 === null || fPlus === null || fMinus === null) {
      return { valid: false, error: 'Function cannot be evaluated in the neighborhood of x₀.' };
    }

    // Central difference 5-point stencil for high precision
    let fPrime;
    if (fPlus2 !== null && fMinus2 !== null) {
      fPrime = (-fPlus2 + 8 * fPlus - 8 * fMinus + fMinus2) / (12 * h);
    } else {
      fPrime = (fPlus - fMinus) / (2 * h);
    }

    // Second derivative
    const fDoublePrime = (fPlus - 2 * f0 + fMinus) / (h * h);

    // Tangent line: y = m(x - x0) + y0 => y = mx + (y0 - m*x0)
    const m = fPrime;
    const c = f0 - m * x0;

    // Normal line: slope = -1/m
    const normalM = Math.abs(m) > 1e-8 ? -1 / m : null;
    const normalC = normalM !== null ? f0 - normalM * x0 : null;

    // Curvature kappa = |f''| / (1 + f'^2)^(3/2)
    const kappa = Math.abs(fDoublePrime) / Math.pow(1 + fPrime * fPrime, 1.5);
    const radius = kappa > 1e-9 ? 1 / kappa : Infinity;

    return {
      valid: true,
      x0,
      f0,
      fPrime,
      fDoublePrime,
      tangentSlope: m,
      tangentIntercept: c,
      normalSlope: normalM,
      normalIntercept: normalC,
      curvature: kappa,
      radiusOfCurvature: radius,
      concavity: fDoublePrime > 1e-6 ? 'Concave Up (∪)' : fDoublePrime < -1e-6 ? 'Concave Down (∩)' : 'Inflection Point (~)'
    };
  }, [derivExpr, derivX0, stepH]);

  // --- Numerical Root Finder Computations ---
  const rootResults = useMemo(() => {
    const tol = Math.max(1e-12, parseFloat(tolerance) || 1e-6);
    const maxI = Math.min(30, Math.max(3, parseInt(maxIter, 10) || 15));

    if (rootMethod === 'newton') {
      let x = parseFloat(initGuess);
      if (isNaN(x)) return { valid: false, error: 'Please enter a valid initial guess x₀.' };

      const history = [];
      const h = 1e-5;
      let converged = false;

      for (let i = 0; i < maxI; i++) {
        const fx = evaluateMath(rootExpr, x);
        if (fx === null) {
          return { valid: false, error: `Function evaluation failed at x = ${x.toFixed(4)}` };
        }

        // Numerical derivative
        const fPlus = evaluateMath(rootExpr, x + h);
        const fMinus = evaluateMath(rootExpr, x - h);
        if (fPlus === null || fMinus === null) break;
        const dfx = (fPlus - fMinus) / (2 * h);

        if (Math.abs(dfx) < 1e-12) {
          history.push({ step: i + 1, x, fx, dfx, delta: 0, note: 'Derivative is zero.' });
          break;
        }

        const delta = fx / dfx;
        const nextX = x - delta;
        history.push({
          step: i + 1,
          x,
          fx,
          dfx,
          delta: Math.abs(delta)
        });

        if (Math.abs(delta) < tol || Math.abs(fx) < tol) {
          converged = true;
          x = nextX;
          break;
        }
        x = nextX;
      }

      const finalFx = evaluateMath(rootExpr, x);
      return {
        valid: true,
        method: 'Newton-Raphson',
        root: x,
        fRoot: finalFx,
        converged,
        iterations: history.length,
        history
      };
    } else {
      // Bisection Method
      let a = parseFloat(bisectA);
      let b = parseFloat(bisectB);
      if (isNaN(a) || isNaN(b) || a >= b) {
        return { valid: false, error: 'Invalid interval: require a < b.' };
      }

      let fa = evaluateMath(rootExpr, a);
      let fb = evaluateMath(rootExpr, b);
      if (fa === null || fb === null) {
        return { valid: false, error: 'Cannot evaluate function at bracket endpoints.' };
      }

      if (fa * fb > 0) {
        return { valid: false, error: `f(a) and f(b) must have opposite signs. Got f(${a}) = ${fa.toFixed(3)}, f(${b}) = ${fb.toFixed(3)}.` };
      }

      const history = [];
      let converged = false;
      let mid = (a + b) / 2;

      for (let i = 0; i < maxI; i++) {
        mid = (a + b) / 2;
        const fMid = evaluateMath(rootExpr, mid);
        if (fMid === null) break;

        const delta = Math.abs(b - a) / 2;
        history.push({
          step: i + 1,
          x: mid,
          fx: fMid,
          dfx: null,
          delta
        });

        if (Math.abs(fMid) < tol || delta < tol) {
          converged = true;
          break;
        }

        if (fa * fMid < 0) {
          b = mid;
          fb = fMid;
        } else {
          a = mid;
          fa = fMid;
        }
      }

      return {
        valid: true,
        method: 'Bisection Method',
        root: mid,
        fRoot: evaluateMath(rootExpr, mid),
        converged,
        iterations: history.length,
        history
      };
    }
  }, [rootExpr, rootMethod, initGuess, bisectA, bisectB, tolerance, maxIter]);

  // Quick preset loader for Integrals
  const loadIntegralPreset = (expr, a, b) => {
    handleSound('digit');
    setIntExpr(expr);
    setIntA(a);
    setIntB(b);
    if (onNotify) onNotify(`Loaded preset: ∫ ${expr}`, 'info');
  };

  // Quick preset loader for Derivatives
  const loadDerivPreset = (expr, x0) => {
    handleSound('digit');
    setDerivExpr(expr);
    setDerivX0(x0);
    if (onNotify) onNotify(`Loaded preset: ${expr} at x₀ = ${x0}`, 'info');
  };

  // Quick preset loader for Root Finder
  const loadRootPreset = (expr, method, x0, a, b) => {
    handleSound('digit');
    setRootExpr(expr);
    setRootMethod(method);
    if (method === 'newton') setInitGuess(x0);
    else {
      setBisectA(a);
      setBisectB(b);
    }
    if (onNotify) onNotify(`Loaded equation: ${expr} = 0`, 'info');
  };

  return (
    <div className="calculus-workspace animate-fade-in">
      {/* Workspace Header & Sub-Navigation */}
      <div className="calculus-top-bar">
        <div className="calc-header-title">
          <div className="calc-icon-bubble">
            <InfinityIcon size={22} className="calc-accent-icon" />
          </div>
          <div>
            <h2 className="calc-title">Calculus & Numerical Lab</h2>
            <p className="calc-subtitle">Simpson's integration, curvature analysis, and Newton-Raphson root engine</p>
          </div>
        </div>

        <div className="calculus-subtabs">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'integral' ? 'active' : ''}`}
            onClick={() => { handleSound('operator'); setSubTab('integral'); }}
          >
            <Layers size={15} />
            <span>Definite Integrals</span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'derivative' ? 'active' : ''}`}
            onClick={() => { handleSound('operator'); setSubTab('derivative'); }}
          >
            <TrendingUp size={15} />
            <span>Derivatives & Curvature</span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'roots' ? 'active' : ''}`}
            onClick={() => { handleSound('operator'); setSubTab('roots'); }}
          >
            <Search size={15} />
            <span>Root Finder</span>
          </button>
        </div>
      </div>

      {/* ==================== SUBTAB 1: DEFINITE INTEGRALS ==================== */}
      {subTab === 'integral' && (
        <div className="calculus-content-grid animate-fade-in">
          {/* Controls Panel */}
          <div className="calc-glass-card control-card">
            <h3 className="card-section-title">
              <Layers size={17} />
              <span>Integral Configuration</span>
            </h3>

            {/* Presets */}
            <div className="preset-chip-row">
              <span className="preset-label">Presets:</span>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadIntegralPreset('x^3 - 3*x + 2', 0, 3)}
              >
                Cubic Polynomial
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadIntegralPreset('sin(x)', 0, Math.PI)}
              >
                Half Sine Wave
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadIntegralPreset('exp(-x^2)', 0, 1.5)}
              >
                Gaussian Error
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadIntegralPreset('1 / (1 + x^2)', 0, 1)}
              >
                Arctan (π/4)
              </button>
            </div>

            {/* Function f(x) input */}
            <div className="input-field-group">
              <label htmlFor={intExprId} className="field-label">Integrand Function f(x)</label>
              <div className="math-input-wrapper">
                <span className="math-prefix">f(x) =</span>
                <input
                  id={intExprId}
                  type="text"
                  className="math-text-input"
                  value={intExpr}
                  onChange={(e) => setIntExpr(e.target.value)}
                  placeholder="e.g. x^2, sin(x), exp(-x)"
                />
              </div>
            </div>

            {/* Interval Bounds [a, b] & Subdivisions */}
            <div className="param-grid-row">
              <div className="input-field-group">
                <label htmlFor={intAId} className="field-label">Lower Bound (a)</label>
                <input
                  id={intAId}
                  type="number"
                  step="any"
                  className="math-num-input"
                  value={intA}
                  onChange={(e) => setIntA(e.target.value)}
                />
              </div>

              <div className="input-field-group">
                <label htmlFor={intBId} className="field-label">Upper Bound (b)</label>
                <input
                  id={intBId}
                  type="number"
                  step="any"
                  className="math-num-input"
                  value={intB}
                  onChange={(e) => setIntB(e.target.value)}
                />
              </div>

              <div className="input-field-group">
                <label htmlFor={intNId} className="field-label">Subintervals (n)</label>
                <input
                  id={intNId}
                  type="number"
                  min="4"
                  max="1000"
                  step="2"
                  className="math-num-input"
                  value={intN}
                  onChange={(e) => setIntN(e.target.value)}
                />
              </div>
            </div>

            {/* Integral Mathematical Formula Display */}
            <div className="formula-display-banner">
              <span className="integral-sym">∫</span>
              <span className="integral-bounds">
                <span className="bound-upper">{intB}</span>
                <span className="bound-lower">{intA}</span>
              </span>
              <span className="integral-expr">({intExpr}) dx</span>
            </div>

            {/* Visual Riemann Area Canvas SVG */}
            {svgGraph && (
              <div className="integral-svg-container">
                <div className="svg-header-bar">
                  <span>Visual Definite Integral Area</span>
                  <span className="svg-sub">Region under f(x) over [{intA}, {intB}]</span>
                </div>
                <svg viewBox={`0 0 ${svgGraph.width} ${svgGraph.height}`} className="integral-svg">
                  {/* Zero axis line */}
                  <line 
                    x1="10" 
                    y1={svgGraph.zeroY} 
                    x2={svgGraph.width - 10} 
                    y2={svgGraph.zeroY} 
                    stroke="var(--border-medium)" 
                    strokeDasharray="4 4" 
                  />
                  {/* Area fill */}
                  <path d={svgGraph.areaD} fill="url(#integralGradient)" opacity="0.35" />
                  {/* Function curve */}
                  <path d={svgGraph.pathD} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />

                  <defs>
                    <linearGradient id="integralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="calc-glass-card results-card">
            <h3 className="card-section-title">
              <Sparkles size={17} />
              <span>Numerical Quadrature Results</span>
            </h3>

            {integrationResults.valid ? (
              <div className="results-inner-stack">
                {/* Hero Simpson Result */}
                <div className="hero-result-box">
                  <div className="hero-meta">
                    <span className="badge-pill">Simpson's 1/3 Rule (High Precision)</span>
                    <span className="step-size-label">Step h = {integrationResults.h.toFixed(5)}</span>
                  </div>
                  <div className="hero-val-row">
                    <span className="hero-number">{integrationResults.simpson.toFixed(8)}</span>
                    {onSendToCalculator && (
                      <button
                        type="button"
                        className="send-calc-btn"
                        onClick={() => {
                          handleSound('equals');
                          onSendToCalculator(integrationResults.simpson.toFixed(6));
                        }}
                        title="Send result to Calculator"
                      >
                        <ArrowRight size={14} />
                        <span>Send to Calc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Comparative Table of Approximations */}
                <div className="quadrature-stats-grid">
                  <div className="stat-card">
                    <span className="stat-title">Trapezoidal Rule</span>
                    <span className="stat-val">{integrationResults.trapezoid.toFixed(7)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-title">Midpoint Rule</span>
                    <span className="stat-val">{integrationResults.midpoint.toFixed(7)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-title">Left Riemann Sum</span>
                    <span className="stat-val">{integrationResults.leftRiemann.toFixed(7)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-title">Right Riemann Sum</span>
                    <span className="stat-val">{integrationResults.rightRiemann.toFixed(7)}</span>
                  </div>
                  <div className="stat-card highlight">
                    <span className="stat-title">Estimated Error (T-S)/3</span>
                    <span className="stat-val">{integrationResults.errorEst.toExponential(3)}</span>
                  </div>
                  <div className="stat-card highlight">
                    <span className="stat-title">Mean Value of Function</span>
                    <span className="stat-val">{integrationResults.avgValue.toFixed(6)}</span>
                  </div>
                </div>

                {/* Analytical Insight Pill */}
                <div className="insight-pill-box">
                  <span className="insight-label">💡 Note:</span>
                  <span>
                    Simpson's rule samples {integrationResults.n} intervals with parabolic interpolation, yielding $O(h^4)$ fourth-order convergence.
                  </span>
                </div>
              </div>
            ) : (
              <div className="calc-error-box">
                <AlertCircle size={20} />
                <span>{integrationResults.error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUBTAB 2: DERIVATIVES & CURVATURE ==================== */}
      {subTab === 'derivative' && (
        <div className="calculus-content-grid animate-fade-in">
          {/* Controls Panel */}
          <div className="calc-glass-card control-card">
            <h3 className="card-section-title">
              <TrendingUp size={17} />
              <span>Differential Parameters</span>
            </h3>

            {/* Presets */}
            <div className="preset-chip-row">
              <span className="preset-label">Presets:</span>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadDerivPreset('sin(x) * exp(-0.1*x)', 1.5708)}
              >
                Damped Wave at π/2
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadDerivPreset('x^4 - 4*x^2 + 2', 1.0)}
              >
                Quartic Polynomial
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadDerivPreset('ln(x) + 1/x', 2.0)}
              >
                Log-Rational Curve
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadDerivPreset('tan(x)', 0.7854)}
              >
                Tangent at π/4
              </button>
            </div>

            {/* Function f(x) input */}
            <div className="input-field-group">
              <label htmlFor={derivExprId} className="field-label">Function f(x)</label>
              <div className="math-input-wrapper">
                <span className="math-prefix">f(x) =</span>
                <input
                  id={derivExprId}
                  type="text"
                  className="math-text-input"
                  value={derivExpr}
                  onChange={(e) => setDerivExpr(e.target.value)}
                  placeholder="e.g. x^3 - 2*x, cos(x)"
                />
              </div>
            </div>

            {/* Evaluation Point x0 and Step Size h */}
            <div className="param-grid-row">
              <div className="input-field-group">
                <label htmlFor={derivX0Id} className="field-label">Evaluation Point (x₀)</label>
                <input
                  id={derivX0Id}
                  type="number"
                  step="any"
                  className="math-num-input"
                  value={derivX0}
                  onChange={(e) => setDerivX0(e.target.value)}
                />
              </div>

              <div className="input-field-group">
                <label htmlFor={stepHId} className="field-label">Finite Diff Step (h)</label>
                <input
                  id={stepHId}
                  type="number"
                  step="0.00001"
                  className="math-num-input"
                  value={stepH}
                  onChange={(e) => setStepH(e.target.value)}
                />
              </div>
            </div>

            {/* Formula Explanations */}
            <div className="diff-formula-card">
              <div className="formula-line">
                <span className="line-tag">f'(x₀):</span>
                <span>{"Central difference: [-f(x+2h) + 8*f(x+h) - 8*f(x-h) + f(x-2h)] / (12h)"}</span>
              </div>
              <div className="formula-line">
                <span className="line-tag">Curvature:</span>
                <span>{"κ = |f''(x₀)| / (1 + f'(x₀)²)^(3/2), Radius R = 1/κ"}</span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="calc-glass-card results-card">
            <h3 className="card-section-title">
              <Sparkles size={17} />
              <span>Differential Output</span>
            </h3>

            {derivResults.valid ? (
              <div className="results-inner-stack">
                {/* Hero Derivative Values */}
                <div className="hero-result-box">
                  <div className="hero-meta">
                    <span className="badge-pill">First Derivative f'(x₀)</span>
                    <span className="step-size-label">f(x₀) = {derivResults.f0.toFixed(6)}</span>
                  </div>
                  <div className="hero-val-row">
                    <span className="hero-number">{derivResults.fPrime.toFixed(7)}</span>
                    {onSendToCalculator && (
                      <button
                        type="button"
                        className="send-calc-btn"
                        onClick={() => {
                          handleSound('equals');
                          onSendToCalculator(derivResults.fPrime.toFixed(6));
                        }}
                      >
                        <ArrowRight size={14} />
                        <span>Send to Calc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Second Derivative & Geometric Metrics */}
                <div className="quadrature-stats-grid">
                  <div className="stat-card">
                    <span className="stat-title">Second Derivative f''(x₀)</span>
                    <span className="stat-val">{derivResults.fDoublePrime.toFixed(6)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-title">Concavity State</span>
                    <span className="stat-val highlight-text">{derivResults.concavity}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-title">Curvature κ</span>
                    <span className="stat-val">{derivResults.curvature.toFixed(6)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-title">Radius of Curvature (R)</span>
                    <span className="stat-val">{isFinite(derivResults.radiusOfCurvature) ? derivResults.radiusOfCurvature.toFixed(5) : '∞ (Flat)'}</span>
                  </div>
                </div>

                {/* Tangent & Normal Equations */}
                <div className="line-equation-box">
                  <div className="equation-row">
                    <span className="eq-label">Tangent Line at x₀:</span>
                    <span className="eq-formula">
                      y = {derivResults.tangentSlope.toFixed(4)}x {derivResults.tangentIntercept >= 0 ? '+' : '-'} {Math.abs(derivResults.tangentIntercept).toFixed(4)}
                    </span>
                  </div>
                  <div className="equation-row">
                    <span className="eq-label">Normal Line at x₀:</span>
                    <span className="eq-formula">
                      {derivResults.normalSlope !== null ? (
                        `y = ${derivResults.normalSlope.toFixed(4)}x ${derivResults.normalIntercept >= 0 ? '+' : '-'} ${Math.abs(derivResults.normalIntercept).toFixed(4)}`
                      ) : (
                        'x = ' + derivResults.x0.toFixed(4)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="calc-error-box">
                <AlertCircle size={20} />
                <span>{derivResults.error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUBTAB 3: NUMERICAL ROOT FINDER ==================== */}
      {subTab === 'roots' && (
        <div className="calculus-content-grid animate-fade-in">
          {/* Controls Panel */}
          <div className="calc-glass-card control-card">
            <h3 className="card-section-title">
              <Search size={17} />
              <span>Root Finding Solver</span>
            </h3>

            {/* Presets */}
            <div className="preset-chip-row">
              <span className="preset-label">Presets:</span>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadRootPreset('x^3 - 2*x - 5', 'newton', 2, 1, 3)}
              >
                x³ - 2x - 5 = 0
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadRootPreset('cos(x) - x', 'newton', 0.5, 0, 1)}
              >
                cos(x) = x (Dottie)
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadRootPreset('exp(x) - 3*x', 'bisection', 0, 0, 1)}
              >
                eˣ - 3x = 0
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => loadRootPreset('x^2 - 2', 'newton', 1.4, 1, 2)}
              >
                √2 via x² - 2 = 0
              </button>
            </div>

            {/* Equation Expression */}
            <div className="input-field-group">
              <label htmlFor={rootExprId} className="field-label">Solve Equation f(x) = 0</label>
              <div className="math-input-wrapper">
                <span className="math-prefix">f(x) =</span>
                <input
                  id={rootExprId}
                  type="text"
                  className="math-text-input"
                  value={rootExpr}
                  onChange={(e) => setRootExpr(e.target.value)}
                  placeholder="e.g. x^3 - 2*x - 5"
                />
              </div>
            </div>

            {/* Method Toggle */}
            <div className="solver-mode-selector">
              <button
                type="button"
                className={`mode-btn ${rootMethod === 'newton' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setRootMethod('newton'); }}
              >
                Newton-Raphson Method
              </button>
              <button
                type="button"
                className={`mode-btn ${rootMethod === 'bisection' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setRootMethod('bisection'); }}
              >
                Bisection Bracket Method
              </button>
            </div>

            {/* Inputs depending on method */}
            {rootMethod === 'newton' ? (
              <div className="param-grid-row">
                <div className="input-field-group">
                  <label className="field-label">Initial Guess (x₀)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={initGuess}
                    onChange={(e) => setInitGuess(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Tolerance (ε)</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="math-num-input"
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Max Iterations</label>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    className="math-num-input"
                    value={maxIter}
                    onChange={(e) => setMaxIter(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="param-grid-row">
                <div className="input-field-group">
                  <label className="field-label">Bracket a</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={bisectA}
                    onChange={(e) => setBisectA(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Bracket b</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={bisectB}
                    onChange={(e) => setBisectB(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Tolerance (ε)</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="math-num-input"
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="calc-glass-card results-card">
            <h3 className="card-section-title">
              <Sparkles size={17} />
              <span>Convergence & Root Output</span>
            </h3>

            {rootResults.valid ? (
              <div className="results-inner-stack">
                {/* Hero Root Result */}
                <div className="hero-result-box">
                  <div className="hero-meta">
                    <span className="badge-pill">
                      {rootResults.converged ? (
                        <span className="flex-status"><CheckCircle2 size={13} color="#10b981" /> Converged in {rootResults.iterations} steps</span>
                      ) : (
                        <span className="flex-status"><AlertCircle size={13} color="#f59e0b" /> Iteration Limit Reached</span>
                      )}
                    </span>
                    <span className="step-size-label">f(root) = {rootResults.fRoot ? rootResults.fRoot.toExponential(3) : '0'}</span>
                  </div>
                  <div className="hero-val-row">
                    <span className="hero-number">x* = {rootResults.root.toFixed(8)}</span>
                    {onSendToCalculator && (
                      <button
                        type="button"
                        className="send-calc-btn"
                        onClick={() => {
                          handleSound('equals');
                          onSendToCalculator(rootResults.root.toFixed(6));
                        }}
                      >
                        <ArrowRight size={14} />
                        <span>Send to Calc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Iteration History Table */}
                <div className="history-table-container">
                  <div className="table-caption-bar">
                    <span>Iteration Convergence Trace</span>
                    <span className="table-tag">{rootResults.method}</span>
                  </div>
                  <div className="table-scroll-wrapper">
                    <table className="convergence-table">
                      <thead>
                        <tr>
                          <th>Iter #</th>
                          <th>Estimate xₖ</th>
                          <th>f(xₖ)</th>
                          {rootResults.method === 'Newton-Raphson' && <th>f'(xₖ)</th>}
                          <th>Error |Δx|</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rootResults.history.map((row) => (
                          <tr key={row.step}>
                            <td>{row.step}</td>
                            <td className="code-font">{row.x.toFixed(6)}</td>
                            <td className="code-font">{row.fx.toExponential(3)}</td>
                            {rootResults.method === 'Newton-Raphson' && (
                              <td className="code-font">{row.dfx !== null ? row.dfx.toFixed(4) : '-'}</td>
                            )}
                            <td className="code-font text-accent">{row.delta.toExponential(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="calc-error-box">
                <AlertCircle size={20} />
                <span>{rootResults.error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
