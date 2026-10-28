import test from 'node:test';
import assert from 'node:assert/strict';

// Helper mimicking our secured evaluator logic
function evaluateMathSecure(expr, x) {
  try {
    if (!expr || typeof expr !== 'string' || expr.length > 250) {
      return NaN;
    }

    if (!/^[0-9a-zA-Z_+\-*/^().,\s]+$/.test(expr)) {
      return NaN;
    }

    const tokens = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    const allowedIdentifiers = new Set([
      'x', 'pi', 'e',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
      'sinh', 'cosh', 'tanh',
      'sqrt', 'cbrt', 'abs', 'ln', 'log', 'exp',
      'ceil', 'floor', 'round', 'pow'
    ]);

    for (const token of tokens) {
      if (!allowedIdentifiers.has(token.toLowerCase())) {
        return NaN;
      }
    }

    let cleanExpr = expr.toLowerCase();

    cleanExpr = cleanExpr
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\basin\b/g, 'Math.asin')
      .replace(/\bacos\b/g, 'Math.acos')
      .replace(/\batan\b/g, 'Math.atan')
      .replace(/\bsinh\b/g, 'Math.sinh')
      .replace(/\bcosh\b/g, 'Math.cosh')
      .replace(/\btanh\b/g, 'Math.tanh')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\bcbrt\b/g, 'Math.cbrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bceil\b/g, 'Math.ceil')
      .replace(/\bfloor\b/g, 'Math.floor')
      .replace(/\bround\b/g, 'Math.round');

    cleanExpr = cleanExpr.replace(/([a-zA-Z0-9_.)]+)\s*\^\s*([a-zA-Z0-9_.(]+)/g, 'Math.pow($1, $2)');
    cleanExpr = cleanExpr.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
    cleanExpr = cleanExpr.replace(/\)([a-zA-Z0-9(])/g, ')*$1');

    const fn = new Function('x', 'Math', '"use strict"; return (' + cleanExpr + ');');
    const val = fn(x, Math);
    return typeof val === 'number' && Number.isFinite(val) ? val : NaN;
  } catch {
    return NaN;
  }
}

test('evaluateMath evaluates valid mathematical expressions correctly', () => {
  // Polynomial: x^2 + 2x + 1 at x = 3 -> 9 + 6 + 1 = 16
  assert.equal(evaluateMathSecure('x^2 + 2*x + 1', 3), 16);

  // Trigonometry: sin(0) = 0
  assert.equal(evaluateMathSecure('sin(x)', 0), 0);

  // Constants: pi, e
  assert.equal(Math.abs(evaluateMathSecure('pi', 0) - Math.PI) < 1e-10, true);
  assert.equal(Math.abs(evaluateMathSecure('e', 0) - Math.E) < 1e-10, true);

  // Powers and square roots
  assert.equal(evaluateMathSecure('sqrt(x)', 16), 4);
  assert.equal(evaluateMathSecure('x^3', 2), 8);
});

test('evaluateMath blocks dangerous code execution attempts', () => {
  // Constructor access
  assert.ok(Number.isNaN(evaluateMathSecure('constructor', 1)));
  assert.ok(Number.isNaN(evaluateMathSecure('x.constructor', 1)));

  // Prototype access
  assert.ok(Number.isNaN(evaluateMathSecure('__proto__', 1)));

  // Global / window / document access
  assert.ok(Number.isNaN(evaluateMathSecure('window', 1)));
  assert.ok(Number.isNaN(evaluateMathSecure('document', 1)));
  assert.ok(Number.isNaN(evaluateMathSecure('globalThis', 1)));
  assert.ok(Number.isNaN(evaluateMathSecure('process', 1)));

  // Eval / Function constructor
  assert.ok(Number.isNaN(evaluateMathSecure('eval("1+1")', 1)));
  assert.ok(Number.isNaN(evaluateMathSecure('Function("return 1")()', 1)));

  // Malicious symbols
  assert.ok(Number.isNaN(evaluateMathSecure('; alert(1);', 1)));
  assert.ok(Number.isNaN(evaluateMathSecure('fetch("/api")', 1)));
});

test('evaluateMath safely handles numerical edge cases', () => {
  // Division by zero -> NaN (Number.isFinite check)
  assert.ok(Number.isNaN(evaluateMathSecure('1 / x', 0)));

  // Log of negative / zero
  assert.ok(Number.isNaN(evaluateMathSecure('ln(x)', 0)));
  assert.ok(Number.isNaN(evaluateMathSecure('log(x)', -5)));

  // Square root of negative number
  assert.ok(Number.isNaN(evaluateMathSecure('sqrt(x)', -4)));
});

