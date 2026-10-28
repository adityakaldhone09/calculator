import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const HOST = '0.0.0.0';

// Configurable CORS: allow all or explicit origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

// Request body size limit
app.use(express.json({ limit: '100kb' }));

// In-memory calculation history store
const calculationHistory = [
  {
    id: 'hist_demo_1',
    expression: '125 × 4.5',
    result: '562.5',
    timestamp: '10:45:12 AM'
  },
  {
    id: 'hist_demo_2',
    expression: '√(144) + 28',
    result: '40',
    timestamp: '10:50:30 AM'
  }
];

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'calcpulse',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get calculation history
app.get('/api/history', (req, res) => {
  res.json({
    success: true,
    history: calculationHistory
  });
});

// Add calculation entry
app.post('/api/history', (req, res) => {
  const { expression, result, timestamp, id } = req.body || {};

  if (
    typeof expression !== 'string' ||
    typeof result !== 'string' ||
    expression.trim().length === 0 ||
    result.trim().length === 0
  ) {
    return res.status(400).json({ error: 'Valid expression and result strings are required' });
  }

  if (expression.length > 500 || result.length > 500) {
    return res.status(400).json({ error: 'Expression and result must be 500 characters or fewer' });
  }

  const entry = {
    id: (typeof id === 'string' && id.trim().length > 0 && id.length <= 100)
      ? id.trim()
      : `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    expression: expression.trim(),
    result: result.trim(),
    timestamp: (typeof timestamp === 'string' && timestamp.trim().length > 0)
      ? timestamp.trim()
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  calculationHistory.unshift(entry);
  if (calculationHistory.length > 50) calculationHistory.pop();

  res.status(201).json({
    success: true,
    entry
  });
});

// Delete single calculation entry
app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  const index = calculationHistory.findIndex((h) => h.id === id);
  if (index !== -1) {
    calculationHistory.splice(index, 1);
    return res.json({ success: true, message: 'Calculation entry deleted', id });
  }
  return res.status(404).json({ error: 'Calculation entry not found' });
});

// Clear calculation history
app.delete('/api/history', (req, res) => {
  calculationHistory.length = 0;
  res.json({
    success: true,
    message: 'History cleared'
  });
});

// Unit & Currency Conversion rates
app.get('/api/converter/rates', (req, res) => {
  res.json({
    success: true,
    base: 'USD',
    updatedAt: new Date().toISOString(),
    rates: {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 154.6,
      INR: 86.8,
      CAD: 1.38,
      AUD: 1.55,
      CHF: 0.88,
      CNY: 7.24
    }
  });
});

// Financial: Loan & EMI Calculator API
app.post('/api/financial/emi', (req, res) => {
  const { principal = 0, annualRate = 0, tenureMonths = 12 } = req.body || {};
  const P = parseFloat(principal);
  const annual = parseFloat(annualRate);
  const n = parseFloat(tenureMonths);

  if (
    isNaN(P) || isNaN(annual) || isNaN(n) ||
    !Number.isFinite(P) || !Number.isFinite(annual) || !Number.isFinite(n) ||
    P <= 0 || annual < 0 || n <= 0
  ) {
    return res.status(400).json({ error: 'Valid positive principal, non-negative annualRate, and positive tenureMonths are required' });
  }

  let emi;
  let totalPayable;
  let totalInterest;

  if (annual === 0) {
    emi = P / n;
    totalPayable = P;
    totalInterest = 0;
  } else {
    const r = (annual / 12) / 100;
    const factor = Math.pow(1 + r, n);
    emi = (P * r * factor) / (factor - 1);
    totalPayable = emi * n;
    totalInterest = totalPayable - P;
  }

  if (!Number.isFinite(emi)) {
    return res.status(400).json({ error: 'Calculation resulted in non-finite values' });
  }

  res.json({
    success: true,
    monthlyEmi: Number(emi.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    principalRatio: totalPayable > 0 ? Number(((P / totalPayable) * 100).toFixed(1)) : 100,
    interestRatio: totalPayable > 0 ? Number(((totalInterest / totalPayable) * 100).toFixed(1)) : 0
  });
});

// Financial: Compound Interest / SIP API
app.post('/api/financial/compound', (req, res) => {
  const { initialDeposit = 0, monthlyDeposit = 0, annualRate = 0, years = 1, frequency = 12 } = req.body || {};
  const P = parseFloat(initialDeposit);
  const PMT = parseFloat(monthlyDeposit);
  const annual = parseFloat(annualRate);
  const t = parseFloat(years);
  const n = parseFloat(frequency) || 12;

  if (
    isNaN(P) || isNaN(PMT) || isNaN(annual) || isNaN(t) || isNaN(n) ||
    !Number.isFinite(P) || !Number.isFinite(PMT) || !Number.isFinite(annual) || !Number.isFinite(t) || !Number.isFinite(n) ||
    P < 0 || PMT < 0 || annual < 0 || t <= 0 || n <= 0
  ) {
    return res.status(400).json({ error: 'Valid non-negative deposits, non-negative annualRate, and positive duration are required' });
  }

  const r = annual / 100;
  const lumpSumFV = P * Math.pow(1 + r / n, n * t);
  const monthlyRate = r / 12;
  const totalMonths = t * 12;
  const annuityFV = monthlyRate > 0 
    ? PMT * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
    : PMT * totalMonths;

  const futureValue = lumpSumFV + annuityFV;
  const totalInvested = P + (PMT * totalMonths);
  const totalInterest = Math.max(0, futureValue - totalInvested);

  if (!Number.isFinite(futureValue)) {
    return res.status(400).json({ error: 'Calculation resulted in non-finite values' });
  }

  res.json({
    success: true,
    futureValue: Number(futureValue.toFixed(2)),
    totalInvested: Number(totalInvested.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    wealthRatio: futureValue > 0 ? Number(((totalInterest / futureValue) * 100).toFixed(1)) : 0
  });
});

// Matrix: Determinant & Trace API
app.post('/api/matrix/analyze', (req, res) => {
  const { matrix } = req.body || {};
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length === 0) {
    return res.status(400).json({ error: 'Valid 2D matrix array is required' });
  }
  const n = matrix.length;
  if (n > 10) {
    return res.status(400).json({ error: 'Matrix dimensions exceeds maximum allowed size (10x10)' });
  }
  const isSquare = matrix.every((r) => Array.isArray(r) && r.length === n && r.every((cell) => typeof cell === 'number' && Number.isFinite(cell)));
  if (!isSquare) {
    return res.status(400).json({ error: 'Matrix must be square and contain finite numbers' });
  }

  let tr = 0;
  for (let i = 0; i < n; i++) tr += matrix[i][i];

  let det = null;
  if (n === 1) {
    det = matrix[0][0];
  } else if (n === 2) {
    det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  } else if (n === 3) {
    det =
      matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
  } else {
    // Gaussian elimination for n > 3
    let d = 1;
    const m = matrix.map((row) => [...row]);
    let sign = 1;
    for (let i = 0; i < n; i++) {
      let pivot = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(m[j][i]) > Math.abs(m[pivot][i])) pivot = j;
      }
      if (Math.abs(m[pivot][i]) < 1e-12) {
        d = 0;
        break;
      }
      if (pivot !== i) {
        const tmp = m[i];
        m[i] = m[pivot];
        m[pivot] = tmp;
        sign = -sign;
      }
      d *= m[i][i];
      for (let j = i + 1; j < n; j++) {
        const factor = m[j][i] / m[i][i];
        for (let k = i; k < n; k++) {
          m[j][k] -= factor * m[i][k];
        }
      }
    }
    det = d * sign;
  }

  res.json({
    success: true,
    order: `${n}x${n}`,
    trace: Number(tr.toFixed(6)),
    determinant: det !== null ? Number(det.toFixed(6)) : null,
    isSingular: det !== null ? Math.abs(det) < 1e-12 : undefined
  });
});

// Equations: Quadratic Solver API
app.post('/api/equations/quadratic', (req, res) => {
  const { a = 1, b = 0, c = 0 } = req.body || {};
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  const numC = parseFloat(c);

  if (isNaN(numA) || isNaN(numB) || isNaN(numC) || !Number.isFinite(numA) || !Number.isFinite(numB) || !Number.isFinite(numC) || numA === 0) {
    return res.status(400).json({ error: 'Coefficient "a" must be a non-zero finite number, and "b" and "c" must be finite numbers' });
  }

  const disc = numB * numB - 4 * numA * numC;
  const vertex = {
    x: Number((-numB / (2 * numA)).toFixed(4)),
    y: Number((numC - (numB * numB) / (4 * numA)).toFixed(4))
  };

  if (Math.abs(disc) < 1e-12) {
    const r = -numB / (2 * numA);
    return res.json({
      success: true,
      discriminant: 0,
      type: 'repeated_real',
      roots: [Number(r.toFixed(4)), Number(r.toFixed(4))],
      vertex
    });
  } else if (disc > 0) {
    const sqrtDisc = Math.sqrt(disc);
    const r1 = (-numB + sqrtDisc) / (2 * numA);
    const r2 = (-numB - sqrtDisc) / (2 * numA);
    return res.json({
      success: true,
      discriminant: Number(disc.toFixed(4)),
      type: 'two_real',
      roots: [Number(r1.toFixed(4)), Number(r2.toFixed(4))],
      vertex
    });
  } else {
    const real = -numB / (2 * numA);
    const imag = Math.sqrt(-disc) / (2 * numA);
    return res.json({
      success: true,
      discriminant: Number(disc.toFixed(4)),
      type: 'complex_conjugate',
      roots: [
        `${real.toFixed(4)} + ${imag.toFixed(4)}i`,
        `${real.toFixed(4)} - ${imag.toFixed(4)}i`
      ],
      vertex
    });
  }
});

// 404 handler for unknown API endpoints (must precede static frontend fallback)
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl || req.path
  });
});

// Production static assets & SPA fallback
const distExists = fs.existsSync(distPath);

if (distExists) {
  app.use(express.static(distPath));

  // Static assets under /assets that are missing should return 404, not index.html
  app.use('/assets', (req, res) => {
    res.status(404).json({
      error: 'Asset not found',
      path: req.originalUrl || req.path
    });
  });

  // Client-side routing fallback: serve index.html for GET/HEAD requests
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'CalcPulse client build not found. Run "npm run build" to generate static assets.'
    });
  });
}

// Global error handling middleware (production-safe, no stack traces leaked)
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err.message);
  if (res.headersSent) return;
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Single app.listen() call with error handling and startup diagnostics
let server = null;
const isDirectRun = Boolean(process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]));

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, HOST, () => {
    console.log(`🚀 CalcPulse server listening on http://${HOST}:${PORT}`);
    console.log(`📡 Health endpoint: http://${HOST}:${PORT}/api/health`);
    console.log(`📁 Static assets: ${distExists ? `loaded from ${distPath}` : 'MISSING (run npm run build)'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another process.`);
    } else {
      console.error('❌ Server startup error:', err);
    }
    process.exit(1);
  });
}

export { app, server };
