import React, { useState, useId } from 'react';
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Calculator, 
  Coins, 
  Ruler, 
  Scale, 
  Thermometer, 
  HardDrive, 
  Clock 
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './UnitConverter.css';

const CONVERTER_CATEGORIES = [
  { id: 'currency', name: 'Currency', icon: Coins },
  { id: 'length', name: 'Length', icon: Ruler },
  { id: 'weight', name: 'Weight', icon: Scale },
  { id: 'temperature', name: 'Temp', icon: Thermometer },
  { id: 'storage', name: 'Storage', icon: HardDrive },
  { id: 'time', name: 'Time', icon: Clock }
];

const UNIT_CONFIGS = {
  currency: {
    base: 'USD',
    units: [
      { id: 'USD', name: 'USD — US Dollar', symbol: '$', rate: 1.0 },
      { id: 'EUR', name: 'EUR — Euro', symbol: '€', rate: 0.92 },
      { id: 'GBP', name: 'GBP — British Pound', symbol: '£', rate: 0.79 },
      { id: 'JPY', name: 'JPY — Japanese Yen', symbol: '¥', rate: 154.6 },
      { id: 'INR', name: 'INR — Indian Rupee', symbol: '₹', rate: 86.8 },
      { id: 'CAD', name: 'CAD — Canadian Dollar', symbol: 'CA$', rate: 1.38 },
      { id: 'AUD', name: 'AUD — Australian Dollar', symbol: 'A$', rate: 1.55 },
      { id: 'CHF', name: 'CHF — Swiss Franc', symbol: 'CHF', rate: 0.88 },
      { id: 'CNY', name: 'CNY — Chinese Yuan', symbol: '¥', rate: 7.24 }
    ]
  },
  length: {
    base: 'm',
    units: [
      { id: 'km', name: 'Kilometers (km)', symbol: 'km', toBase: 1000 },
      { id: 'm', name: 'Meters (m)', symbol: 'm', toBase: 1 },
      { id: 'cm', name: 'Centimeters (cm)', symbol: 'cm', toBase: 0.01 },
      { id: 'mm', name: 'Millimeters (mm)', symbol: 'mm', toBase: 0.001 },
      { id: 'mi', name: 'Miles (mi)', symbol: 'mi', toBase: 1609.344 },
      { id: 'yd', name: 'Yards (yd)', symbol: 'yd', toBase: 0.9144 },
      { id: 'ft', name: 'Feet (ft)', symbol: 'ft', toBase: 0.3048 },
      { id: 'in', name: 'Inches (in)', symbol: 'in', toBase: 0.0254 }
    ]
  },
  weight: {
    base: 'kg',
    units: [
      { id: 't', name: 'Metric Tons (t)', symbol: 't', toBase: 1000 },
      { id: 'kg', name: 'Kilograms (kg)', symbol: 'kg', toBase: 1 },
      { id: 'g', name: 'Grams (g)', symbol: 'g', toBase: 0.001 },
      { id: 'mg', name: 'Milligrams (mg)', symbol: 'mg', toBase: 0.000001 },
      { id: 'lb', name: 'Pounds (lb)', symbol: 'lb', toBase: 0.45359237 },
      { id: 'oz', name: 'Ounces (oz)', symbol: 'oz', toBase: 0.02834952 }
    ]
  },
  temperature: {
    units: [
      { id: 'c', name: 'Celsius (°C)', symbol: '°C' },
      { id: 'f', name: 'Fahrenheit (°F)', symbol: '°F' },
      { id: 'k', name: 'Kelvin (K)', symbol: 'K' }
    ]
  },
  storage: {
    base: 'MB',
    units: [
      { id: 'B', name: 'Bytes (B)', symbol: 'B', toBase: 1 / (1024 * 1024) },
      { id: 'KB', name: 'Kilobytes (KB)', symbol: 'KB', toBase: 1 / 1024 },
      { id: 'MB', name: 'Megabytes (MB)', symbol: 'MB', toBase: 1 },
      { id: 'GB', name: 'Gigabytes (GB)', symbol: 'GB', toBase: 1024 },
      { id: 'TB', name: 'Terabytes (TB)', symbol: 'TB', toBase: 1024 * 1024 },
      { id: 'PB', name: 'Petabytes (PB)', symbol: 'PB', toBase: 1024 * 1024 * 1024 }
    ]
  },
  time: {
    base: 's',
    units: [
      { id: 'ms', name: 'Milliseconds (ms)', symbol: 'ms', toBase: 0.001 },
      { id: 's', name: 'Seconds (s)', symbol: 's', toBase: 1 },
      { id: 'min', name: 'Minutes (min)', symbol: 'min', toBase: 60 },
      { id: 'hr', name: 'Hours (hr)', symbol: 'hr', toBase: 3600 },
      { id: 'day', name: 'Days (d)', symbol: 'd', toBase: 86400 },
      { id: 'wk', name: 'Weeks (wk)', symbol: 'wk', toBase: 604800 }
    ]
  }
};

export default function UnitConverter({ onSendToCalculator, soundEnabled, onNotify }) {
  const [activeCategory, setActiveCategory] = useState('currency');
  const [inputValue, setInputValue] = useState('100');
  const [fromUnit, setFromUnit] = useState('USD');
  const [toUnit, setToUnit] = useState('EUR');
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const inputId = useId();
  const fromSelectId = useId();
  const toSelectId = useId();

  const handleCategoryChange = (catId) => {
    if (soundEnabled) playKeyClick('digit');
    setActiveCategory(catId);
    const units = UNIT_CONFIGS[catId].units;
    setFromUnit(units[0].id);
    setToUnit(units[1] ? units[1].id : units[0].id);
  };

  const handleSwap = () => {
    if (soundEnabled) playKeyClick('operator');
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Conversion computation
  const computeConversion = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '0';

    if (activeCategory === 'temperature') {
      if (fromUnit === toUnit) return String(val);
      let celsius = val;
      if (fromUnit === 'f') celsius = ((val - 32) * 5) / 9;
      if (fromUnit === 'k') celsius = val - 273.15;

      let result = celsius;
      if (toUnit === 'f') result = (celsius * 9) / 5 + 32;
      if (toUnit === 'k') result = celsius + 273.15;

      return Number(result.toFixed(6)).toString();
    }

    if (activeCategory === 'currency') {
      const units = UNIT_CONFIGS.currency.units;
      const uFrom = units.find((u) => u.id === fromUnit);
      const uTo = units.find((u) => u.id === toUnit);
      if (!uFrom || !uTo) return '0';

      // USD is base: val in USD = val / uFrom.rate
      const inUSD = val / uFrom.rate;
      const converted = inUSD * uTo.rate;
      return Number(converted.toFixed(4)).toString();
    }

    // Standard linear conversions
    const config = UNIT_CONFIGS[activeCategory];
    const uFrom = config.units.find((u) => u.id === fromUnit);
    const uTo = config.units.find((u) => u.id === toUnit);
    if (!uFrom || !uTo) return '0';

    const inBase = val * uFrom.toBase;
    const result = inBase / uTo.toBase;
    return Number(result.toFixed(8)).toString();
  };

  const convertedValue = computeConversion();

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedValue);
    setCopied(true);
    if (soundEnabled) playKeyClick('equals');
    onNotify?.(`Copied ${convertedValue} ${toUnit} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 1600);
  };

  const handleSend = () => {
    if (soundEnabled) playKeyClick('equals');
    onSendToCalculator?.(convertedValue);
    onNotify?.(`Sent ${convertedValue} to Calculator display!`, 'success');
  };

  const currentUnits = UNIT_CONFIGS[activeCategory]?.units || [];

  return (
    <div className="converter-card animate-fade-in">
      {/* Category selector pills */}
      <div className="converter-categories-bar">
        {CONVERTER_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`cat-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <IconComponent size={14} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Converter Grid */}
      <div className="converter-body">
        {/* Input Side (FROM) */}
        <div className="converter-input-box">
          <label htmlFor={fromSelectId} className="converter-label">From Unit</label>
          <div className="converter-select-wrapper">
            <select
              id={fromSelectId}
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                if (soundEnabled) playKeyClick('digit');
              }}
              className="converter-select"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <label htmlFor={inputId} className="converter-label mt-2">Value to Convert</label>
          <div className="converter-num-input-wrapper">
            <input
              id={inputId}
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0"
              className="converter-num-input"
            />
            <span className="unit-symbol-badge">{fromUnit}</span>
          </div>
        </div>

        {/* Swap Control */}
        <div className="converter-swap-wrapper">
          <button
            type="button"
            className={`swap-btn ${isSwapping ? 'spinning' : ''}`}
            onClick={handleSwap}
            title="Swap source and target units"
            aria-label="Swap units"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* Output Side (TO) */}
        <div className="converter-output-box">
          <label htmlFor={toSelectId} className="converter-label">To Unit</label>
          <div className="converter-select-wrapper">
            <select
              id={toSelectId}
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                if (soundEnabled) playKeyClick('digit');
              }}
              className="converter-select"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <span className="converter-label mt-2">Converted Result</span>
          <div className="converter-result-panel">
            <div className="result-val-display" title={convertedValue}>
              {convertedValue}
            </div>
            <span className="unit-symbol-badge target">{toUnit}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="converter-actions-footer">
        <div className="conversion-ratio-badge">
          <span>1 {fromUnit} ≈ {(parseFloat(convertedValue) / (parseFloat(inputValue) || 1)).toFixed(4)} {toUnit}</span>
        </div>

        <div className="converter-btn-group">
          <button
            type="button"
            className={`converter-action-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy converted value"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="converter-action-btn send-btn"
            onClick={handleSend}
            title="Send converted result to calculator keypad"
          >
            <Calculator size={16} />
            <span>Send to Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
}
