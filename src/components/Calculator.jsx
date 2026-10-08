import React, { useState, useEffect, useCallback } from 'react';
import { 
  Delete, 
  Copy, 
  Check, 
  Sparkles, 
  Maximize2, 
  RotateCcw,
  Zap
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
  const [copied, setCopied] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [pressedKey, setPressedKey] = useState(null);

  // Sync external value when user clicks an entry in the history drawer
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== null) {
      setDisplay(String(externalValue));
      setWaitingForOperand(true);
    }
  }, [externalValue]);

  const triggerKeyEffect = (keyIdentifier) => {
    setPressedKey(keyIdentifier);
    setTimeout(() => setPressedKey(null), 120);
  };

  const handleSound = (type = 'default') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
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
  }, [display, waitingForOperand, soundEnabled]);

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
  }, [display, waitingForOperand, soundEnabled]);

  // Clear operations
  const clearAll = useCallback(() => {
    handleSound('clear');
    triggerKeyEffect('AC');
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, [soundEnabled]);

  const clearEntry = useCallback(() => {
    handleSound('clear');
    triggerKeyEffect('C');
    setDisplay('0');
  }, [soundEnabled]);

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
  }, [display, waitingForOperand, soundEnabled]);

  // Toggle plus / minus sign
  const toggleSign = useCallback(() => {
    handleSound('digit');
    triggerKeyEffect('+/-');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  }, [display, soundEnabled]);

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
  }, [display, prevValue, operator, soundEnabled]);

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
  }, [display, prevValue, operator, waitingForOperand, soundEnabled]);

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
  }, [operator, prevValue, display, soundEnabled, onAddHistory]);

  // Scientific special actions
  const handleSpecial = (type) => {
    handleSound('operator');
    triggerKeyEffect(type);
    const current = parseFloat(display);
    if (isNaN(current)) return;

    let res;
    let label = '';

    switch (type) {
      case 'sqrt':
        if (current < 0) {
          setDisplay('Invalid Input');
          setWaitingForOperand(true);
          return;
        }
        res = Math.sqrt(current);
        label = `√(${current})`;
        break;
      case 'square':
        res = Math.pow(current, 2);
        label = `sqr(${current})`;
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
      case 'pi':
        res = Math.PI;
        label = 'π';
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
          <div className="calc-sub-expression">
            <span>{expression || '\u00A0'}</span>
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

        {/* Scientific row (if active) */}
        {mode === 'scientific' && (
          <div className="calc-sci-grid animate-fade-in">
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'sqrt' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('sqrt')}
            >
              √x
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'square' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('square')}
            >
              x²
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === '^' ? 'active-press' : ''}`}
              onClick={() => handleOperator('^')}
            >
              xʸ
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'reciprocal' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('reciprocal')}
            >
              1/x
            </button>
            <button 
              type="button" 
              className={`key-btn key-sci ${pressedKey === 'pi' ? 'active-press' : ''}`}
              onClick={() => handleSpecial('pi')}
            >
              π
            </button>
          </div>
        )}

        {/* Standard Keypad Grid */}
        <div className="calc-keypad-grid">
          {/* Row 1 */}
          <button 
            type="button" 
            className={`key-btn key-action ${pressedKey === 'AC' ? 'active-press' : ''}`}
            onClick={clearAll}
          >
            AC
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
