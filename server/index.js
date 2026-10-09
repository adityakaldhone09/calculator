import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory data store for development & demonstrations
const users = [
  {
    id: 'user_alex',
    email: 'alex.morgan@calcpulse.dev',
    name: 'Alex Morgan',
    role: 'Senior Analyst',
    avatar: 'AM',
    password: 'password123'
  }
];

const calculationHistory = [
  {
    id: 'hist_demo_1',
    userId: 'user_alex',
    expression: '125 × 4.5',
    result: '562.5',
    timestamp: '10:45:12 AM'
  },
  {
    id: 'hist_demo_2',
    userId: 'user_alex',
    expression: '√(144) + 28',
    result: '40',
    timestamp: '10:50:30 AM'
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CalcPulse Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Demo Login
app.post('/api/auth/demo', (req, res) => {
  const { persona = 'alex' } = req.body;
  const user = persona === 'sophia'
    ? {
        id: 'user_sophia',
        name: 'Sophia Patel',
        email: 'sophia@calcpulse.io',
        avatar: 'SP',
        role: 'Data Scientist',
        token: `token_${Date.now()}`
      }
    : {
        id: 'user_alex',
        name: 'Alex Morgan',
        email: 'alex.morgan@calcpulse.dev',
        avatar: 'AM',
        role: 'Senior Analyst',
        token: `token_${Date.now()}`
      };

  return res.json({
    success: true,
    user,
    message: `Logged in as ${user.name}`
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (existing) {
    return res.json({
      success: true,
      user: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        avatar: existing.avatar,
        role: existing.role,
        token: `token_${Date.now()}`
      }
    });
  }

  // Allow flexible login for demonstration if credentials provided
  const newUser = {
    id: `user_${Date.now()}`,
    name: email.split('@')[0],
    email,
    avatar: email.substring(0, 2).toUpperCase(),
    role: 'Pro Member',
    token: `token_${Date.now()}`
  };

  users.push({ ...newUser, password });

  return res.json({
    success: true,
    user: newUser,
    message: 'Welcome to CalcPulse!'
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    avatar: name.trim().substring(0, 2).toUpperCase(),
    role: 'Pro Member',
    token: `token_${Date.now()}`
  };

  users.push({ ...newUser, password });

  return res.status(201).json({
    success: true,
    user: newUser,
    message: 'Account created successfully!'
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
  const { expression, result, timestamp, userId = 'user_alex' } = req.body;

  if (!expression || !result) {
    return res.status(400).json({ error: 'Expression and result are required' });
  }

  const entry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    expression,
    result,
    timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
  const { principal = 0, annualRate = 0, tenureMonths = 12 } = req.body;
  const P = parseFloat(principal);
  const r = (parseFloat(annualRate) / 12) / 100;
  const n = parseFloat(tenureMonths);

  if (P <= 0 || r <= 0 || n <= 0) {
    return res.status(400).json({ error: 'Valid principal, annualRate, and tenureMonths are required' });
  }

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - P;

  res.json({
    success: true,
    monthlyEmi: Number(emi.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    principalRatio: Number(((P / totalPayable) * 100).toFixed(1)),
    interestRatio: Number(((totalInterest / totalPayable) * 100).toFixed(1))
  });
});

// Financial: Compound Interest / SIP API
app.post('/api/financial/compound', (req, res) => {
  const { initialDeposit = 0, monthlyDeposit = 0, annualRate = 0, years = 1, frequency = 12 } = req.body;
  const P = parseFloat(initialDeposit);
  const PMT = parseFloat(monthlyDeposit);
  const r = parseFloat(annualRate) / 100;
  const t = parseFloat(years);
  const n = parseFloat(frequency) || 12;

  const lumpSumFV = P * Math.pow(1 + r / n, n * t);
  const monthlyRate = r / 12;
  const totalMonths = t * 12;
  const annuityFV = monthlyRate > 0 
    ? PMT * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
    : PMT * totalMonths;

  const futureValue = lumpSumFV + annuityFV;
  const totalInvested = P + (PMT * totalMonths);
  const totalInterest = Math.max(0, futureValue - totalInvested);

  res.json({
    success: true,
    futureValue: Number(futureValue.toFixed(2)),
    totalInvested: Number(totalInvested.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    wealthRatio: totalInvested > 0 ? Number(((totalInterest / futureValue) * 100).toFixed(1)) : 0
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CalcPulse Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
});
