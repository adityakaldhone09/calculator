import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Shapes, 
  Atom, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Plus,
  Minus,
  X as MultiplyIcon,
  Divide
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './ComplexPhysicsLab.css';

export default function ComplexPhysicsLab({ soundEnabled, onNotify, onSendToCalculator }) {
  const [subTab, setSubTab] = useState('complex'); // 'complex' | 'geometry' | 'physics'

  // --- Sub-Tab 1: Complex Numbers State ---
  const [z1, setZ1] = useState({ re: 3, im: 4 });
  const [z2, setZ2] = useState({ re: 1, im: -2 });
  const [complexOp, setComplexOp] = useState('add'); // 'add' | 'sub' | 'mul' | 'div' | 'pow' | 'root'
  const [rootN, setRootN] = useState(3);
  const [powN, setPowN] = useState(2);

  // --- Sub-Tab 2: Geometry State ---
  const [geomCategory, setGeomCategory] = useState('2d'); // '2d' | '3d'
  const [shape2D, setShape2D] = useState('circle'); // 'circle' | 'ellipse' | 'triangle' | 'trapezoid' | 'polygon'
  const [shape3D, setShape3D] = useState('sphere'); // 'sphere' | 'cylinder' | 'cone' | 'torus' | 'cuboid' | 'pyramid'
  
  // 2D Shape Inputs
  const [dimCircle, setDimCircle] = useState({ r: 5 });
  const [dimEllipse, setDimEllipse] = useState({ a: 6, b: 4 });
  const [dimTriangle, setDimTriangle] = useState({ a: 7, b: 8, c: 9 });
  const [dimTrapezoid, setDimTrapezoid] = useState({ a: 10, b: 6, h: 4, c: 5, d: 5 });
  const [dimPolygon, setDimPolygon] = useState({ sides: 6, length: 4 });

  // 3D Solid Inputs
  const [dimSphere, setDimSphere] = useState({ r: 5 });
  const [dimCylinder, setDimCylinder] = useState({ r: 4, h: 10 });
  const [dimCone, setDimCone] = useState({ r: 4, h: 9 });
  const [dimTorus, setDimTorus] = useState({ R: 8, r: 2 });
  const [dimCuboid, setDimCuboid] = useState({ l: 8, w: 5, h: 4 });
  const [dimPyramid, setDimPyramid] = useState({ a: 6, h: 8 });

  // --- Sub-Tab 3: Physics State ---
  const [physicsMode, setPhysicsMode] = useState('projectile'); // 'projectile' | 'energy' | 'waves'
  const [projSpeed, setProjSpeed] = useState(25); // m/s
  const [projAngle, setProjAngle] = useState(45); // degrees
  const [projGravity, setProjGravity] = useState(9.80665); // m/s^2

  const [massKg, setMassKg] = useState(12);
  const [velMs, setVelMs] = useState(15);
  const [heightM, setHeightM] = useState(20);

  const [voltage, setVoltage] = useState(12);
  const [current, setCurrent] = useState(2.5);
  const [inductanceH, setInductanceH] = useState(0.001); // 1 mH
  const [capacitanceF, setCapacitanceF] = useState(0.00001); // 10 uF

  const handleSound = (type = 'default') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  };

  // --- Complex Numbers Calculation ---
  const complexResults = useMemo(() => {
    const a1 = parseFloat(z1.re) || 0;
    const b1 = parseFloat(z1.im) || 0;
    const a2 = parseFloat(z2.re) || 0;
    const b2 = parseFloat(z2.im) || 0;

    const mod1 = Math.sqrt(a1 * a1 + b1 * b1);
    const arg1Rad = Math.atan2(b1, a1);
    const arg1Deg = (arg1Rad * 180) / Math.PI;

    const mod2 = Math.sqrt(a2 * a2 + b2 * b2);
    const arg2Rad = Math.atan2(b2, a2);
    const arg2Deg = (arg2Rad * 180) / Math.PI;

    let resRe = 0;
    let resIm = 0;
    let rootsList = [];

    switch (complexOp) {
      case 'add':
        resRe = a1 + a2;
        resIm = b1 + b2;
        break;
      case 'sub':
        resRe = a1 - a2;
        resIm = b1 - b2;
        break;
      case 'mul':
        resRe = a1 * a2 - b1 * b2;
        resIm = a1 * b2 + a2 * b1;
        break;
      case 'div': {
        const denom = a2 * a2 + b2 * b2;
        if (Math.abs(denom) < 1e-12) {
          return { valid: false, error: 'Division by zero in complex denominator.' };
        }
        resRe = (a1 * a2 + b1 * b2) / denom;
        resIm = (b1 * a2 - a1 * b2) / denom;
        break;
      }
      case 'pow': {
        const n = parseInt(powN, 10) || 2;
        const rN = Math.pow(mod1, n);
        const thetaN = arg1Rad * n;
        resRe = rN * Math.cos(thetaN);
        resIm = rN * Math.sin(thetaN);
        break;
      }
      case 'root': {
        const n = Math.max(2, Math.min(8, parseInt(rootN, 10) || 3));
        const rRoot = Math.pow(mod1, 1 / n);
        for (let k = 0; k < n; k++) {
          const thetaK = (arg1Rad + 2 * Math.PI * k) / n;
          rootsList.push({
            k,
            re: rRoot * Math.cos(thetaK),
            im: rRoot * Math.sin(thetaK),
            angleDeg: (thetaK * 180) / Math.PI
          });
        }
        resRe = rootsList[0].re;
        resIm = rootsList[0].im;
        break;
      }
      default:
        break;
    }

    const resMod = Math.sqrt(resRe * resRe + resIm * resIm);
    const resArgRad = Math.atan2(resIm, resRe);
    const resArgDeg = (resArgRad * 180) / Math.PI;

    return {
      valid: true,
      a1, b1, mod1, arg1Deg, arg1Rad,
      a2, b2, mod2, arg2Deg, arg2Rad,
      resRe, resIm, resMod, resArgDeg, resArgRad,
      rootsList
    };
  }, [z1, z2, complexOp, rootN, powN]);

  // --- Argand Diagram SVG Viewport Scale ---
  const argandSvg = useMemo(() => {
    if (!complexResults.valid) return null;
    const width = 360;
    const height = 280;
    const cx = width / 2;
    const cy = height / 2;

    const maxCoord = Math.max(
      Math.abs(complexResults.a1),
      Math.abs(complexResults.b1),
      Math.abs(complexResults.a2),
      Math.abs(complexResults.b2),
      Math.abs(complexResults.resRe),
      Math.abs(complexResults.resIm),
      5
    );

    const scale = (Math.min(width, height) * 0.4) / (maxCoord * 1.15);

    const toSvg = (re, im) => ({
      x: cx + re * scale,
      y: cy - im * scale // flip y for standard Cartesian
    });

    return {
      width,
      height,
      cx,
      cy,
      scale,
      p1: toSvg(complexResults.a1, complexResults.b1),
      p2: toSvg(complexResults.a2, complexResults.b2),
      pRes: toSvg(complexResults.resRe, complexResults.resIm),
      r1: complexResults.mod1 * scale,
      r2: complexResults.mod2 * scale,
      rRes: complexResults.resMod * scale
    };
  }, [complexResults]);

  // --- Geometry Calculations ---
  const geomResults = useMemo(() => {
    if (geomCategory === '2d') {
      switch (shape2D) {
        case 'circle': {
          const r = Math.max(0, parseFloat(dimCircle.r) || 0);
          const area = Math.PI * r * r;
          const perimeter = 2 * Math.PI * r;
          return {
            name: 'Circle',
            metrics: [
              { label: 'Area (A = πr²)', value: area.toFixed(4) },
              { label: 'Circumference (C = 2πr)', value: perimeter.toFixed(4) },
              { label: 'Diameter (d = 2r)', value: (2 * r).toFixed(4) }
            ],
            primaryVal: area
          };
        }
        case 'ellipse': {
          const a = Math.max(0, parseFloat(dimEllipse.a) || 0);
          const b = Math.max(0, parseFloat(dimEllipse.b) || 0);
          const area = Math.PI * a * b;
          // Ramanujan approximation for perimeter
          const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
          const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
          const eccentricity = a >= b ? Math.sqrt(1 - (b * b) / (a * a)) : Math.sqrt(1 - (a * a) / (b * b));
          return {
            name: 'Ellipse',
            metrics: [
              { label: 'Area (A = πab)', value: area.toFixed(4) },
              { label: 'Perimeter (Ramanujan approx)', value: perimeter.toFixed(4) },
              { label: 'Eccentricity (e)', value: eccentricity.toFixed(4) }
            ],
            primaryVal: area
          };
        }
        case 'triangle': {
          const a = parseFloat(dimTriangle.a) || 0;
          const b = parseFloat(dimTriangle.b) || 0;
          const c = parseFloat(dimTriangle.c) || 0;
          const perimeter = a + b + c;
          const s = perimeter / 2;
          const areaSq = s * (s - a) * (s - b) * (s - c);
          if (areaSq <= 0 || a + b <= c || a + c <= b || b + c <= a) {
            return {
              name: 'Triangle',
              error: 'Invalid triangle sides: triangle inequality violated.',
              metrics: [],
              primaryVal: 0
            };
          }
          const area = Math.sqrt(areaSq);
          const inradius = area / s;
          const circumradius = (a * b * c) / (4 * area);
          return {
            name: 'Triangle (Heron\'s Formula)',
            metrics: [
              { label: 'Area (Heron)', value: area.toFixed(4) },
              { label: 'Perimeter (a + b + c)', value: perimeter.toFixed(4) },
              { label: 'Inradius (r = A/s)', value: inradius.toFixed(4) },
              { label: 'Circumradius (R)', value: circumradius.toFixed(4) }
            ],
            primaryVal: area
          };
        }
        case 'trapezoid': {
          const a = parseFloat(dimTrapezoid.a) || 0;
          const b = parseFloat(dimTrapezoid.b) || 0;
          const h = parseFloat(dimTrapezoid.h) || 0;
          const c = parseFloat(dimTrapezoid.c) || 0;
          const d = parseFloat(dimTrapezoid.d) || 0;
          const area = ((a + b) / 2) * h;
          const perimeter = a + b + c + d;
          return {
            name: 'Trapezoid',
            metrics: [
              { label: 'Area ((a + b)/2 × h)', value: area.toFixed(4) },
              { label: 'Perimeter (a + b + c + d)', value: perimeter.toFixed(4) },
              { label: 'Median Line ((a + b)/2)', value: ((a + b) / 2).toFixed(4) }
            ],
            primaryVal: area
          };
        }
        case 'polygon': {
          const n = Math.max(3, parseInt(dimPolygon.sides, 10) || 6);
          const s = Math.max(0, parseFloat(dimPolygon.length) || 0);
          const perimeter = n * s;
          const apothem = s / (2 * Math.tan(Math.PI / n));
          const area = (n * s * apothem) / 2;
          return {
            name: `Regular ${n}-sided Polygon`,
            metrics: [
              { label: 'Area', value: area.toFixed(4) },
              { label: 'Perimeter', value: perimeter.toFixed(4) },
              { label: 'Apothem (Inradius)', value: apothem.toFixed(4) },
              { label: 'Interior Angle', value: `${(((n - 2) * 180) / n).toFixed(2)}°` }
            ],
            primaryVal: area
          };
        }
        default:
          return { name: '2D Shape', metrics: [], primaryVal: 0 };
      }
    } else {
      // 3D Solids
      switch (shape3D) {
        case 'sphere': {
          const r = Math.max(0, parseFloat(dimSphere.r) || 0);
          const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
          const surfaceArea = 4 * Math.PI * r * r;
          return {
            name: 'Sphere',
            metrics: [
              { label: 'Volume (V = 4/3 πr³)', value: volume.toFixed(4) },
              { label: 'Total Surface Area (4πr²)', value: surfaceArea.toFixed(4) },
              { label: 'Cross-Section Area (πr²)', value: (Math.PI * r * r).toFixed(4) }
            ],
            primaryVal: volume
          };
        }
        case 'cylinder': {
          const r = Math.max(0, parseFloat(dimCylinder.r) || 0);
          const h = Math.max(0, parseFloat(dimCylinder.h) || 0);
          const volume = Math.PI * r * r * h;
          const lateralArea = 2 * Math.PI * r * h;
          const totalArea = 2 * Math.PI * r * (r + h);
          return {
            name: 'Right Circular Cylinder',
            metrics: [
              { label: 'Volume (V = πr²h)', value: volume.toFixed(4) },
              { label: 'Lateral Area (2πrh)', value: lateralArea.toFixed(4) },
              { label: 'Total Surface Area', value: totalArea.toFixed(4) }
            ],
            primaryVal: volume
          };
        }
        case 'cone': {
          const r = Math.max(0, parseFloat(dimCone.r) || 0);
          const h = Math.max(0, parseFloat(dimCone.h) || 0);
          const slant = Math.sqrt(r * r + h * h);
          const volume = (1 / 3) * Math.PI * r * r * h;
          const lateralArea = Math.PI * r * slant;
          const totalArea = Math.PI * r * (r + slant);
          return {
            name: 'Right Circular Cone',
            metrics: [
              { label: 'Volume (1/3 πr²h)', value: volume.toFixed(4) },
              { label: 'Slant Height (l = √(r²+h²))', value: slant.toFixed(4) },
              { label: 'Lateral Area (πrl)', value: lateralArea.toFixed(4) },
              { label: 'Total Surface Area', value: totalArea.toFixed(4) }
            ],
            primaryVal: volume
          };
        }
        case 'torus': {
          const R = Math.max(0, parseFloat(dimTorus.R) || 0);
          const r = Math.max(0, parseFloat(dimTorus.r) || 0);
          const volume = 2 * Math.PI * Math.PI * R * r * r;
          const surfaceArea = 4 * Math.PI * Math.PI * R * r;
          return {
            name: 'Torus (Donut Ring)',
            metrics: [
              { label: 'Volume (2π²Rr²)', value: volume.toFixed(4) },
              { label: 'Surface Area (4π²Rr)', value: surfaceArea.toFixed(4) },
              { label: 'Major / Minor Ratio (R/r)', value: r > 0 ? (R / r).toFixed(2) : '-' }
            ],
            primaryVal: volume
          };
        }
        case 'cuboid': {
          const l = Math.max(0, parseFloat(dimCuboid.l) || 0);
          const w = Math.max(0, parseFloat(dimCuboid.w) || 0);
          const h = Math.max(0, parseFloat(dimCuboid.h) || 0);
          const volume = l * w * h;
          const surfaceArea = 2 * (l * w + l * h + w * h);
          const diagonal = Math.sqrt(l * l + w * w + h * h);
          return {
            name: 'Rectangular Cuboid',
            metrics: [
              { label: 'Volume (l × w × h)', value: volume.toFixed(4) },
              { label: 'Surface Area (2(lw+lh+wh))', value: surfaceArea.toFixed(4) },
              { label: 'Space Diagonal (√(l²+w²+h²))', value: diagonal.toFixed(4) }
            ],
            primaryVal: volume
          };
        }
        case 'pyramid': {
          const a = Math.max(0, parseFloat(dimPyramid.a) || 0);
          const h = Math.max(0, parseFloat(dimPyramid.h) || 0);
          const volume = (1 / 3) * a * a * h;
          const slant = Math.sqrt(Math.pow(a / 2, 2) + h * h);
          const lateralArea = 2 * a * slant;
          const totalArea = a * a + lateralArea;
          return {
            name: 'Square Pyramid',
            metrics: [
              { label: 'Volume (1/3 a²h)', value: volume.toFixed(4) },
              { label: 'Slant Height (s)', value: slant.toFixed(4) },
              { label: 'Total Surface Area (a² + 2as)', value: totalArea.toFixed(4) }
            ],
            primaryVal: volume
          };
        }
        default:
          return { name: '3D Solid', metrics: [], primaryVal: 0 };
      }
    }
  }, [geomCategory, shape2D, shape3D, dimCircle, dimEllipse, dimTriangle, dimTrapezoid, dimPolygon, dimSphere, dimCylinder, dimCone, dimTorus, dimCuboid, dimPyramid]);

  // --- Physics Calculations ---
  const physicsResults = useMemo(() => {
    switch (physicsMode) {
      case 'projectile': {
        const v0 = Math.max(0, parseFloat(projSpeed) || 0);
        const deg = parseFloat(projAngle) || 0;
        const g = Math.max(0.1, parseFloat(projGravity) || 9.80665);
        const thetaRad = (deg * Math.PI) / 180;

        const vx = v0 * Math.cos(thetaRad);
        const vy = v0 * Math.sin(thetaRad);

        const flightTime = (2 * vy) / g;
        const maxHeight = (vy * vy) / (2 * g);
        const range = (v0 * v0 * Math.sin(2 * thetaRad)) / g;

        // Samples for SVG trajectory curve
        const samples = [];
        const steps = 30;
        for (let i = 0; i <= steps; i++) {
          const t = (flightTime * i) / steps;
          const x = vx * t;
          const y = vy * t - 0.5 * g * t * t;
          samples.push({ x: Math.max(0, x), y: Math.max(0, y) });
        }

        return {
          flightTime,
          maxHeight,
          range,
          vx,
          vy,
          samples,
          primaryVal: range
        };
      }
      case 'energy': {
        const m = Math.max(0, parseFloat(massKg) || 0);
        const v = Math.max(0, parseFloat(velMs) || 0);
        const h = Math.max(0, parseFloat(heightM) || 0);
        const g = 9.80665;
        const c = 299792458; // speed of light in m/s

        const kinetic = 0.5 * m * v * v;
        const potential = m * g * h;
        const momentum = m * v;
        const beta = v / c;
        const gamma = beta < 1 ? 1 / Math.sqrt(1 - beta * beta) : Infinity;

        return {
          kinetic,
          potential,
          totalMechanical: kinetic + potential,
          momentum,
          gamma,
          primaryVal: kinetic
        };
      }
      case 'waves': {
        const v = parseFloat(voltage) || 0;
        const i = parseFloat(current) || 0;
        const power = v * i;
        const resistance = i !== 0 ? v / i : Infinity;

        const L = Math.max(1e-12, parseFloat(inductanceH) || 1e-3);
        const C = Math.max(1e-12, parseFloat(capacitanceF) || 1e-6);
        const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));

        return {
          power,
          resistance,
          f0,
          primaryVal: power
        };
      }
      default:
        return null;
    }
  }, [physicsMode, projSpeed, projAngle, projGravity, massKg, velMs, heightM, voltage, current, inductanceH, capacitanceF]);

  // Projectile SVG path generator
  const projSvg = useMemo(() => {
    if (physicsMode !== 'projectile' || !physicsResults || !physicsResults.samples) return null;
    const { samples, range, maxHeight } = physicsResults;
    const width = 460;
    const height = 150;
    const pad = 16;

    const scaleX = (x) => pad + (range > 0 ? (x / range) * (width - 2 * pad) : 0);
    const scaleY = (y) => height - pad - (maxHeight > 0 ? (y / maxHeight) * (height - 2 * pad) : 0);

    let pathD = `M ${scaleX(samples[0].x)} ${scaleY(samples[0].y)}`;
    samples.slice(1).forEach(pt => {
      pathD += ` L ${scaleX(pt.x)} ${scaleY(pt.y)}`;
    });

    return { width, height, pathD, groundY: height - pad };
  }, [physicsMode, physicsResults]);

  return (
    <div className="complex-workspace animate-fade-in">
      {/* Top Header */}
      <div className="complex-top-bar">
        <div className="complex-header-title">
          <div className="complex-icon-bubble">
            <Compass size={22} className="complex-accent-icon" />
          </div>
          <div>
            <h2 className="complex-title">Complex & Scientific Physics Studio</h2>
            <p className="complex-subtitle">Argand plane vectors, 2D/3D geometry engine, and mechanics physics laboratory</p>
          </div>
        </div>

        <div className="complex-subtabs">
          <button
            type="button"
            className={`subtab-btn ${subTab === 'complex' ? 'active' : ''}`}
            onClick={() => { handleSound('operator'); setSubTab('complex'); }}
          >
            <Compass size={15} />
            <span>Complex Numbers</span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'geometry' ? 'active' : ''}`}
            onClick={() => { handleSound('operator'); setSubTab('geometry'); }}
          >
            <Shapes size={15} />
            <span>Geometry & Solids</span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${subTab === 'physics' ? 'active' : ''}`}
            onClick={() => { handleSound('operator'); setSubTab('physics'); }}
          >
            <Atom size={15} />
            <span>Physics Mechanics</span>
          </button>
        </div>
      </div>

      {/* ==================== SUBTAB 1: COMPLEX NUMBERS & ARGAND ==================== */}
      {subTab === 'complex' && (
        <div className="complex-grid animate-fade-in">
          {/* Controls Column */}
          <div className="complex-glass-card">
            <h3 className="card-section-title">
              <Compass size={17} />
              <span>Complex Number Configuration</span>
            </h3>

            {/* Presets */}
            <div className="preset-chip-row">
              <span className="preset-label">Presets:</span>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => { setZ1({ re: 3, im: 4 }); setZ2({ re: 1, im: -2 }); setComplexOp('add'); }}
              >
                (3+4i) + (1-2i)
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => { setZ1({ re: 0, im: 1 }); setZ2({ re: 0, im: 1 }); setComplexOp('mul'); }}
              >
                i × i = -1
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => { setZ1({ re: 1, im: 1 }); setPowN(4); setComplexOp('pow'); }}
              >
                (1+i)⁴ De Moivre
              </button>
              <button 
                type="button" 
                className="chip-btn" 
                onClick={() => { setZ1({ re: 1, im: 0 }); setRootN(3); setComplexOp('root'); }}
              >
                Cube Roots of 1
              </button>
            </div>

            {/* z1 inputs */}
            <div className="complex-num-box z1-box">
              <div className="box-tag">
                <span className="dot dot-blue"></span>
                <span>Number z₁ = a₁ + b₁i</span>
                <span className="tag-polar">r₁={complexResults.mod1.toFixed(3)}, θ₁={complexResults.arg1Deg.toFixed(1)}°</span>
              </div>
              <div className="param-grid-row">
                <div className="input-field-group">
                  <label className="field-label">Real (a₁)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={z1.re}
                    onChange={(e) => setZ1({ ...z1, re: e.target.value })}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Imaginary (b₁)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={z1.im}
                    onChange={(e) => setZ1({ ...z1, im: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Operation Selector */}
            <div className="complex-ops-row">
              <button
                type="button"
                className={`op-pill-btn ${complexOp === 'add' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setComplexOp('add'); }}
                title="Addition (z1 + z2)"
              >
                <Plus size={14} /> Add
              </button>
              <button
                type="button"
                className={`op-pill-btn ${complexOp === 'sub' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setComplexOp('sub'); }}
                title="Subtraction (z1 - z2)"
              >
                <Minus size={14} /> Sub
              </button>
              <button
                type="button"
                className={`op-pill-btn ${complexOp === 'mul' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setComplexOp('mul'); }}
                title="Multiplication (z1 × z2)"
              >
                <MultiplyIcon size={14} /> Mul
              </button>
              <button
                type="button"
                className={`op-pill-btn ${complexOp === 'div' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setComplexOp('div'); }}
                title="Division (z1 ÷ z2)"
              >
                <Divide size={14} /> Div
              </button>
              <button
                type="button"
                className={`op-pill-btn ${complexOp === 'pow' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setComplexOp('pow'); }}
                title="Power (z1^n)"
              >
                z₁ⁿ
              </button>
              <button
                type="button"
                className={`op-pill-btn ${complexOp === 'root' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setComplexOp('root'); }}
                title="Roots (n-th roots of z1)"
              >
                ⁿ√z₁
              </button>
            </div>

            {/* z2 inputs (only for binary arithmetic) */}
            {['add', 'sub', 'mul', 'div'].includes(complexOp) && (
              <div className="complex-num-box z2-box">
                <div className="box-tag">
                  <span className="dot dot-pink"></span>
                  <span>Number z₂ = a₂ + b₂i</span>
                  <span className="tag-polar">r₂={complexResults.mod2.toFixed(3)}, θ₂={complexResults.arg2Deg.toFixed(1)}°</span>
                </div>
                <div className="param-grid-row">
                  <div className="input-field-group">
                    <label className="field-label">Real (a₂)</label>
                    <input
                      type="number"
                      step="any"
                      className="math-num-input"
                      value={z2.re}
                      onChange={(e) => setZ2({ ...z2, re: e.target.value })}
                    />
                  </div>
                  <div className="input-field-group">
                    <label className="field-label">Imaginary (b₂)</label>
                    <input
                      type="number"
                      step="any"
                      className="math-num-input"
                      value={z2.im}
                      onChange={(e) => setZ2({ ...z2, im: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Extra options for Power or Root */}
            {complexOp === 'pow' && (
              <div className="input-field-group">
                <label className="field-label">Exponent Power (n)</label>
                <input
                  type="number"
                  min="-10"
                  max="10"
                  className="math-num-input"
                  value={powN}
                  onChange={(e) => setPowN(e.target.value)}
                />
              </div>
            )}

            {complexOp === 'root' && (
              <div className="input-field-group">
                <label className="field-label">Root Degree (n = 2..8)</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  className="math-num-input"
                  value={rootN}
                  onChange={(e) => setRootN(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Results Column & Argand Diagram */}
          <div className="complex-glass-card">
            <h3 className="card-section-title">
              <Sparkles size={17} />
              <span>Argand Vector Plane & Output</span>
            </h3>

            {complexResults.valid ? (
              <div className="results-inner-stack">
                {/* Hero Result Banner */}
                <div className="hero-result-box">
                  <div className="hero-meta">
                    <span className="badge-pill">Complex Result (z_res)</span>
                    <span className="step-size-label">
                      Polar: {complexResults.resMod.toFixed(4)} ∠ {complexResults.resArgDeg.toFixed(2)}°
                    </span>
                  </div>
                  <div className="hero-val-row">
                    <span className="hero-number">
                      {complexResults.resRe.toFixed(4)} {complexResults.resIm >= 0 ? '+' : '-'} {Math.abs(complexResults.resIm).toFixed(4)}i
                    </span>
                    {onSendToCalculator && (
                      <button
                        type="button"
                        className="send-calc-btn"
                        onClick={() => {
                          handleSound('equals');
                          onSendToCalculator(complexResults.resRe.toFixed(4));
                        }}
                      >
                        <ArrowRight size={14} />
                        <span>Send Re</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Argand Diagram SVG */}
                {argandSvg && (
                  <div className="argand-container">
                    <div className="argand-header">
                      <span>Argand Complex Plane</span>
                      <div className="argand-legend">
                        <span className="leg leg-blue">z₁</span>
                        {['add', 'sub', 'mul', 'div'].includes(complexOp) && <span className="leg leg-pink">z₂</span>}
                        <span className="leg leg-green">Result</span>
                      </div>
                    </div>

                    <svg viewBox={`0 0 ${argandSvg.width} ${argandSvg.height}`} className="argand-svg">
                      {/* Grid axes */}
                      <line x1="10" y1={argandSvg.cy} x2={argandSvg.width - 10} y2={argandSvg.cy} stroke="var(--border-medium)" />
                      <line x1={argandSvg.cx} y1="10" x2={argandSvg.cx} y2={argandSvg.height - 10} stroke="var(--border-medium)" />

                      {/* Labels */}
                      <text x={argandSvg.width - 25} y={argandSvg.cy - 6} fill="var(--text-muted)" fontSize="11">Re</text>
                      <text x={argandSvg.cx + 8} y="22" fill="var(--text-muted)" fontSize="11">Im</text>

                      {/* Concentric rings */}
                      <circle cx={argandSvg.cx} cy={argandSvg.cy} r={argandSvg.r1} fill="none" stroke="#3b82f6" strokeDasharray="3 3" opacity="0.3" />
                      <circle cx={argandSvg.cx} cy={argandSvg.cy} r={argandSvg.rRes} fill="none" stroke="#10b981" strokeDasharray="3 3" opacity="0.4" />

                      {/* Vector z1 */}
                      <line x1={argandSvg.cx} y1={argandSvg.cy} x2={argandSvg.p1.x} y2={argandSvg.p1.y} stroke="#3b82f6" strokeWidth="2.5" />
                      <circle cx={argandSvg.p1.x} cy={argandSvg.p1.y} r="4.5" fill="#3b82f6" />

                      {/* Vector z2 */}
                      {['add', 'sub', 'mul', 'div'].includes(complexOp) && (
                        <>
                          <line x1={argandSvg.cx} y1={argandSvg.cy} x2={argandSvg.p2.x} y2={argandSvg.p2.y} stroke="#ec4899" strokeWidth="2.5" />
                          <circle cx={argandSvg.p2.x} cy={argandSvg.p2.y} r="4.5" fill="#ec4899" />
                        </>
                      )}

                      {/* Vector Result */}
                      <line x1={argandSvg.cx} y1={argandSvg.cy} x2={argandSvg.pRes.x} y2={argandSvg.pRes.y} stroke="#10b981" strokeWidth="3" />
                      <circle cx={argandSvg.pRes.x} cy={argandSvg.pRes.y} r="5" fill="#10b981" />
                    </svg>
                  </div>
                )}

                {/* Roots listing if root mode */}
                {complexOp === 'root' && complexResults.rootsList.length > 0 && (
                  <div className="roots-list-box">
                    <span className="roots-title">De Moivre Roots:</span>
                    <div className="roots-chip-grid">
                      {complexResults.rootsList.map((rt) => (
                        <div key={rt.k} className="root-pill">
                          <span className="root-k">k={rt.k}:</span>
                          <span className="root-num">{rt.re.toFixed(3)} {rt.im >= 0 ? '+' : '-'} {Math.abs(rt.im).toFixed(3)}i</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="calc-error-box">
                <AlertCircle size={20} />
                <span>{complexResults.error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUBTAB 2: GEOMETRY & SOLIDS ==================== */}
      {subTab === 'geometry' && (
        <div className="complex-grid animate-fade-in">
          {/* Controls Column */}
          <div className="complex-glass-card">
            <h3 className="card-section-title">
              <Shapes size={17} />
              <span>Geometric Shape & Solid Parameters</span>
            </h3>

            {/* Category Toggle: 2D vs 3D */}
            <div className="solver-mode-selector">
              <button
                type="button"
                className={`mode-btn ${geomCategory === '2d' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setGeomCategory('2d'); }}
              >
                2D Planar Shapes
              </button>
              <button
                type="button"
                className={`mode-btn ${geomCategory === '3d' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setGeomCategory('3d'); }}
              >
                3D Spatial Solids
              </button>
            </div>

            {/* 2D Shape Buttons */}
            {geomCategory === '2d' && (
              <>
                <div className="preset-chip-row">
                  <button 
                    type="button" 
                    className={`chip-btn ${shape2D === 'circle' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape2D('circle'); }}
                  >
                    Circle
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape2D === 'ellipse' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape2D('ellipse'); }}
                  >
                    Ellipse
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape2D === 'triangle' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape2D('triangle'); }}
                  >
                    Triangle (Heron)
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape2D === 'trapezoid' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape2D('trapezoid'); }}
                  >
                    Trapezoid
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape2D === 'polygon' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape2D('polygon'); }}
                  >
                    Regular n-gon
                  </button>
                </div>

                {/* Shape specific inputs */}
                {shape2D === 'circle' && (
                  <div className="input-field-group">
                    <label className="field-label">Radius (r)</label>
                    <input
                      type="number"
                      step="any"
                      className="math-num-input"
                      value={dimCircle.r}
                      onChange={(e) => setDimCircle({ r: e.target.value })}
                    />
                  </div>
                )}

                {shape2D === 'ellipse' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Semi-Major (a)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimEllipse.a}
                        onChange={(e) => setDimEllipse({ ...dimEllipse, a: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Semi-Minor (b)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimEllipse.b}
                        onChange={(e) => setDimEllipse({ ...dimEllipse, b: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape2D === 'triangle' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Side a</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTriangle.a}
                        onChange={(e) => setDimTriangle({ ...dimTriangle, a: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Side b</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTriangle.b}
                        onChange={(e) => setDimTriangle({ ...dimTriangle, b: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Side c</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTriangle.c}
                        onChange={(e) => setDimTriangle({ ...dimTriangle, c: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape2D === 'trapezoid' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Base a</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTrapezoid.a}
                        onChange={(e) => setDimTrapezoid({ ...dimTrapezoid, a: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Base b</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTrapezoid.b}
                        onChange={(e) => setDimTrapezoid({ ...dimTrapezoid, b: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Height (h)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTrapezoid.h}
                        onChange={(e) => setDimTrapezoid({ ...dimTrapezoid, h: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape2D === 'polygon' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Sides (n)</label>
                      <input
                        type="number"
                        min="3"
                        max="50"
                        className="math-num-input"
                        value={dimPolygon.sides}
                        onChange={(e) => setDimPolygon({ ...dimPolygon, sides: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Side Length (s)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimPolygon.length}
                        onChange={(e) => setDimPolygon({ ...dimPolygon, length: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 3D Solid Buttons */}
            {geomCategory === '3d' && (
              <>
                <div className="preset-chip-row">
                  <button 
                    type="button" 
                    className={`chip-btn ${shape3D === 'sphere' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape3D('sphere'); }}
                  >
                    Sphere
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape3D === 'cylinder' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape3D('cylinder'); }}
                  >
                    Cylinder
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape3D === 'cone' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape3D('cone'); }}
                  >
                    Cone
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape3D === 'torus' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape3D('torus'); }}
                  >
                    Torus
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape3D === 'cuboid' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape3D('cuboid'); }}
                  >
                    Cuboid
                  </button>
                  <button 
                    type="button" 
                    className={`chip-btn ${shape3D === 'pyramid' ? 'active' : ''}`}
                    onClick={() => { handleSound('digit'); setShape3D('pyramid'); }}
                  >
                    Pyramid
                  </button>
                </div>

                {shape3D === 'sphere' && (
                  <div className="input-field-group">
                    <label className="field-label">Radius (r)</label>
                    <input
                      type="number"
                      step="any"
                      className="math-num-input"
                      value={dimSphere.r}
                      onChange={(e) => setDimSphere({ r: e.target.value })}
                    />
                  </div>
                )}

                {shape3D === 'cylinder' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Radius (r)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCylinder.r}
                        onChange={(e) => setDimCylinder({ ...dimCylinder, r: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Height (h)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCylinder.h}
                        onChange={(e) => setDimCylinder({ ...dimCylinder, h: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape3D === 'cone' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Radius (r)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCone.r}
                        onChange={(e) => setDimCone({ ...dimCone, r: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Height (h)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCone.h}
                        onChange={(e) => setDimCone({ ...dimCone, h: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape3D === 'torus' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Major Radius (R)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTorus.R}
                        onChange={(e) => setDimTorus({ ...dimTorus, R: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Minor Radius (r)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimTorus.r}
                        onChange={(e) => setDimTorus({ ...dimTorus, r: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape3D === 'cuboid' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Length (l)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCuboid.l}
                        onChange={(e) => setDimCuboid({ ...dimCuboid, l: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Width (w)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCuboid.w}
                        onChange={(e) => setDimCuboid({ ...dimCuboid, w: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Height (h)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimCuboid.h}
                        onChange={(e) => setDimCuboid({ ...dimCuboid, h: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {shape3D === 'pyramid' && (
                  <div className="param-grid-row">
                    <div className="input-field-group">
                      <label className="field-label">Base Side (a)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimPyramid.a}
                        onChange={(e) => setDimPyramid({ ...dimPyramid, a: e.target.value })}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="field-label">Height (h)</label>
                      <input
                        type="number"
                        step="any"
                        className="math-num-input"
                        value={dimPyramid.h}
                        onChange={(e) => setDimPyramid({ ...dimPyramid, h: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results Column */}
          <div className="complex-glass-card">
            <h3 className="card-section-title">
              <Sparkles size={17} />
              <span>{geomResults.name} Calculations</span>
            </h3>

            {geomResults.error ? (
              <div className="calc-error-box">
                <AlertCircle size={20} />
                <span>{geomResults.error}</span>
              </div>
            ) : (
              <div className="results-inner-stack">
                <div className="hero-result-box">
                  <div className="hero-meta">
                    <span className="badge-pill">{geomCategory === '2d' ? 'Primary Surface Area' : 'Primary Solid Volume'}</span>
                  </div>
                  <div className="hero-val-row">
                    <span className="hero-number">{geomResults.primaryVal.toFixed(4)}</span>
                    {onSendToCalculator && (
                      <button
                        type="button"
                        className="send-calc-btn"
                        onClick={() => {
                          handleSound('equals');
                          onSendToCalculator(geomResults.primaryVal.toFixed(4));
                        }}
                      >
                        <ArrowRight size={14} />
                        <span>Send to Calc</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="quadrature-stats-grid">
                  {geomResults.metrics.map((m, idx) => (
                    <div key={idx} className="stat-card">
                      <span className="stat-title">{m.label}</span>
                      <span className="stat-val">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUBTAB 3: PHYSICS MECHANICS & WAVES ==================== */}
      {subTab === 'physics' && (
        <div className="complex-grid animate-fade-in">
          {/* Controls Column */}
          <div className="complex-glass-card">
            <h3 className="card-section-title">
              <Atom size={17} />
              <span>Scientific Physics Parameters</span>
            </h3>

            {/* Physics Mode Selector */}
            <div className="solver-mode-selector">
              <button
                type="button"
                className={`mode-btn ${physicsMode === 'projectile' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setPhysicsMode('projectile'); }}
              >
                Projectile Motion
              </button>
              <button
                type="button"
                className={`mode-btn ${physicsMode === 'energy' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setPhysicsMode('energy'); }}
              >
                Energy & Momentum
              </button>
              <button
                type="button"
                className={`mode-btn ${physicsMode === 'waves' ? 'active' : ''}`}
                onClick={() => { handleSound('operator'); setPhysicsMode('waves'); }}
              >
                Circuits & Waves
              </button>
            </div>

            {physicsMode === 'projectile' && (
              <>
                <div className="param-grid-row">
                  <div className="input-field-group">
                    <label className="field-label">Launch Velocity (v₀, m/s)</label>
                    <input
                      type="number"
                      step="any"
                      className="math-num-input"
                      value={projSpeed}
                      onChange={(e) => setProjSpeed(e.target.value)}
                    />
                  </div>
                  <div className="input-field-group">
                    <label className="field-label">Launch Angle (θ, °)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="90"
                      className="math-num-input"
                      value={projAngle}
                      onChange={(e) => setProjAngle(e.target.value)}
                    />
                  </div>
                  <div className="input-field-group">
                    <label className="field-label">Gravity (g, m/s²)</label>
                    <input
                      type="number"
                      step="any"
                      className="math-num-input"
                      value={projGravity}
                      onChange={(e) => setProjGravity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="preset-chip-row">
                  <span className="preset-label">Celestial Presets:</span>
                  <button type="button" className="chip-btn" onClick={() => setProjGravity(9.80665)}>Earth (9.81)</button>
                  <button type="button" className="chip-btn" onClick={() => setProjGravity(1.62)}>Moon (1.62)</button>
                  <button type="button" className="chip-btn" onClick={() => setProjGravity(3.72)}>Mars (3.72)</button>
                  <button type="button" className="chip-btn" onClick={() => setProjGravity(24.79)}>Jupiter (24.79)</button>
                </div>
              </>
            )}

            {physicsMode === 'energy' && (
              <div className="param-grid-row">
                <div className="input-field-group">
                  <label className="field-label">Mass (m, kg)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={massKg}
                    onChange={(e) => setMassKg(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Velocity (v, m/s)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={velMs}
                    onChange={(e) => setVelMs(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Height (h, m)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={heightM}
                    onChange={(e) => setHeightM(e.target.value)}
                  />
                </div>
              </div>
            )}

            {physicsMode === 'waves' && (
              <div className="param-grid-row">
                <div className="input-field-group">
                  <label className="field-label">Voltage (V, Volts)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Current (I, Amps)</label>
                  <input
                    type="number"
                    step="any"
                    className="math-num-input"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Inductance (L, H)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="math-num-input"
                    value={inductanceH}
                    onChange={(e) => setInductanceH(e.target.value)}
                  />
                </div>
                <div className="input-field-group">
                  <label className="field-label">Capacitance (C, F)</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="math-num-input"
                    value={capacitanceF}
                    onChange={(e) => setCapacitanceF(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="complex-glass-card">
            <h3 className="card-section-title">
              <Sparkles size={17} />
              <span>Physics Dynamics & Trajectory</span>
            </h3>

            {physicsResults && (
              <div className="results-inner-stack">
                <div className="hero-result-box">
                  <div className="hero-meta">
                    <span className="badge-pill">
                      {physicsMode === 'projectile' ? 'Horizontal Range (R)' : physicsMode === 'energy' ? 'Kinetic Energy (Ek)' : 'Electric Power (P)'}
                    </span>
                  </div>
                  <div className="hero-val-row">
                    <span className="hero-number">
                      {physicsResults.primaryVal.toFixed(3)} {physicsMode === 'projectile' ? 'm' : physicsMode === 'energy' ? 'J' : 'W'}
                    </span>
                    {onSendToCalculator && (
                      <button
                        type="button"
                        className="send-calc-btn"
                        onClick={() => {
                          handleSound('equals');
                          onSendToCalculator(physicsResults.primaryVal.toFixed(3));
                        }}
                      >
                        <ArrowRight size={14} />
                        <span>Send to Calc</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Projectile Canvas / SVG */}
                {projSvg && (
                  <div className="projectile-svg-card">
                    <div className="svg-header-bar">
                      <span>Ballistic Trajectory Curve</span>
                      <span className="svg-sub">Flight time: {physicsResults.flightTime.toFixed(2)}s | Max height: {physicsResults.maxHeight.toFixed(2)}m</span>
                    </div>
                    <svg viewBox={`0 0 ${projSvg.width} ${projSvg.height}`} className="projectile-svg">
                      <line x1="10" y1={projSvg.groundY} x2={projSvg.width - 10} y2={projSvg.groundY} stroke="var(--border-medium)" />
                      <path d={projSvg.pathD} fill="none" stroke="#ec4899" strokeWidth="2.5" />
                    </svg>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="quadrature-stats-grid">
                  {physicsMode === 'projectile' && (
                    <>
                      <div className="stat-card">
                        <span className="stat-title">Flight Time (T)</span>
                        <span className="stat-val">{physicsResults.flightTime.toFixed(3)} s</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Maximum Height (H)</span>
                        <span className="stat-val">{physicsResults.maxHeight.toFixed(3)} m</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Initial vx</span>
                        <span className="stat-val">{physicsResults.vx.toFixed(2)} m/s</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Initial vy</span>
                        <span className="stat-val">{physicsResults.vy.toFixed(2)} m/s</span>
                      </div>
                    </>
                  )}

                  {physicsMode === 'energy' && (
                    <>
                      <div className="stat-card">
                        <span className="stat-title">Potential Energy (U)</span>
                        <span className="stat-val">{physicsResults.potential.toFixed(2)} J</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Total Mechanical (E)</span>
                        <span className="stat-val">{physicsResults.totalMechanical.toFixed(2)} J</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Linear Momentum (p)</span>
                        <span className="stat-val">{physicsResults.momentum.toFixed(2)} kg·m/s</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Lorentz Factor (γ)</span>
                        <span className="stat-val">{isFinite(physicsResults.gamma) ? physicsResults.gamma.toFixed(6) : '1.000000'}</span>
                      </div>
                    </>
                  )}

                  {physicsMode === 'waves' && (
                    <>
                      <div className="stat-card">
                        <span className="stat-title">Resistance (R = V/I)</span>
                        <span className="stat-val">{isFinite(physicsResults.resistance) ? physicsResults.resistance.toFixed(3) + ' Ω' : '∞'}</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">LC Resonance (f₀)</span>
                        <span className="stat-val">{physicsResults.f0.toFixed(2)} Hz</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
