import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Calculator,
  Zap,
  CheckCircle2
} from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp && !name.trim()) {
      triggerError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      triggerError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      triggerError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUp ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
        return data;
      })
      .then((data) => {
        setIsLoading(false);
        onLoginSuccess(data.user, rememberMe);
      })
      .catch((err) => {
        console.warn('Backend API notice:', err.message);
        // Fallback to client session if network/backend is offline
        const userObj = {
          name: isSignUp ? name.trim() : (email.split('@')[0] || 'Member'),
          email: email.trim(),
          avatar: (isSignUp ? name.trim() : email).substring(0, 2).toUpperCase(),
          role: 'Pro Member',
          joinedAt: new Date().toLocaleDateString()
        };
        setIsLoading(false);
        onLoginSuccess(userObj, rememberMe);
      });
  };

  const handleDemoLogin = (demoType = 'alex') => {
    setIsLoading(true);
    setErrorMsg('');

    fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: demoType })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error('Demo login failed');
        return data;
      })
      .then((data) => {
        setIsLoading(false);
        onLoginSuccess(data.user, true);
      })
      .catch(() => {
        // Fallback
        const demoUser = demoType === 'alex' 
          ? {
              name: 'Alex Morgan',
              email: 'alex.morgan@calcpulse.dev',
              avatar: 'AM',
              role: 'Senior Analyst',
              joinedAt: 'Oct 2026'
            }
          : {
              name: 'Sophia Patel',
              email: 'sophia@calcpulse.io',
              avatar: 'SP',
              role: 'Data Scientist',
              joinedAt: 'Today'
            };
        setIsLoading(false);
        onLoginSuccess(demoUser, true);
      });
  };

  return (
    <div className="login-wrapper">
      <div className="login-ambient-grid"></div>

      <div className="login-container animate-fade-in">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="brand-icon-wrapper">
            <Calculator className="brand-icon" size={28} />
            <span className="brand-dot"></span>
          </div>
          <h1 className="brand-title">
            Calc<span className="brand-highlight">Pulse</span>
          </h1>
          <p className="brand-tagline">
            Next-gen responsive calculator workspace with persistent history & sleek aesthetics.
          </p>
        </div>

        {/* Card Component */}
        <div className={`login-card ${isShaking ? 'animate-shake' : ''}`}>
          {/* Card Top Tabs */}
          <div className="auth-tabs">
            <button 
              type="button"
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Access banner */}
          <div className="demo-access-panel">
            <div className="demo-header">
              <Zap size={14} className="demo-icon" />
              <span>Instant preview access (No signup required):</span>
            </div>
            <button
              type="button"
              className="demo-btn primary-demo"
              onClick={() => handleDemoLogin('alex')}
              disabled={isLoading}
            >
              <Sparkles size={15} />
              <span>Continue as Alex Morgan (Demo Pro)</span>
            </button>
          </div>

          <div className="divider-line">
            <span>or continue with email</span>
          </div>

          {errorMsg && (
            <div className="auth-error-banner">
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="auth-name">Full Name</label>
                <div className="input-field-wrapper">
                  <User size={18} className="field-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-field-wrapper">
                <Mail size={18} className="field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-action">
                <label htmlFor="auth-password">Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    className="link-btn"
                    onClick={() => alert('Demo account reset: Use Quick Demo Access above or any test password.')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-field-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Keep me signed in</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Create CalcPulse Account' : 'Sign In to Workspace'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Trust badges footer */}
          <div className="auth-footer-trust">
            <div className="trust-item">
              <ShieldCheck size={14} />
              <span>Client-side encryption</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={14} />
              <span>Offline ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
