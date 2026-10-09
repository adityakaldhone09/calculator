import React, { useState, useId } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  ArrowRight, 
  Percent, 
  Calendar, 
  Users, 
  RotateCcw,
  Sparkles,
  PieChart
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './FinancialCalculator.css';

export default function FinancialCalculator({
  soundEnabled,
  onNotify,
  onSendToCalculator
}) {
  const [activeTool, setActiveTool] = useState('emi'); // 'emi' | 'compound' | 'tip'

  // --- EMI / Loan State ---
  const [loanPrincipal, setLoanPrincipal] = useState('250000');
  const [loanRate, setLoanRate] = useState('5.5');
  const [loanTenure, setLoanTenure] = useState('20');
  const [tenureUnit, setTenureUnit] = useState('years'); // 'years' | 'months'

  // --- Compound Interest / SIP State ---
  const [initDeposit, setInitDeposit] = useState('10000');
  const [monthlyDeposit, setMonthlyDeposit] = useState('500');
  const [compoundRate, setCompoundRate] = useState('8.5');
  const [compoundYears, setCompoundYears] = useState('15');
  const [compoundFreq, setCompoundFreq] = useState('12'); // 12=monthly, 4=quarterly, 1=annually

  // --- Tip & Splitter State ---
  const [billAmount, setBillAmount] = useState('120.00');
  const [tipPercent, setTipPercent] = useState('18');
  const [customTip, setCustomTip] = useState('');
  const [partySize, setPartySize] = useState(4);

  const loanPrincipalId = useId();
  const loanRateId = useId();
  const loanTenureId = useId();
  const initDepositId = useId();
  const monthlyDepositId = useId();
  const compoundRateId = useId();
  const compoundYearsId = useId();
  const billAmountId = useId();

  const handleSound = (type = 'default') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  };

  // --- Calculations ---

  // 1. EMI Calculation
  const calculateEMI = () => {
    const P = parseFloat(loanPrincipal) || 0;
    const annualR = parseFloat(loanRate) || 0;
    const tenureVal = parseFloat(loanTenure) || 0;
    const n = tenureUnit === 'years' ? tenureVal * 12 : tenureVal;

    if (P <= 0 || annualR <= 0 || n <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayable: P, principalRatio: 100, interestRatio: 0 };
    }

    const r = annualR / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;

    const pRatio = Math.max(0, Math.min(100, (P / totalPayable) * 100));
    const iRatio = 100 - pRatio;

    return {
      monthlyEmi: Number(emi.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      principalRatio: Number(pRatio.toFixed(1)),
      interestRatio: Number(iRatio.toFixed(1))
    };
  };

  // 2. Compound Interest / Wealth Growth
  const calculateCompound = () => {
    const P = parseFloat(initDeposit) || 0;
    const PMT = parseFloat(monthlyDeposit) || 0;
    const annualR = (parseFloat(compoundRate) || 0) / 100;
    const t = parseFloat(compoundYears) || 0;
    const n = parseFloat(compoundFreq) || 12; // compounding frequency per year

    if (t <= 0) {
      return { futureValue: P, totalInvested: P, totalInterest: 0, wealthRatio: 0 };
    }

    // Future value of initial lump sum: P * (1 + r/n)^(n*t)
    const lumpSumFV = P * Math.pow(1 + annualR / n, n * t);

    // Future value of monthly annuity: PMT * (((1 + r/n)^(n*t) - 1) / (r/n)) * (monthly adjustment)
    const monthlyRate = annualR / 12;
    const totalMonths = t * 12;
    let annuityFV = 0;
    if (monthlyRate > 0) {
      annuityFV = PMT * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else {
      annuityFV = PMT * totalMonths;
    }

    const futureValue = lumpSumFV + annuityFV;
    const totalInvested = P + (PMT * totalMonths);
    const totalInterest = Math.max(0, futureValue - totalInvested);
    const wealthRatio = totalInvested > 0 ? (totalInterest / futureValue) * 100 : 0;

    return {
      futureValue: Number(futureValue.toFixed(2)),
      totalInvested: Number(totalInvested.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      wealthRatio: Number(wealthRatio.toFixed(1))
    };
  };

  // 3. Tip & Splitter
  const calculateTip = () => {
    const bill = parseFloat(billAmount) || 0;
    const effectiveTipPercent = customTip !== '' ? (parseFloat(customTip) || 0) : (parseFloat(tipPercent) || 0);
    const tipAmount = (bill * effectiveTipPercent) / 100;
    const totalBill = bill + tipAmount;
    const people = Math.max(1, partySize);

    return {
      tipAmount: Number(tipAmount.toFixed(2)),
      totalBill: Number(totalBill.toFixed(2)),
      perPersonBill: Number((bill / people).toFixed(2)),
      perPersonTip: Number((tipAmount / people).toFixed(2)),
      perPersonTotal: Number((totalBill / people).toFixed(2))
    };
  };

  const emiData = calculateEMI();
  const compoundData = calculateCompound();
  const tipData = calculateTip();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleSendVal = (val, label) => {
    handleSound('operator');
    onSendToCalculator?.(String(val));
    onNotify?.(`Transferred ${label} (${val}) to Calculator!`, 'success');
  };

  return (
    <div className="financial-workspace animate-fade-in">
      <div className="financial-card">
        {/* Workspace Header */}
        <div className="fin-header">
          <div className="fin-title-group">
            <h2 className="fin-title">
              <span className="fin-icon-box"><DollarSign size={20} /></span>
              <span>Financial & Investment Suite</span>
            </h2>
            <p className="fin-subtitle">Real-time loans, wealth projections, and bill management</p>
          </div>

          {/* Tool Navigation Switcher */}
          <div className="fin-nav-tabs">
            <button
              type="button"
              className={`fin-tab-btn ${activeTool === 'emi' ? 'active' : ''}`}
              onClick={() => { handleSound('digit'); setActiveTool('emi'); }}
            >
              <PieChart size={15} />
              <span>Loan & EMI</span>
            </button>
            <button
              type="button"
              className={`fin-tab-btn ${activeTool === 'compound' ? 'active' : ''}`}
              onClick={() => { handleSound('digit'); setActiveTool('compound'); }}
            >
              <TrendingUp size={15} />
              <span>Wealth & SIP</span>
            </button>
            <button
              type="button"
              className={`fin-tab-btn ${activeTool === 'tip' ? 'active' : ''}`}
              onClick={() => { handleSound('digit'); setActiveTool('tip'); }}
            >
              <Receipt size={15} />
              <span>Tip & Split</span>
            </button>
          </div>
        </div>

        {/* 1. LOAN & EMI CALCULATOR */}
        {activeTool === 'emi' && (
          <div className="fin-tool-content animate-fade-in">
            {/* Quick Presets */}
            <div className="fin-presets-bar">
              <span className="presets-label"><Sparkles size={13} /> Quick Presets:</span>
              <button
                type="button"
                className="preset-pill"
                onClick={() => {
                  setLoanPrincipal('35000');
                  setLoanRate('6.5');
                  setLoanTenure('5');
                  setTenureUnit('years');
                  handleSound('digit');
                }}
              >
                🚗 Auto Loan (5y • 6.5%)
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => {
                  setLoanPrincipal('400000');
                  setLoanRate('4.5');
                  setLoanTenure('30');
                  setTenureUnit('years');
                  handleSound('digit');
                }}
              >
                🏡 30-Yr Home Mortgage
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => {
                  setLoanPrincipal('15000');
                  setLoanRate('11.0');
                  setLoanTenure('3');
                  setTenureUnit('years');
                  handleSound('digit');
                }}
              >
                💳 Personal (3y • 11%)
              </button>
            </div>

            <div className="fin-grid-layout">
              {/* Inputs Form */}
              <div className="fin-inputs-column">
                <div className="fin-input-group">
                  <label htmlFor={loanPrincipalId} className="fin-label">Loan Principal Amount</label>
                  <div className="fin-input-wrapper">
                    <span className="input-affix">$</span>
                    <input
                      id={loanPrincipalId}
                      type="number"
                      min="100"
                      step="500"
                      className="fin-input"
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(e.target.value)}
                    />
                  </div>
                </div>

                <div className="fin-input-group">
                  <label htmlFor={loanRateId} className="fin-label">Annual Interest Rate (%)</label>
                  <div className="fin-input-wrapper">
                    <input
                      id={loanRateId}
                      type="number"
                      min="0.1"
                      max="40"
                      step="0.1"
                      className="fin-input"
                      value={loanRate}
                      onChange={(e) => setLoanRate(e.target.value)}
                    />
                    <span className="input-affix">%</span>
                  </div>
                </div>

                <div className="fin-input-group">
                  <div className="label-with-toggle">
                    <label htmlFor={loanTenureId} className="fin-label">Loan Tenure</label>
                    <div className="unit-toggle-pill">
                      <button
                        type="button"
                        className={`unit-toggle-btn ${tenureUnit === 'years' ? 'active' : ''}`}
                        onClick={() => { setTenureUnit('years'); handleSound('digit'); }}
                      >
                        Years
                      </button>
                      <button
                        type="button"
                        className={`unit-toggle-btn ${tenureUnit === 'months' ? 'active' : ''}`}
                        onClick={() => { setTenureUnit('months'); handleSound('digit'); }}
                      >
                        Months
                      </button>
                    </div>
                  </div>
                  <div className="fin-input-wrapper">
                    <input
                      id={loanTenureId}
                      type="number"
                      min="1"
                      step="1"
                      className="fin-input"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(e.target.value)}
                    />
                    <span className="input-affix"><Calendar size={15} /></span>
                  </div>
                </div>
              </div>

              {/* Live Output Card */}
              <div className="fin-results-card">
                <div className="result-hero-box">
                  <span className="result-hero-label">Monthly EMI Payment</span>
                  <div className="result-hero-value">{formatCurrency(emiData.monthlyEmi)}</div>
                  <button
                    type="button"
                    className="send-calc-btn"
                    onClick={() => handleSendVal(emiData.monthlyEmi, 'Monthly EMI')}
                    title="Transfer Monthly EMI to Calculator"
                  >
                    <span>Send to Calculator</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Progress Visualizer Ratio */}
                <div className="ratio-bar-section">
                  <div className="ratio-bar-labels">
                    <span className="p-label">Principal: {emiData.principalRatio}%</span>
                    <span className="i-label">Interest: {emiData.interestRatio}%</span>
                  </div>
                  <div className="ratio-progress-bar">
                    <div className="bar-segment principal-bar" style={{ width: `${emiData.principalRatio}%` }} />
                    <div className="bar-segment interest-bar" style={{ width: `${emiData.interestRatio}%` }} />
                  </div>
                </div>

                <div className="result-breakdown-list">
                  <div className="breakdown-row">
                    <span className="bd-label">Total Principal:</span>
                    <span className="bd-val">{formatCurrency(parseFloat(loanPrincipal) || 0)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="bd-label">Total Interest Payable:</span>
                    <span className="bd-val highlight-interest">{formatCurrency(emiData.totalInterest)}</span>
                  </div>
                  <div className="breakdown-row total-row">
                    <span className="bd-label">Total Amount Payable:</span>
                    <span className="bd-val">{formatCurrency(emiData.totalPayable)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. COMPOUND INTEREST & WEALTH SIP */}
        {activeTool === 'compound' && (
          <div className="fin-tool-content animate-fade-in">
            <div className="fin-presets-bar">
              <span className="presets-label"><Sparkles size={13} /> Wealth Presets:</span>
              <button
                type="button"
                className="preset-pill"
                onClick={() => {
                  setInitDeposit('5000');
                  setMonthlyDeposit('350');
                  setCompoundRate('10');
                  setCompoundYears('20');
                  handleSound('digit');
                }}
              >
                🚀 S&P Index SIP (10% • 20y)
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => {
                  setInitDeposit('25000');
                  setMonthlyDeposit('100');
                  setCompoundRate('4.8');
                  setCompoundYears('5');
                  handleSound('digit');
                }}
              >
                🏦 High-Yield Savings (4.8%)
              </button>
            </div>

            <div className="fin-grid-layout">
              <div className="fin-inputs-column">
                <div className="fin-input-group">
                  <label htmlFor={initDepositId} className="fin-label">Initial Deposit ($)</label>
                  <div className="fin-input-wrapper">
                    <span className="input-affix">$</span>
                    <input
                      id={initDepositId}
                      type="number"
                      step="500"
                      className="fin-input"
                      value={initDeposit}
                      onChange={(e) => setInitDeposit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="fin-input-group">
                  <label htmlFor={monthlyDepositId} className="fin-label">Monthly Contribution ($)</label>
                  <div className="fin-input-wrapper">
                    <span className="input-affix">$</span>
                    <input
                      id={monthlyDepositId}
                      type="number"
                      step="50"
                      className="fin-input"
                      value={monthlyDeposit}
                      onChange={(e) => setMonthlyDeposit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="fin-input-row">
                  <div className="fin-input-group">
                    <label htmlFor={compoundRateId} className="fin-label">Annual Return (%)</label>
                    <div className="fin-input-wrapper">
                      <input
                        id={compoundRateId}
                        type="number"
                        step="0.1"
                        className="fin-input"
                        value={compoundRate}
                        onChange={(e) => setCompoundRate(e.target.value)}
                      />
                      <span className="input-affix">%</span>
                    </div>
                  </div>

                  <div className="fin-input-group">
                    <label htmlFor={compoundYearsId} className="fin-label">Time Horizon (Years)</label>
                    <div className="fin-input-wrapper">
                      <input
                        id={compoundYearsId}
                        type="number"
                        min="1"
                        max="60"
                        className="fin-input"
                        value={compoundYears}
                        onChange={(e) => setCompoundYears(e.target.value)}
                      />
                      <span className="input-affix">Yrs</span>
                    </div>
                  </div>
                </div>

                <div className="fin-input-group">
                  <label className="fin-label">Compounding Frequency</label>
                  <div className="freq-selector-grid">
                    {[
                      { val: '12', label: 'Monthly' },
                      { val: '4', label: 'Quarterly' },
                      { val: '1', label: 'Annually' }
                    ].map((freq) => (
                      <button
                        key={freq.val}
                        type="button"
                        className={`freq-btn ${compoundFreq === freq.val ? 'active' : ''}`}
                        onClick={() => { setCompoundFreq(freq.val); handleSound('digit'); }}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compound Results */}
              <div className="fin-results-card">
                <div className="result-hero-box wealth-hero">
                  <span className="result-hero-label">Projected Future Wealth</span>
                  <div className="result-hero-value highlight-wealth">{formatCurrency(compoundData.futureValue)}</div>
                  <button
                    type="button"
                    className="send-calc-btn"
                    onClick={() => handleSendVal(compoundData.futureValue, 'Projected Wealth')}
                    title="Transfer Projected Wealth to Calculator"
                  >
                    <span>Send to Calculator</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="ratio-bar-section">
                  <div className="ratio-bar-labels">
                    <span className="p-label">Invested: {formatCurrency(compoundData.totalInvested)}</span>
                    <span className="w-label">Growth: +{compoundData.wealthRatio}%</span>
                  </div>
                  <div className="ratio-progress-bar">
                    <div className="bar-segment principal-bar" style={{ width: `${100 - compoundData.wealthRatio}%` }} />
                    <div className="bar-segment wealth-bar" style={{ width: `${compoundData.wealthRatio}%` }} />
                  </div>
                </div>

                <div className="result-breakdown-list">
                  <div className="breakdown-row">
                    <span className="bd-label">Total Principal Deposited:</span>
                    <span className="bd-val">{formatCurrency(compoundData.totalInvested)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="bd-label">Total Compound Growth Earned:</span>
                    <span className="bd-val highlight-wealth">+{formatCurrency(compoundData.totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TIP & BILL SPLITTER */}
        {activeTool === 'tip' && (
          <div className="fin-tool-content animate-fade-in">
            <div className="fin-grid-layout">
              <div className="fin-inputs-column">
                <div className="fin-input-group">
                  <label htmlFor={billAmountId} className="fin-label">Bill Subtotal ($)</label>
                  <div className="fin-input-wrapper">
                    <span className="input-affix">$</span>
                    <input
                      id={billAmountId}
                      type="number"
                      step="1"
                      className="fin-input"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tip Percentage Selection */}
                <div className="fin-input-group">
                  <label className="fin-label">Tip Percentage</label>
                  <div className="tip-pills-row">
                    {['10', '15', '18', '20', '25'].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        className={`tip-btn ${tipPercent === pct && customTip === '' ? 'active' : ''}`}
                        onClick={() => {
                          setTipPercent(pct);
                          setCustomTip('');
                          handleSound('digit');
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                    <div className="custom-tip-box">
                      <input
                        type="number"
                        placeholder="Custom"
                        className={`custom-tip-input ${customTip !== '' ? 'active' : ''}`}
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                      />
                      <span className="custom-pct-sym">%</span>
                    </div>
                  </div>
                </div>

                {/* Party Size Stepper */}
                <div className="fin-input-group">
                  <label className="fin-label">Number of People</label>
                  <div className="party-stepper-box">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => {
                        setPartySize(Math.max(1, partySize - 1));
                        handleSound('digit');
                      }}
                    >
                      -
                    </button>
                    <div className="party-val-display">
                      <Users size={16} />
                      <span>{partySize} {partySize === 1 ? 'Person' : 'People'}</span>
                    </div>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => {
                        setPartySize(partySize + 1);
                        handleSound('digit');
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Tip Results */}
              <div className="fin-results-card">
                <div className="result-hero-box tip-hero">
                  <span className="result-hero-label">Total Per Person</span>
                  <div className="result-hero-value">{formatCurrency(tipData.perPersonTotal)}</div>
                  <button
                    type="button"
                    className="send-calc-btn"
                    onClick={() => handleSendVal(tipData.perPersonTotal, 'Split Per Person')}
                    title="Transfer Per Person Total to Calculator"
                  >
                    <span>Send to Calculator</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="result-breakdown-list">
                  <div className="breakdown-row">
                    <span className="bd-label">Tip Amount Per Person:</span>
                    <span className="bd-val">{formatCurrency(tipData.perPersonTip)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="bd-label">Base Bill Per Person:</span>
                    <span className="bd-val">{formatCurrency(tipData.perPersonBill)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="bd-label">Total Tip (Entire Table):</span>
                    <span className="bd-val highlight-interest">{formatCurrency(tipData.tipAmount)}</span>
                  </div>
                  <div className="breakdown-row total-row">
                    <span className="bd-label">Grand Total Bill:</span>
                    <span className="bd-val">{formatCurrency(tipData.totalBill)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
