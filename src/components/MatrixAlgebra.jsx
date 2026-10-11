import React, { useState, useMemo } from 'react';
import { 
  Grid3X3, 
  Sigma, 
  Equal, 
  Plus, 
  Minus, 
  X as MultiplyIcon, 
  RotateCw, 
  Copy, 
  ArrowRight, 
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './MatrixAlgebra.css';

// --- Matrix Math Helpers ---
function createMatrix(rows, cols, initialVal = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(initialVal));
}

function cloneMatrix(mat) {
  return mat.map(row => [...row]);
}

function determinant(mat) {
  const n = mat.length;
  if (n !== mat[0].length) return null;
  if (n === 1) return mat[0][0];
  if (n === 2) return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
  if (n === 3) {
    return (
      mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
      mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
      mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0])
    );
  }
  // Recursive expansion for 4x4
  let det = 0;
  for (let c = 0; c < n; c++) {
    const sub = mat.slice(1).map(row => row.filter((_, colIdx) => colIdx !== c));
    const sign = c % 2 === 0 ? 1 : -1;
    det += sign * mat[0][c] * determinant(sub);
  }
  return det;
}

function invertMatrix(mat) {
  const n = mat.length;
  if (n !== mat[0].length) return null;
  const det = determinant(mat);
  if (Math.abs(det) < 1e-12) return null;

  // Gauss-Jordan elimination on [mat | Identity]
  const augmented = mat.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  ]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    if (Math.abs(augmented[maxRow][i]) < 1e-12) return null;

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Normalize pivot row
    const pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    // Eliminate other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  return augmented.map(row => row.slice(n));
}

function transpose(mat) {
  const r = mat.length;
  const c = mat[0].length;
  const res = createMatrix(c, r);
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      res[j][i] = mat[i][j];
    }
  }
  return res;
}

function roundVal(val, decimals = 4) {
  if (typeof val !== 'number' || isNaN(val)) return '—';
  const factor = 10 ** decimals;
  const rounded = Math.round(val * factor) / factor;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export default function MatrixAlgebra({ soundEnabled, onNotify, onSendToCalculator }) {
  const [subTab, setSubTab] = useState('matrix'); // 'matrix' | 'equations' | 'stats'

  // --- MATRIX STATE ---
  const [dimA, setDimA] = useState({ rows: 2, cols: 2 });
  const [dimB, setDimB] = useState({ rows: 2, cols: 2 });
  const [matrixA, setMatrixA] = useState([
    [3, 2],
    [1, 4]
  ]);
  const [matrixB, setMatrixB] = useState([
    [1, 0],
    [2, 5]
  ]);
  const [scalarK, setScalarK] = useState(2);
  const [matrixResult, setMatrixResult] = useState(null);
  const [matrixMessage, setMatrixMessage] = useState(null);

  // --- EQUATIONS STATE ---
  const [eqMode, setEqMode] = useState('quadratic'); // 'quadratic' | 'cubic' | 'system2' | 'system3'
  // Quadratic: ax^2 + bx + c = 0
  const [quad, setQuad] = useState({ a: 1, b: -5, c: 6 });
  // Cubic: ax^3 + bx^2 + cx + d = 0
  const [cub, setCub] = useState({ a: 1, b: -6, c: 11, d: -6 });
  // System 2x2: a1 x + b1 y = c1, a2 x + b2 y = c2
  const [sys2, setSys2] = useState({
    a1: 2, b1: 3, c1: 8,
    a2: 1, b2: -1, c2: -1
  });
  // System 3x3
  const [sys3, setSys3] = useState({
    a1: 1, b1: 1, c1: 1, d1: 6,
    a2: 0, b2: 2, c2: 5, d2: -4,
    a3: 2, b3: 5, c3: -1, d3: 27
  });

  // --- STATISTICS STATE ---
  const [statsInput, setStatsInput] = useState('12, 19, 23, 23, 28, 34, 42, 51, 67, 85');
  const [regXInput, setRegXInput] = useState('1, 2, 3, 4, 5, 6, 7, 8');
  const [regYInput, setRegYInput] = useState('2.5, 4.1, 7.0, 8.8, 11.2, 13.0, 15.4, 18.2');
  const [predictX, setPredictX] = useState(10);

  const clickFeedback = (type = 'default') => {
    if (soundEnabled) playKeyClick(type);
  };

  // ----------------------------------------------------
  // MATRIX ACTIONS
  // ----------------------------------------------------
  const handleUpdateCell = (target, r, c, val) => {
    const num = parseFloat(val) || 0;
    if (target === 'A') {
      const next = cloneMatrix(matrixA);
      next[r][c] = num;
      setMatrixA(next);
    } else {
      const next = cloneMatrix(matrixB);
      next[r][c] = num;
      setMatrixB(next);
    }
  };

  const handleResize = (target, newRows, newCols) => {
    clickFeedback('operator');
    const r = Math.max(1, Math.min(4, newRows));
    const c = Math.max(1, Math.min(4, newCols));
    if (target === 'A') {
      setDimA({ rows: r, cols: c });
      const next = createMatrix(r, c);
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          next[i][j] = matrixA[i]?.[j] ?? (i === j ? 1 : 0);
        }
      }
      setMatrixA(next);
    } else {
      setDimB({ rows: r, cols: c });
      const next = createMatrix(r, c);
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          next[i][j] = matrixB[i]?.[j] ?? (i === j ? 1 : 0);
        }
      }
      setMatrixB(next);
    }
  };

  const handleSetPreset = (target, type) => {
    clickFeedback('default');
    const dims = target === 'A' ? dimA : dimB;
    const r = dims.rows;
    const c = dims.cols;
    const next = createMatrix(r, c);

    if (type === 'identity') {
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          next[i][j] = i === j ? 1 : 0;
        }
      }
    } else if (type === 'random') {
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          next[i][j] = Math.floor(Math.random() * 19) - 9; // -9 to 9
        }
      }
    } else if (type === 'zeros') {
      // already 0
    }

    if (target === 'A') setMatrixA(next);
    else setMatrixB(next);
    onNotify?.(`Applied ${type} to Matrix ${target}`, 'info');
  };

  // Matrix Operations
  const handleMatrixAdd = () => {
    clickFeedback('operator');
    if (dimA.rows !== dimB.rows || dimA.cols !== dimB.cols) {
      setMatrixResult(null);
      setMatrixMessage({ text: 'Dimensions must match for addition (rows & cols must be identical).', error: true });
      return;
    }
    const res = createMatrix(dimA.rows, dimA.cols);
    for (let i = 0; i < dimA.rows; i++) {
      for (let j = 0; j < dimA.cols; j++) {
        res[i][j] = matrixA[i][j] + matrixB[i][j];
      }
    }
    setMatrixResult({ type: 'matrix', title: 'Result: A + B', data: res });
    setMatrixMessage(null);
  };

  const handleMatrixSub = () => {
    clickFeedback('operator');
    if (dimA.rows !== dimB.rows || dimA.cols !== dimB.cols) {
      setMatrixResult(null);
      setMatrixMessage({ text: 'Dimensions must match for subtraction (rows & cols must be identical).', error: true });
      return;
    }
    const res = createMatrix(dimA.rows, dimA.cols);
    for (let i = 0; i < dimA.rows; i++) {
      for (let j = 0; j < dimA.cols; j++) {
        res[i][j] = matrixA[i][j] - matrixB[i][j];
      }
    }
    setMatrixResult({ type: 'matrix', title: 'Result: A − B', data: res });
    setMatrixMessage(null);
  };

  const handleMatrixMultiply = () => {
    clickFeedback('operator');
    if (dimA.cols !== dimB.rows) {
      setMatrixResult(null);
      setMatrixMessage({
        text: `Cannot multiply: Cols of A (${dimA.cols}) must equal Rows of B (${dimB.rows}).`,
        error: true
      });
      return;
    }
    const res = createMatrix(dimA.rows, dimB.cols);
    for (let i = 0; i < dimA.rows; i++) {
      for (let j = 0; j < dimB.cols; j++) {
        let sum = 0;
        for (let k = 0; k < dimA.cols; k++) {
          sum += matrixA[i][k] * matrixB[k][j];
        }
        res[i][j] = sum;
      }
    }
    setMatrixResult({ type: 'matrix', title: `Result: A × B (${dimA.rows}×${dimB.cols})`, data: res });
    setMatrixMessage(null);
  };

  const handleScalarMultiply = (target) => {
    clickFeedback('operator');
    const mat = target === 'A' ? matrixA : matrixB;
    const dims = target === 'A' ? dimA : dimB;
    const res = createMatrix(dims.rows, dims.cols);
    for (let i = 0; i < dims.rows; i++) {
      for (let j = 0; j < dims.cols; j++) {
        res[i][j] = mat[i][j] * scalarK;
      }
    }
    setMatrixResult({ type: 'matrix', title: `Result: ${scalarK} × Matrix ${target}`, data: res });
    setMatrixMessage(null);
  };

  const handleDeterminant = (target) => {
    clickFeedback('equals');
    const mat = target === 'A' ? matrixA : matrixB;
    const dims = target === 'A' ? dimA : dimB;
    if (dims.rows !== dims.cols) {
      setMatrixResult(null);
      setMatrixMessage({ text: `Matrix ${target} must be square to calculate determinant.`, error: true });
      return;
    }
    const det = determinant(mat);
    setMatrixResult({
      type: 'scalar',
      title: `det(${target})`,
      val: det,
      note: det === 0 ? 'Singular Matrix (det = 0, no inverse)' : 'Non-singular Matrix (invertible)'
    });
    setMatrixMessage(null);
  };

  const handleInverse = (target) => {
    clickFeedback('equals');
    const mat = target === 'A' ? matrixA : matrixB;
    const dims = target === 'A' ? dimA : dimB;
    if (dims.rows !== dims.cols) {
      setMatrixResult(null);
      setMatrixMessage({ text: `Matrix ${target} must be square to invert.`, error: true });
      return;
    }
    const inv = invertMatrix(mat);
    if (!inv) {
      setMatrixResult(null);
      setMatrixMessage({ text: `Matrix ${target} is singular (det = 0), inverse does not exist.`, error: true });
      return;
    }
    setMatrixResult({ type: 'matrix', title: `Result: (${target})⁻¹ Inverse`, data: inv });
    setMatrixMessage(null);
  };

  const handleTranspose = (target) => {
    clickFeedback('default');
    const mat = target === 'A' ? matrixA : matrixB;
    const res = transpose(mat);
    setMatrixResult({ type: 'matrix', title: `Result: ${target}ᵀ Transpose`, data: res });
    setMatrixMessage(null);
  };

  const handleTrace = (target) => {
    clickFeedback('equals');
    const mat = target === 'A' ? matrixA : matrixB;
    const dims = target === 'A' ? dimA : dimB;
    if (dims.rows !== dims.cols) {
      setMatrixResult(null);
      setMatrixMessage({ text: `Matrix ${target} must be square for trace.`, error: true });
      return;
    }
    let tr = 0;
    for (let i = 0; i < dims.rows; i++) tr += mat[i][i];
    setMatrixResult({ type: 'scalar', title: `tr(${target}) Trace`, val: tr, note: 'Sum of main diagonal elements' });
    setMatrixMessage(null);
  };

  const handleSwapAB = () => {
    clickFeedback('default');
    const tempMat = cloneMatrix(matrixA);
    const tempDim = { ...dimA };
    setMatrixA(cloneMatrix(matrixB));
    setDimA({ ...dimB });
    setMatrixB(tempMat);
    setDimB(tempDim);
    onNotify?.('Swapped Matrix A ⇄ Matrix B', 'info');
  };

  const handleCopyResultTo = (target) => {
    clickFeedback('default');
    if (!matrixResult || matrixResult.type !== 'matrix') return;
    const res = matrixResult.data;
    const r = res.length;
    const c = res[0].length;
    if (target === 'A') {
      setDimA({ rows: r, cols: c });
      setMatrixA(cloneMatrix(res));
    } else {
      setDimB({ rows: r, cols: c });
      setMatrixB(cloneMatrix(res));
    }
    onNotify?.(`Loaded result into Matrix ${target}!`, 'success');
  };

  // ----------------------------------------------------
  // EQUATIONS SOLVER EVALUATION
  // ----------------------------------------------------
  const quadraticResult = useMemo(() => {
    const a = parseFloat(quad.a);
    const b = parseFloat(quad.b);
    const c = parseFloat(quad.c);
    if (!a || isNaN(a)) return { error: 'Coefficient "a" cannot be 0 for a quadratic equation.' };
    const disc = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = c - (b * b) / (4 * a);

    if (disc > 1e-12) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a);
      const r2 = (-b - Math.sqrt(disc)) / (2 * a);
      return {
        type: 'two_real',
        disc,
        roots: [roundVal(r1), roundVal(r2)],
        rawRoots: [r1, r2],
        vertex: `(${roundVal(vertexX)}, ${roundVal(vertexY)})`,
        direction: a > 0 ? 'Opens Upwards (Minimum at vertex)' : 'Opens Downwards (Maximum at vertex)'
      };
    } else if (Math.abs(disc) <= 1e-12) {
      const r = -b / (2 * a);
      return {
        type: 'one_real',
        disc: 0,
        roots: [roundVal(r)],
        rawRoots: [r],
        vertex: `(${roundVal(vertexX)}, ${roundVal(vertexY)})`,
        direction: a > 0 ? 'Opens Upwards' : 'Opens Downwards'
      };
    } else {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-disc) / (2 * a);
      return {
        type: 'complex',
        disc,
        roots: [
          `${roundVal(real)} + ${roundVal(Math.abs(imag))}i`,
          `${roundVal(real)} − ${roundVal(Math.abs(imag))}i`
        ],
        vertex: `(${roundVal(vertexX)}, ${roundVal(vertexY)})`,
        direction: a > 0 ? 'Opens Upwards' : 'Opens Downwards'
      };
    }
  }, [quad]);

  const cubicResult = useMemo(() => {
    const a = parseFloat(cub.a);
    const b = parseFloat(cub.b);
    const c = parseFloat(cub.c);
    const d = parseFloat(cub.d);
    if (!a || isNaN(a)) return { error: 'Coefficient "a" cannot be 0 for a cubic equation.' };

    // Depressed cubic t^3 + pt + q = 0
    const p = (3 * a * c - b * b) / (3 * a * a);
    const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
    const disc = (q * q) / 4 + (p * p * p) / 27;
    const shift = -b / (3 * a);

    if (disc > 1e-9) {
      // 1 real root, 2 complex conjugates
      const u = Math.cbrt(-q / 2 + Math.sqrt(disc));
      const v = Math.cbrt(-q / 2 - Math.sqrt(disc));
      const r1 = u + v + shift;
      const realPart = -(u + v) / 2 + shift;
      const imagPart = ((u - v) * Math.sqrt(3)) / 2;
      return {
        roots: [
          roundVal(r1),
          `${roundVal(realPart)} + ${roundVal(Math.abs(imagPart))}i`,
          `${roundVal(realPart)} − ${roundVal(Math.abs(imagPart))}i`
        ],
        rawRoots: [r1]
      };
    } else {
      // 3 real roots
      const r = Math.sqrt(-Math.pow(p / 3, 3));
      const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
      const m = 2 * Math.cbrt(r);
      const r1 = m * Math.cos(phi / 3) + shift;
      const r2 = m * Math.cos((phi + 2 * Math.PI) / 3) + shift;
      const r3 = m * Math.cos((phi + 4 * Math.PI) / 3) + shift;
      return {
        roots: [roundVal(r1), roundVal(r2), roundVal(r3)],
        rawRoots: [r1, r2, r3]
      };
    }
  }, [cub]);

  const system2Result = useMemo(() => {
    const { a1, b1, c1, a2, b2, c2 } = sys2;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-12) {
      const detX = c1 * b2 - c2 * b1;
      if (Math.abs(detX) < 1e-12) {
        return { status: 'infinite', message: 'Infinitely many solutions (dependent lines)' };
      }
      return { status: 'none', message: 'No solution (parallel inconsistent lines)' };
    }
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    return {
      status: 'unique',
      x: roundVal(x),
      y: roundVal(y),
      raw: { x, y }
    };
  }, [sys2]);

  const system3Result = useMemo(() => {
    const mat = [
      [sys3.a1, sys3.b1, sys3.c1, sys3.d1],
      [sys3.a2, sys3.b2, sys3.c2, sys3.d2],
      [sys3.a3, sys3.b3, sys3.c3, sys3.d3]
    ];
    // Gauss Jordan
    for (let i = 0; i < 3; i++) {
      let maxRow = i;
      for (let k = i + 1; k < 3; k++) {
        if (Math.abs(mat[k][i]) > Math.abs(mat[maxRow][i])) maxRow = k;
      }
      if (Math.abs(mat[maxRow][i]) < 1e-12) {
        return { status: 'error', message: 'System is singular or has infinite solutions.' };
      }
      [mat[i], mat[maxRow]] = [mat[maxRow], mat[i]];
      const pivot = mat[i][i];
      for (let j = 0; j < 4; j++) mat[i][j] /= pivot;
      for (let k = 0; k < 3; k++) {
        if (k !== i) {
          const factor = mat[k][i];
          for (let j = 0; j < 4; j++) mat[k][j] -= factor * mat[i][j];
        }
      }
    }
    return {
      status: 'unique',
      x: roundVal(mat[0][3]),
      y: roundVal(mat[1][3]),
      z: roundVal(mat[2][3]),
      raw: { x: mat[0][3], y: mat[1][3], z: mat[2][3] }
    };
  }, [sys3]);

  // ----------------------------------------------------
  // STATISTICS EVALUATION
  // ----------------------------------------------------
  const statsResult = useMemo(() => {
    const numbers = statsInput
      .split(/[\s,]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (numbers.length === 0) return null;

    const n = numbers.length;
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;
    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // Mode
    const freq = {};
    let maxFreq = 0;
    sorted.forEach(v => {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > maxFreq) maxFreq = freq[v];
    });
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq && maxFreq > 1);

    // Variance & Std Dev
    const variancePop = numbers.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
    const stdDevPop = Math.sqrt(variancePop);
    const varianceSample = n > 1 ? numbers.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;
    const stdDevSample = Math.sqrt(varianceSample);

    // Quartiles
    const getPercentile = (p) => {
      const idx = (p / 100) * (n - 1);
      const low = Math.floor(idx);
      const high = Math.ceil(idx);
      const weight = idx - low;
      return sorted[low] * (1 - weight) + sorted[high] * weight;
    };
    const q1 = getPercentile(25);
    const q3 = getPercentile(75);
    const iqr = q3 - q1;

    return {
      count: n,
      sum: roundVal(sum),
      mean: roundVal(mean),
      median: roundVal(median),
      mode: modes.length > 0 ? modes.join(', ') : 'None',
      varianceSample: roundVal(varianceSample),
      stdDevSample: roundVal(stdDevSample),
      variancePop: roundVal(variancePop),
      stdDevPop: roundVal(stdDevPop),
      min: roundVal(min),
      max: roundVal(max),
      range: roundVal(range),
      q1: roundVal(q1),
      q3: roundVal(q3),
      iqr: roundVal(iqr),
      rawMean: mean
    };
  }, [statsInput]);

  const regressionResult = useMemo(() => {
    const xs = regXInput.split(/[\s,]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const ys = regYInput.split(/[\s,]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const n = Math.min(xs.length, ys.length);
    if (n < 2) return null;

    const xSlice = xs.slice(0, n);
    const ySlice = ys.slice(0, n);

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += xSlice[i];
      sumY += ySlice[i];
      sumXY += xSlice[i] * ySlice[i];
      sumX2 += xSlice[i] * xSlice[i];
      sumY2 += ySlice[i] * ySlice[i];
    }

    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-12) return { error: 'Vertical line / constant X values' };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    // Pearson r
    const rDenom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = Math.abs(rDenom) > 1e-12 ? (n * sumXY - sumX * sumY) / rDenom : 0;
    const r2 = r * r;

    const predY = slope * parseFloat(predictX || 0) + intercept;

    return {
      n,
      slope: roundVal(slope),
      intercept: roundVal(intercept),
      eq: `y = ${roundVal(slope)}x ${intercept >= 0 ? '+ ' + roundVal(intercept) : '− ' + roundVal(Math.abs(intercept))}`,
      r: roundVal(r),
      r2: roundVal(r2),
      predY: roundVal(predY),
      rawSlope: slope
    };
  }, [regXInput, regYInput, predictX]);

  return (
    <div className="matrix-workspace animate-fade-in">
      <div className="matrix-card">
        {/* Workspace Top Header */}
        <div className="matrix-header">
          <div className="matrix-title-group">
            <div className="matrix-title">
              <div className="matrix-icon-box">
                <Grid3X3 size={20} />
              </div>
              <span>Matrix & Algebra Studio</span>
              <span className="badge-pill">Phase 4</span>
            </div>
            <p className="matrix-subtitle">
              Linear algebra, multi-matrix transformations, polynomial equation root finders, and regression lab.
            </p>
          </div>

          {/* Sub Navigation Switcher */}
          <div className="matrix-nav-tabs">
            <button
              type="button"
              className={`matrix-tab-btn ${subTab === 'matrix' ? 'active' : ''}`}
              onClick={() => {
                clickFeedback('default');
                setSubTab('matrix');
              }}
            >
              <Grid3X3 size={15} />
              <span>Matrix Studio</span>
            </button>
            <button
              type="button"
              className={`matrix-tab-btn ${subTab === 'equations' ? 'active' : ''}`}
              onClick={() => {
                clickFeedback('default');
                setSubTab('equations');
              }}
            >
              <Equal size={15} />
              <span>Equation Solver</span>
            </button>
            <button
              type="button"
              className={`matrix-tab-btn ${subTab === 'stats' ? 'active' : ''}`}
              onClick={() => {
                clickFeedback('default');
                setSubTab('stats');
              }}
            >
              <Sigma size={15} />
              <span>Statistics & Regression</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* TAB 1: MATRIX STUDIO */}
        {/* ---------------------------------------------------------------- */}
        {subTab === 'matrix' && (
          <div className="matrix-body">
            {/* Matrices Inputs Row */}
            <div className="matrix-grids-row">
              {/* MATRIX A */}
              <div className="matrix-box">
                <div className="matrix-box-header">
                  <div className="box-label-group">
                    <span className="matrix-name">Matrix A</span>
                    <span className="matrix-dim-badge">{dimA.rows} × {dimA.cols}</span>
                  </div>
                  {/* Dimension Controls */}
                  <div className="dim-steppers">
                    <span className="dim-title">Size:</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('A', dimA.rows - 1, dimA.cols)}
                      title="Decrease Rows"
                    >-</button>
                    <span className="dim-val">{dimA.rows}r</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('A', dimA.rows + 1, dimA.cols)}
                      title="Increase Rows"
                    >+</button>
                    <span className="dim-sep">×</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('A', dimA.rows, dimA.cols - 1)}
                      title="Decrease Columns"
                    >-</button>
                    <span className="dim-val">{dimA.cols}c</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('A', dimA.rows, dimA.cols + 1)}
                      title="Increase Columns"
                    >+</button>
                  </div>
                </div>

                {/* Matrix Grid */}
                <div 
                  className="matrix-grid-bracket"
                  style={{ gridTemplateColumns: `repeat(${dimA.cols}, minmax(0, 1fr))` }}
                >
                  {matrixA.map((row, r) =>
                    row.map((val, c) => (
                      <input
                        key={`A-${r}-${c}`}
                        type="number"
                        className="matrix-cell-input"
                        value={val}
                        onChange={(e) => handleUpdateCell('A', r, c, e.target.value)}
                      />
                    ))
                  )}
                </div>

                {/* Presets */}
                <div className="matrix-actions-row">
                  <button type="button" className="btn-preset" onClick={() => handleSetPreset('A', 'identity')}>Identity</button>
                  <button type="button" className="btn-preset" onClick={() => handleSetPreset('A', 'random')}>Random</button>
                  <button type="button" className="btn-preset" onClick={() => handleSetPreset('A', 'zeros')}>Clear</button>
                </div>

                {/* Unary Operations for A */}
                <div className="matrix-unary-ops">
                  <button type="button" className="unary-btn" onClick={() => handleDeterminant('A')} title="Determinant of A">det(A)</button>
                  <button type="button" className="unary-btn" onClick={() => handleInverse('A')} title="Inverse of A">A⁻¹</button>
                  <button type="button" className="unary-btn" onClick={() => handleTranspose('A')} title="Transpose of A">Aᵀ</button>
                  <button type="button" className="unary-btn" onClick={() => handleTrace('A')} title="Trace of A">tr(A)</button>
                </div>
              </div>

              {/* Inter-Matrix Controls Column */}
              <div className="inter-matrix-divider">
                <button
                  type="button"
                  className="swap-btn"
                  onClick={handleSwapAB}
                  title="Swap Matrix A ⇄ Matrix B"
                >
                  <RotateCw size={18} />
                  <span>Swap</span>
                </button>
              </div>

              {/* MATRIX B */}
              <div className="matrix-box">
                <div className="matrix-box-header">
                  <div className="box-label-group">
                    <span className="matrix-name">Matrix B</span>
                    <span className="matrix-dim-badge">{dimB.rows} × {dimB.cols}</span>
                  </div>
                  {/* Dimension Controls */}
                  <div className="dim-steppers">
                    <span className="dim-title">Size:</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('B', dimB.rows - 1, dimB.cols)}
                      title="Decrease Rows"
                    >-</button>
                    <span className="dim-val">{dimB.rows}r</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('B', dimB.rows + 1, dimB.cols)}
                      title="Increase Rows"
                    >+</button>
                    <span className="dim-sep">×</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('B', dimB.rows, dimB.cols - 1)}
                      title="Decrease Columns"
                    >-</button>
                    <span className="dim-val">{dimB.cols}c</span>
                    <button 
                      type="button" 
                      className="dim-btn"
                      onClick={() => handleResize('B', dimB.rows, dimB.cols + 1)}
                      title="Increase Columns"
                    >+</button>
                  </div>
                </div>

                {/* Matrix Grid */}
                <div 
                  className="matrix-grid-bracket"
                  style={{ gridTemplateColumns: `repeat(${dimB.cols}, minmax(0, 1fr))` }}
                >
                  {matrixB.map((row, r) =>
                    row.map((val, c) => (
                      <input
                        key={`B-${r}-${c}`}
                        type="number"
                        className="matrix-cell-input"
                        value={val}
                        onChange={(e) => handleUpdateCell('B', r, c, e.target.value)}
                      />
                    ))
                  )}
                </div>

                {/* Presets */}
                <div className="matrix-actions-row">
                  <button type="button" className="btn-preset" onClick={() => handleSetPreset('B', 'identity')}>Identity</button>
                  <button type="button" className="btn-preset" onClick={() => handleSetPreset('B', 'random')}>Random</button>
                  <button type="button" className="btn-preset" onClick={() => handleSetPreset('B', 'zeros')}>Clear</button>
                </div>

                {/* Unary Operations for B */}
                <div className="matrix-unary-ops">
                  <button type="button" className="unary-btn" onClick={() => handleDeterminant('B')} title="Determinant of B">det(B)</button>
                  <button type="button" className="unary-btn" onClick={() => handleInverse('B')} title="Inverse of B">B⁻¹</button>
                  <button type="button" className="unary-btn" onClick={() => handleTranspose('B')} title="Transpose of B">Bᵀ</button>
                  <button type="button" className="unary-btn" onClick={() => handleTrace('B')} title="Trace of B">tr(B)</button>
                </div>
              </div>
            </div>

            {/* Matrix Operations Command Bar */}
            <div className="matrix-operations-bar">
              <div className="binary-ops-group">
                <button type="button" className="op-calc-btn primary" onClick={handleMatrixAdd}>
                  <Plus size={16} />
                  <span>A + B</span>
                </button>
                <button type="button" className="op-calc-btn primary" onClick={handleMatrixSub}>
                  <Minus size={16} />
                  <span>A − B</span>
                </button>
                <button type="button" className="op-calc-btn primary" onClick={handleMatrixMultiply}>
                  <MultiplyIcon size={16} />
                  <span>A × B</span>
                </button>
              </div>

              {/* Scalar Multiplication */}
              <div className="scalar-group">
                <span className="scalar-label">Scalar k =</span>
                <input
                  type="number"
                  className="scalar-input"
                  value={scalarK}
                  onChange={(e) => setScalarK(parseFloat(e.target.value) || 1)}
                />
                <button type="button" className="op-calc-btn secondary" onClick={() => handleScalarMultiply('A')}>
                  k × A
                </button>
                <button type="button" className="op-calc-btn secondary" onClick={() => handleScalarMultiply('B')}>
                  k × B
                </button>
              </div>
            </div>

            {/* Error Message */}
            {matrixMessage && (
              <div className={`matrix-alert-box ${matrixMessage.error ? 'alert-error' : 'alert-info'}`}>
                <span>{matrixMessage.text}</span>
              </div>
            )}

            {/* RESULT CARD */}
            {matrixResult && (
              <div className="matrix-result-card animate-fade-in">
                <div className="result-header">
                  <span className="result-title">{matrixResult.title}</span>
                  {matrixResult.type === 'matrix' && (
                    <div className="result-tools">
                      <button type="button" className="btn-tool" onClick={() => handleCopyResultTo('A')}>
                        <Copy size={13} />
                        <span>Copy to A</span>
                      </button>
                      <button type="button" className="btn-tool" onClick={() => handleCopyResultTo('B')}>
                        <Copy size={13} />
                        <span>Copy to B</span>
                      </button>
                    </div>
                  )}
                  {matrixResult.type === 'scalar' && (
                    <button
                      type="button"
                      className="btn-send-calc"
                      onClick={() => onSendToCalculator?.(roundVal(matrixResult.val))}
                    >
                      <ArrowRight size={13} />
                      <span>Send to Calc</span>
                    </button>
                  )}
                </div>

                {matrixResult.type === 'matrix' ? (
                  <div 
                    className="result-matrix-display"
                    style={{ gridTemplateColumns: `repeat(${matrixResult.data[0].length}, minmax(0, 1fr))` }}
                  >
                    {matrixResult.data.map((row, r) =>
                      row.map((val, c) => (
                        <div key={`res-${r}-${c}`} className="result-matrix-cell">
                          {roundVal(val)}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="result-scalar-display">
                    <span className="scalar-value">{roundVal(matrixResult.val)}</span>
                    {matrixResult.note && <span className="scalar-note">{matrixResult.note}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 2: EQUATION SOLVER */}
        {/* ---------------------------------------------------------------- */}
        {subTab === 'equations' && (
          <div className="equations-body">
            {/* Equation Submode Switcher */}
            <div className="eq-submode-tabs">
              <button
                type="button"
                className={`eq-submode-btn ${eqMode === 'quadratic' ? 'active' : ''}`}
                onClick={() => {
                  clickFeedback('default');
                  setEqMode('quadratic');
                }}
              >
                Quadratic (ax² + bx + c)
              </button>
              <button
                type="button"
                className={`eq-submode-btn ${eqMode === 'cubic' ? 'active' : ''}`}
                onClick={() => {
                  clickFeedback('default');
                  setEqMode('cubic');
                }}
              >
                Cubic (ax³ + bx² + cx + d)
              </button>
              <button
                type="button"
                className={`eq-submode-btn ${eqMode === 'system2' ? 'active' : ''}`}
                onClick={() => {
                  clickFeedback('default');
                  setEqMode('system2');
                }}
              >
                2×2 Linear System
              </button>
              <button
                type="button"
                className={`eq-submode-btn ${eqMode === 'system3' ? 'active' : ''}`}
                onClick={() => {
                  clickFeedback('default');
                  setEqMode('system3');
                }}
              >
                3×3 Linear System
              </button>
            </div>

            {/* QUADRATIC */}
            {eqMode === 'quadratic' && (
              <div className="eq-card-section">
                <div className="eq-formula-preview">
                  <span className="eq-latex-math">
                    ({quad.a || 'a'})x² + ({quad.b || 'b'})x + ({quad.c || 'c'}) = 0
                  </span>
                </div>

                <div className="eq-inputs-grid">
                  <div className="eq-input-item">
                    <label>a (x²)</label>
                    <input
                      type="number"
                      value={quad.a}
                      onChange={(e) => setQuad({ ...quad, a: e.target.value })}
                    />
                  </div>
                  <div className="eq-input-item">
                    <label>b (x)</label>
                    <input
                      type="number"
                      value={quad.b}
                      onChange={(e) => setQuad({ ...quad, b: e.target.value })}
                    />
                  </div>
                  <div className="eq-input-item">
                    <label>c (constant)</label>
                    <input
                      type="number"
                      value={quad.c}
                      onChange={(e) => setQuad({ ...quad, c: e.target.value })}
                    />
                  </div>
                </div>

                {quadraticResult.error ? (
                  <div className="matrix-alert-box alert-error">{quadraticResult.error}</div>
                ) : (
                  <div className="eq-solution-box animate-fade-in">
                    <div className="solution-row">
                      <span className="sol-label">Discriminant (Δ = b² − 4ac):</span>
                      <span className="sol-val">{roundVal(quadraticResult.disc)}</span>
                    </div>

                    <div className="solution-roots-grid">
                      {quadraticResult.roots.map((root, idx) => (
                        <div key={idx} className="root-pill-card">
                          <span className="root-name">Root x{idx + 1}:</span>
                          <span className="root-number">{root}</span>
                          {quadraticResult.rawRoots && quadraticResult.rawRoots[idx] !== undefined && (
                            <button
                              type="button"
                              className="btn-send-mini"
                              onClick={() => onSendToCalculator?.(roundVal(quadraticResult.rawRoots[idx]))}
                              title="Send to main calculator"
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="solution-meta">
                      <div className="meta-item">
                        <span>Parabola Vertex:</span>
                        <strong>{quadraticResult.vertex}</strong>
                      </div>
                      <div className="meta-item">
                        <span>Orientation:</span>
                        <strong>{quadraticResult.direction}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CUBIC */}
            {eqMode === 'cubic' && (
              <div className="eq-card-section">
                <div className="eq-formula-preview">
                  <span className="eq-latex-math">
                    ({cub.a})x³ + ({cub.b})x² + ({cub.c})x + ({cub.d}) = 0
                  </span>
                </div>

                <div className="eq-inputs-grid-4">
                  <div className="eq-input-item">
                    <label>a (x³)</label>
                    <input type="number" value={cub.a} onChange={(e) => setCub({ ...cub, a: e.target.value })} />
                  </div>
                  <div className="eq-input-item">
                    <label>b (x²)</label>
                    <input type="number" value={cub.b} onChange={(e) => setCub({ ...cub, b: e.target.value })} />
                  </div>
                  <div className="eq-input-item">
                    <label>c (x)</label>
                    <input type="number" value={cub.c} onChange={(e) => setCub({ ...cub, c: e.target.value })} />
                  </div>
                  <div className="eq-input-item">
                    <label>d (const)</label>
                    <input type="number" value={cub.d} onChange={(e) => setCub({ ...cub, d: e.target.value })} />
                  </div>
                </div>

                {cubicResult.error ? (
                  <div className="matrix-alert-box alert-error">{cubicResult.error}</div>
                ) : (
                  <div className="eq-solution-box animate-fade-in">
                    <span className="sol-label">Cubic Solutions (Cardano Roots):</span>
                    <div className="solution-roots-grid">
                      {cubicResult.roots.map((root, idx) => (
                        <div key={idx} className="root-pill-card">
                          <span className="root-name">x{idx + 1}:</span>
                          <span className="root-number">{root}</span>
                          {cubicResult.rawRoots && cubicResult.rawRoots[idx] !== undefined && (
                            <button
                              type="button"
                              className="btn-send-mini"
                              onClick={() => onSendToCalculator?.(roundVal(cubicResult.rawRoots[idx]))}
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2X2 LINEAR SYSTEM */}
            {eqMode === 'system2' && (
              <div className="eq-card-section">
                <span className="section-note">Solve system of 2 linear equations in x and y:</span>
                <div className="system-row-inputs">
                  <div className="linear-eq-line">
                    <input type="number" value={sys2.a1} onChange={(e) => setSys2({ ...sys2, a1: parseFloat(e.target.value) || 0 })} />
                    <span>x +</span>
                    <input type="number" value={sys2.b1} onChange={(e) => setSys2({ ...sys2, b1: parseFloat(e.target.value) || 0 })} />
                    <span>y =</span>
                    <input type="number" value={sys2.c1} onChange={(e) => setSys2({ ...sys2, c1: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="linear-eq-line">
                    <input type="number" value={sys2.a2} onChange={(e) => setSys2({ ...sys2, a2: parseFloat(e.target.value) || 0 })} />
                    <span>x +</span>
                    <input type="number" value={sys2.b2} onChange={(e) => setSys2({ ...sys2, b2: parseFloat(e.target.value) || 0 })} />
                    <span>y =</span>
                    <input type="number" value={sys2.c2} onChange={(e) => setSys2({ ...sys2, c2: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="eq-solution-box animate-fade-in">
                  {system2Result.status === 'unique' ? (
                    <div className="system-solutions-duo">
                      <div className="sys-sol-card">
                        <span className="sys-var">Variable x:</span>
                        <span className="sys-val">{system2Result.x}</span>
                        <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(system2Result.x)}>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                      <div className="sys-sol-card">
                        <span className="sys-var">Variable y:</span>
                        <span className="sys-val">{system2Result.y}</span>
                        <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(system2Result.y)}>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="matrix-alert-box alert-info">{system2Result.message}</div>
                  )}
                </div>
              </div>
            )}

            {/* 3X3 LINEAR SYSTEM */}
            {eqMode === 'system3' && (
              <div className="eq-card-section">
                <span className="section-note">Solve system of 3 linear equations in x, y, and z:</span>
                <div className="system-row-inputs">
                  <div className="linear-eq-line">
                    <input type="number" value={sys3.a1} onChange={(e) => setSys3({ ...sys3, a1: parseFloat(e.target.value) || 0 })} />
                    <span>x +</span>
                    <input type="number" value={sys3.b1} onChange={(e) => setSys3({ ...sys3, b1: parseFloat(e.target.value) || 0 })} />
                    <span>y +</span>
                    <input type="number" value={sys3.c1} onChange={(e) => setSys3({ ...sys3, c1: parseFloat(e.target.value) || 0 })} />
                    <span>z =</span>
                    <input type="number" value={sys3.d1} onChange={(e) => setSys3({ ...sys3, d1: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="linear-eq-line">
                    <input type="number" value={sys3.a2} onChange={(e) => setSys3({ ...sys3, a2: parseFloat(e.target.value) || 0 })} />
                    <span>x +</span>
                    <input type="number" value={sys3.b2} onChange={(e) => setSys3({ ...sys3, b2: parseFloat(e.target.value) || 0 })} />
                    <span>y +</span>
                    <input type="number" value={sys3.c2} onChange={(e) => setSys3({ ...sys3, c2: parseFloat(e.target.value) || 0 })} />
                    <span>z =</span>
                    <input type="number" value={sys3.d2} onChange={(e) => setSys3({ ...sys3, d2: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="linear-eq-line">
                    <input type="number" value={sys3.a3} onChange={(e) => setSys3({ ...sys3, a3: parseFloat(e.target.value) || 0 })} />
                    <span>x +</span>
                    <input type="number" value={sys3.b3} onChange={(e) => setSys3({ ...sys3, b3: parseFloat(e.target.value) || 0 })} />
                    <span>y +</span>
                    <input type="number" value={sys3.c3} onChange={(e) => setSys3({ ...sys3, c3: parseFloat(e.target.value) || 0 })} />
                    <span>z =</span>
                    <input type="number" value={sys3.d3} onChange={(e) => setSys3({ ...sys3, d3: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="eq-solution-box animate-fade-in">
                  {system3Result.status === 'unique' ? (
                    <div className="system-solutions-trio">
                      <div className="sys-sol-card">
                        <span className="sys-var">x:</span>
                        <span className="sys-val">{system3Result.x}</span>
                        <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(system3Result.x)}>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                      <div className="sys-sol-card">
                        <span className="sys-var">y:</span>
                        <span className="sys-val">{system3Result.y}</span>
                        <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(system3Result.y)}>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                      <div className="sys-sol-card">
                        <span className="sys-var">z:</span>
                        <span className="sys-val">{system3Result.z}</span>
                        <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(system3Result.z)}>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="matrix-alert-box alert-info">{system3Result.message}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 3: STATISTICS & REGRESSION */}
        {/* ---------------------------------------------------------------- */}
        {subTab === 'stats' && (
          <div className="stats-body">
            {/* Descriptive Statistics Section */}
            <div className="stats-block">
              <div className="stats-block-header">
                <div className="stats-header-title">
                  <BarChart2 size={16} />
                  <span>Descriptive Dataset Analysis</span>
                </div>
                <div className="stats-quick-presets">
                  <button 
                    type="button" 
                    className="preset-pill"
                    onClick={() => setStatsInput('45, 67, 72, 80, 85, 88, 92, 94, 98, 100')}
                  >
                    Exam Scores
                  </button>
                  <button 
                    type="button" 
                    className="preset-pill"
                    onClick={() => setStatsInput('12.4, 15.8, 14.2, 19.1, 16.5, 22.0, 18.3, 21.7')}
                  >
                    Sensor Data
                  </button>
                  <button 
                    type="button" 
                    className="preset-pill"
                    onClick={() => setStatsInput('1, 1, 2, 3, 5, 8, 13, 21, 34, 55')}
                  >
                    Fibonacci
                  </button>
                </div>
              </div>

              <textarea
                className="stats-textarea"
                rows={2}
                value={statsInput}
                onChange={(e) => setStatsInput(e.target.value)}
                placeholder="Enter numbers separated by commas or spaces (e.g. 10, 20, 25, 30)..."
              />

              {statsResult && (
                <div className="stats-metrics-grid animate-fade-in">
                  <div className="metric-box">
                    <span className="metric-label">Sample Count (n)</span>
                    <span className="metric-value">{statsResult.count}</span>
                  </div>
                  <div className="metric-box highlight">
                    <span className="metric-label">Mean (μ)</span>
                    <span className="metric-value">{statsResult.mean}</span>
                    <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(statsResult.mean)}>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Median</span>
                    <span className="metric-value">{statsResult.median}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Mode</span>
                    <span className="metric-value">{statsResult.mode}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Sample Std Dev (s)</span>
                    <span className="metric-value">{statsResult.stdDevSample}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Pop Std Dev (σ)</span>
                    <span className="metric-value">{statsResult.stdDevPop}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Sample Variance (s²)</span>
                    <span className="metric-value">{statsResult.varianceSample}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Min / Max</span>
                    <span className="metric-value">{statsResult.min} / {statsResult.max}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">IQR (Q3 − Q1)</span>
                    <span className="metric-value">{statsResult.iqr}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Sum (Σx)</span>
                    <span className="metric-value">{statsResult.sum}</span>
                    <button type="button" className="btn-send-mini" onClick={() => onSendToCalculator?.(statsResult.sum)}>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Linear Regression Section */}
            <div className="stats-block regression-block">
              <div className="stats-block-header">
                <div className="stats-header-title">
                  <TrendingUp size={16} />
                  <span>Bivariate Linear Regression (X vs Y)</span>
                </div>
              </div>

              <div className="regression-inputs-duo">
                <div className="reg-input-group">
                  <label>X Coordinates (indep.)</label>
                  <input
                    type="text"
                    value={regXInput}
                    onChange={(e) => setRegXInput(e.target.value)}
                    placeholder="1, 2, 3, 4, 5..."
                  />
                </div>
                <div className="reg-input-group">
                  <label>Y Coordinates (dep.)</label>
                  <input
                    type="text"
                    value={regYInput}
                    onChange={(e) => setRegYInput(e.target.value)}
                    placeholder="2.5, 4.0, 6.8, 9.1..."
                  />
                </div>
              </div>

              {regressionResult && !regressionResult.error && (
                <div className="regression-results-box animate-fade-in">
                  <div className="reg-formula-banner">
                    <span className="formula-tag">Best Fit Line:</span>
                    <span className="formula-text">{regressionResult.eq}</span>
                  </div>

                  <div className="reg-stats-row">
                    <div className="reg-stat-pill">
                      <span>Slope (m):</span>
                      <strong>{regressionResult.slope}</strong>
                    </div>
                    <div className="reg-stat-pill">
                      <span>Intercept (c):</span>
                      <strong>{regressionResult.intercept}</strong>
                    </div>
                    <div className="reg-stat-pill">
                      <span>Pearson r:</span>
                      <strong>{regressionResult.r}</strong>
                    </div>
                    <div className="reg-stat-pill">
                      <span>R² (Fit):</span>
                      <strong>{regressionResult.r2}</strong>
                    </div>
                  </div>

                  {/* Prediction Tool */}
                  <div className="prediction-tool-row">
                    <span className="pred-label">Predict ŷ when X =</span>
                    <input
                      type="number"
                      className="pred-input"
                      value={predictX}
                      onChange={(e) => setPredictX(e.target.value)}
                    />
                    <ArrowRight size={16} className="pred-arrow" />
                    <span className="pred-result-tag">ŷ ≈ {regressionResult.predY}</span>
                    <button
                      type="button"
                      className="btn-send-mini"
                      onClick={() => onSendToCalculator?.(regressionResult.predY)}
                      title="Send predicted Y to main calculator"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
