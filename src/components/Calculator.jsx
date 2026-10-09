import React, { useState, useEffect, useCallback } from 'react';
import { 
  Delete, 
  Copy, 
  Check, 
  Sparkles
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import './Calculator.css';

export default function Calculator({ 
  onAddHistory, 
  soundEnabled, 
  onNotify,
  externalValue 
}) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [mode, setMode] = useState('standard'); // 'standard' | 'scientific'
  const [angleUnit, setAngleUnit] = useState('DEG'); // 'DEG' | 'RAD'
  const [memory, setMemory] = useState(0);
  const [isMemorySet, setIsMemorySet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);

  // Sync external value when user clicks an entry in the history drawer
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      setDisplay(String(externalValue));
      setWaitingForOperand(true);
    }
  }, [externalValue]);

  const triggerKeyEffect = useCallback((keyIdentifier) => {
    setPressedKey(keyIdentifier);
    setTimeout(() => setPressedKey(null), 120);
  }, []);

  const handleSound = useCallback((type = 'default') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  }, [soundEnabled]);

  // Memory functions
  const handleMemoryClear = () => {
    handleSound('clear');
    triggerKeyEffect('MC');
    setMemory(0);
    setIsMemorySet(false);
    onNotify?.('Memory cleared (MC)', 'info');
  };

  const handleMemoryRecall = () => {
    handleSound('memory');
    triggerKeyEffect('MR');
    setDisplay(String(memory));
    setWaitingForOperand(true);
    onNotify?.(`Recalled memory: ${memory}`, 'info');
  };

  const handleMemoryAdd = () => {
    handleSound('memory');
    triggerKeyEffect('M+');
    const val = parseFloat(display) || 0;
    const nextMem = Number((memory + val).toFixed(10));
    setMemory(nextMem);
    setIsMemorySet(true);
    setWaitingForOperand(true);
    onNotify?.(`Added to memory: +${val} (Total: ${nextMem})`, 'success');
  };

  const handleMemorySubtract = () => {
    handleSound('memory');
    triggerKeyEffect('M-');
    const val = parseFloat(display) || 0;
    const nextMem = Number((memory - val).toFixed(10));
    setMemory(nextMem);
    setIsMemorySet(true);
    setWaitingForOperand(true);
    onNotify?.(`Subtracted from memory: -${val} (Total: ${nextMem})`, 'info');
  };

  const handleMemoryStore = () => {
    handleSound('memory');
    triggerKeyEffect('MS');
    const val = parseFloat(display) || 0;
    setMemory(val);
    setIsMemorySet(true);
    setWaitingForOperand(true);
    onNotify?.(`Stored in memory: ${val}`, 'success');
  };

  // Input digit
  const inputDigit = useCallback((digit) => {
    handleSound('digit');
    triggerKeyEffect(digit);

    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  }, [display, waitingForOperand, handleSound, triggerKeyEffect]);

  // Input decimal
  const inputDecimal = useCallback(() => {
    handleSound('digit');
    triggerKeyEffect('.');

    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand, handleSound, triggerKeyEffect]);

  // Clear operations
  const clearAll = useCallback(() => {
    handleSound('clear');
    triggerKeyEffect('AC');
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, [handleSound, triggerKeyEffect]);

  const clearEntry = useCallback(() => {
    handleSound('clear');
    triggerKeyEffect('C');
    setDisplay('0');
  }, [handleSound, triggerKeyEffect]);

  // Backspace single character
  const handleBackspace = useCallback(() => {
    handleSound('digit');
    triggerKeyEffect('backspace');

    if (waitingForOperand) return;

    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, waitingForOperand, handleSound, triggerKeyEffect]);

  // Toggle plus / minus sign
  const toggleSign = useCallback(() => {
    handleSound('digit');
    triggerKeyEffect('+/-');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  }, [display, handleSound, triggerKeyEffect]);

  // Percentage
  const handlePercentage = useCallback(() => {
    handleSound('operator');
    triggerKeyEffect('%');
    const current = parseFloat(display);
    if (isNaN(current)) return;

    let res;
    if (prevValue !== null && operator) {
      res = (prevValue * current) / 100;
    } else {
      res = current / 100;
    }
    
    // Trim floating precision
    const rounded = Number(res.toFixed(10)).toString();
    setDisplay(rounded);
    setWaitingForOperand(true);
  }, [display, prevValue, operator, handleSound, triggerKeyEffect]);

  // Execute binary operation computation
  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×':
      case '*': return a * b;
      case '÷':
      case '/': return b === 0 ? 'Error: Div by 0' : a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  // Perform binary operator
  const handleOperator = useCallback((nextOp) => {
    handleSound('operator');
    triggerKeyEffect(nextOp);

    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setExpression(`${inputValue} ${nextOp} `);
    } else if (operator) {
      if (waitingForOperand) {
        setOperator(nextOp);
        setExpression(`${prevValue} ${nextOp} `);
        return;
      }

      const result = calculate(prevValue, inputValue, operator);
      if (typeof result === 'string' && result.startsWith('Error')) {
        setDisplay(result);
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        return;
      }

      const cleanResult = Number(result.toFixed(10));
      setDisplay(String(cleanResult));
      setPrevValue(cleanResult);
      setExpression(`${cleanResult} ${nextOp} `);
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  }, [display, prevValue, operator, waitingForOperand, handleSound, triggerKeyEffect]);

  // Equals (=) execution
  const handleEquals = useCallback(() => {
    if (!operator || prevValue === null) return;

    handleSound('equals');
    triggerKeyEffect('=');

    const inputValue = parseFloat(display);
    const result = calculate(prevValue, inputValue, operator);

    if (typeof result === 'string' && result.startsWith('Error')) {
      setDisplay(result);
      setExpression(`${prevValue} ${operator} ${inputValue} =`);
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      return;
    }

    const cleanResult = Number(result.toFixed(10));
    const fullExpr = `${prevValue} ${operator} ${inputValue}`;
    
    setDisplay(String(cleanResult));
    setExpression(`${fullExpr} =`);
    setLastResult(cleanResult);

    // Save to calculation history
    onAddHistory?.({
      expression: fullExpr,
      result: String(cleanResult),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [operator, prevValue, display, handleSound, triggerKeyEffect, onAddHistory]);

  // Factorial helper
  const factorial = (n) => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  // Scientific special actions
  const handleSpecial = (type) => {
    handleSound('operator');
    triggerKeyEffect(type);
    const current = parseFloat(display);
    if (isNaN(current)) return;

    let res;
    let label = '';

    switch (type) {
      case 'deg_rad':
        setAngleUnit((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'));
        onNotify?.(`Switched to ${angleUnit === 'DEG' ? 'Radians (RAD)' : 'Degrees (DEG)'}`, 'info');
        return;
      case 'sin': {
        const rad = angleUnit === 'DEG' ? (current * Math.PI) / 180 : current;
        const val = Math.sin(rad);
        res = Math.abs(val) < 1e-12 ? 0 : val;
        label = `sin(${current}${angleUnit === 'DEG' ? '°' : ''})`;
        break;
      }
      case 'cos': {
        const rad = angleUnit === 'DEG' ? (current * Math.PI) / 180 : current;
        const val = Math.cos(rad);
        res = Math.abs(val) < 1e-12 ? 0 : val;
        label = `cos(${current}${angleUnit === 'DEG' ? '°' : ''})`;
        break;
      }
      case 'tan': {
        const rad = angleUnit === 'DEG' ? (current * Math.PI) / 180 : current;
        if (angleUnit === 'DEG' && Math.abs((Math.abs(current) % 180) - 90) < 1e-9) {
          setDisplay('Invalid Input');
          setWaitingForOperand(true);
          return;
        }
        const val = Math.tan(rad);
        res = Math.abs(val) < 1e-12 ? 0 : val;
        label = `tan(${current}${angleUnit === 'DEG' ? '°' : ''})`;
        break;
      }
      case 'ln':
        if (current <= 0) {
          setDisplay('Invalid Input');
          setWaitingForOperand(true);
          return;
        }
        res = Math.log(current);
        label = `ln(${current})`;
        break;
      case 'log':
        if (current <= 0) {
          setDisplay('Invalid Input');
          setWaitingForOperand(true);
          return;
        }
        res = Math.log10(current);
        label = `log(${current})`;
        break;
      case 'sqrt':
        if (current < 0) {
          setDisplay('Invalid Input');
          setWaitingForOperand(true);
          return;
        }
        res = Math.sqrt(current);
        label = `√(${current})`;
        break;
      case 'cbrt':
        res = Math.cbrt(current);
        label = `∛(${current})`;
        break;
      case 'square':
        res = Math.pow(current, 2);
        label = `sqr(${current})`;
        break;
      case 'cube':
        res = Math.pow(current, 3);
        label = `cube(${current})`;
        break;
      case 'exp':
        res = Math.exp(current);
        label = `e^(${current})`;
        break;
      case 'pow10':
        res = Math.pow(10, current);
        label = `10^(${current})`;
        break;
      case 'reciprocal':
        if (current === 0) {
          setDisplay('Cannot divide by zero');
          setWaitingForOperand(true);
          return;
        }
        res = 1 / current;
        label = `1/(${current})`;
        break;
      case 'factorial': {
        if (current < 0 || !Number.isInteger(current)) {
          setDisplay('Invalid Input');
          setWaitingForOperand(true);
          return;
        }
        res = factorial(current);
        label = `${current}!`;
        break;
      }
      case 'abs':
        res = Math.abs(current);
        label = `|${current}|`;
        break;
      case 'pi':
        res = Math.PI;
        label = 'π';
        break;
      case 'e':
        res = Math.E;
        label = 'e';
        break;
      case 'rand':
        res = Number(Math.random().toFixed(4));
        label = 'rand()';
        break;
      default:
        return;
    }

    const cleanResult = Number(res.toFixed(10));
    setDisplay(String(cleanResult));
    setExpression(`${label} =`);
    
    onAddHistory?.({
      expression: label,
      result: String(cleanResult),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    setWaitingForOperand(true);
  };

  // Copy display value
  const handleCopyDisplay = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    onNotify?.(`Copied ${display} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 1600);
  };

  // Keyboard support listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is focused on an input elsewhere
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const { key } = e;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        inputDigit(Number(key));
      } else if (key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (key === '+' || key === '-') {
        e.preventDefault();
        handleOperator(key);
      } else if (key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        clearAll();
      } else if (key === '%') {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, handleBackspace, clearAll, handlePercentage]);

  // Calculate dynamic font size to prevent text overflow for long numbers
  const getDisplayFontSize = () => {
    const len = display.length;
    if (len > 14) return '1.5rem';
    if (len > 10) return '2rem';
    if (len > 8) return '2.5rem';
    return '3.1rem';
  };

  return (
    <div className="calculator-workspace animate-fade-in">
      {/* Main Glassmorphic Calculator Container */}
      <div className="calculator-card">
        {/* Top Toolbar */}
        <div className="calc-toolbar">
          <div className="calc-mode-selector">
            <button
              type="button"
              className={`mode-btn ${mode === 'standard' ? 'active' : ''}`}
              onClick={() => setMode('standard')}
            >
              Standard
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'scientific' ? 'active' : ''}`}
              onClick={() => setMode('scientific')}
            >
              <Sparkles size={13} />
              <span>Scientific</span>
            </button>
          </div>

          <div className="calc-top-indicators">
            <span className="keyboard-badge" title="Physical keyboard input enabled">
              ⌨ Keyboard Active
            </span>
          </div>
        </div>

        {/* Display Screen */}
        <div className="calc-display-panel">
          <div className="calc-display-header">
            <div className="calc-status-tags">
              {mode === 'scientific' && (
                <button 
                  type="button" 
                  className="status-pill angle-pill"
                  onClick={() => handleSpecial('deg_rad')}
                  title="Click to toggle DEG / RAD mode"
                  aria-label="Toggle angle unit"
                >
                  {angleUnit}
                </button>
              )}
              {isMemorySet && (
                <button 
                  type="button" 
                  className="status-pill memory-pill"
                  onClick={handleMemoryRecall}
                  title={`Memory Stored: ${memory} (Click to recall)`}
                  aria-label="Recall stored memory"
                >
                  M: {memory}
                </button>
              )}
            </div>

            <div className="calc-sub-expression">
              <span>{expression || '\u00A0'}</span>
            </div>
          </div>

          <div 
            className="calc-main-digit"
            style={{ fontSize: getDisplayFontSize() }}
          >
            {display}
          </div>

          <div className="calc-screen-actions">
            <button
              type="button"
              className="screen-action-btn"
              onClick={handleBackspace}
              title="Backspace / Delete last character"
              aria-label="Delete character"
            >
              <Delete size={17} />
            </button>

            <button
              type="button"
              className={`screen-action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyDisplay}
              title="Copy current value"
              aria-label="Copy value"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="copy-label">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Memory Toolbar Bar */}
        <div className="calc-memory-bar">
          <button 
            type="button" 
            className={`mem-btn ${pressedKey === 'MC' ? 'active-press' : ''}`}
            onClick={handleMemoryClear}
            disabled={!isMemorySet}
            title="Memory Clear"
          >
            MC
          </button>
          <button 
            type="button" 
            className={`mem-btn ${pressedKey === 'MR' ? 'active-press' : ''}`}
            onClick={handleMemoryRecall}
            disabled={!isMemorySet}
            title="Memory Recall"
          >
            MR
          </button>
          <button 
            type="button" 
            className={`mem-btn ${pressedKey === 'M+' ? 'active-press' : ''}`}
            onClick={handleMemoryAdd}
            title="Memory Add"
          >
            M+
          </button>
          <button 
            type="button" 
            className={`mem-btn ${pressedKey === 'M-' ? 'active-press' : ''}`}
            onClick={handleMemorySubtract}
            title="Memory Subtract"
          >
            M-
          </button>
          <button 
            type="button" 
            className={`mem-btn ${pressedKey === 'MS' ? 'active-press' : ''}`}
            onClick={handleMemoryStore}
            title="Memory Store"
          >
            MS
          </button>
        </div>

        {/* Extended Scientific Grid (if active) */}
        {mode === 'scientific' && (
          <div className="calc-sci-grid animate-fade-in">
            {/* Row 1 */}
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'sin' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('sin')}
              title={`Sine (${angleUnit})`}
            >
              sin
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'cos' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('cos')}
              title={`Cosine (${angleUnit})`}
            >
              cos
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'tan' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('tan')}
              title={`Tangent (${angleUnit})`}
            >
              tan
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'ln' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('ln')}
              title="Natural Logarithm (ln)"
            >
              ln
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'log' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('log')}
              title="Base-10 Logarithm (log)"
            >
              log
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'pi' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('pi')}
              title="Pi (3.14159...)"
            >
              π
            </button>

            {/* Row 2 */}
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'sqrt' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('sqrt')}
              title="Square Root"
            >
              √x
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'square' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('square')}
              title="Square (x²)"
            >
              x²
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === '^' ? 'active-press' : ''}`}
              onClick={() => handleOperator('^')}
              title="Power (xʸ)"
            >
              xʸ
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'cube' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('cube')}
              title="Cube (x³)"
            >
              x³
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'factorial' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('factorial')}
              title="Factorial (n!)"
            >
              n!
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'e' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('e')}
              title="Euler's Constant e (2.71828...)"
            >
              e
            </button>

            {/* Row 3 */}
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'reciprocal' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('reciprocal')}
              title="Reciprocal (1/x)"
            >
              1/x
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'abs' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('abs')}
              title="Absolute Value (|x|)"
            >
              |x|
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'pow10' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('pow10')}
              title="Power of 10 (10ˣ)"
            >
              10ˣ
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'exp' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('exp')}
              title="Exponential (eˣ)"
            >
              eˣ
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'cbrt' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('cbrt')}
              title="Cube Root (∛x)"
            >
              ∛x
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'rand' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('rand')}
              title="Random Number (0-1)"
            >
              rnd
            </button>
          </div>
        )}

        {/* Standard Keypad Grid */}
        <div className="calc-keypad-grid">
          {/* Row 1 */}
          <button 
            type="button" 
            className={`key-btn key-action ${pressedKey === (display !== '0' && !waitingForOperand ? 'C' : 'AC') ? 'active-press' : ''}`}
            onClick={display !== '0' && !waitingForOperand ? clearEntry : clearAll}
            title={display !== '0' && !waitingForOperand ? 'Clear current entry (C)' : 'All Clear (AC)'}
          >
            {display !== '0' && !waitingForOperand ? 'C' : 'AC'}
          </button>
          <button 
            type="button" 
            className={`key-btn key-action ${pressedKey === '+/-' ? 'active-press' : ''}`}
            onClick={toggleSign}
          >
            +/-
          </button>
          <button 
            type="button" 
            className={`key-btn key-action ${pressedKey === '%' ? 'active-press' : ''}`}
            onClick={handlePercentage}
          >
            %
          </button>
          <button 
            type="button" 
            className={`key-btn key-operator ${operator === '÷' || pressedKey === '÷' ? 'active-operator' : ''}`}
            onClick={() => handleOperator('÷')}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 7 ? 'active-press' : ''}`}
            onClick={() => inputDigit(7)}
          >
            7
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 8 ? 'active-press' : ''}`}
            onClick={() => inputDigit(8)}
          >
            8
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 9 ? 'active-press' : ''}`}
            onClick={() => inputDigit(9)}
          >
            9
          </button>
          <button 
            type="button" 
            className={`key-btn key-operator ${operator === '×' || pressedKey === '×' ? 'active-operator' : ''}`}
            onClick={() => handleOperator('×')}
          >
            ×
          </button>

          {/* Row 3 */}
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 4 ? 'active-press' : ''}`}
            onClick={() => inputDigit(4)}
          >
            4
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 5 ? 'active-press' : ''}`}
            onClick={() => inputDigit(5)}
          >
            5
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 6 ? 'active-press' : ''}`}
            onClick={() => inputDigit(6)}
          >
            6
          </button>
          <button 
            type="button" 
            className={`key-btn key-operator ${operator === '-' || pressedKey === '-' ? 'active-operator' : ''}`}
            onClick={() => handleOperator('-')}
          >
            −
          </button>

          {/* Row 4 */}
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 1 ? 'active-press' : ''}`}
            onClick={() => inputDigit(1)}
          >
            1
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 2 ? 'active-press' : ''}`}
            onClick={() => inputDigit(2)}
          >
            2
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === 3 ? 'active-press' : ''}`}
            onClick={() => inputDigit(3)}
          >
            3
          </button>
          <button 
            type="button" 
            className={`key-btn key-operator ${operator === '+' || pressedKey === '+' ? 'active-operator' : ''}`}
            onClick={() => handleOperator('+')}
          >
            +
          </button>

          {/* Row 5 */}
          <button 
            type="button" 
            className={`key-btn key-num key-zero ${pressedKey === 0 ? 'active-press' : ''}`}
            onClick={() => inputDigit(0)}
          >
            0
          </button>
          <button 
            type="button" 
            className={`key-btn key-num ${pressedKey === '.' ? 'active-press' : ''}`}
            onClick={inputDecimal}
          >
            .
          </button>
          <button 
            type="button" 
            className={`key-btn key-equals ${pressedKey === '=' ? 'active-press' : ''}`}
            onClick={handleEquals}
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
