import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server/index.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/health returns 200 and online status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type')?.includes('application/json'), true);

  const data = await res.json();
  assert.ok(data.status === 'ok' || data.status === 'online');
  assert.ok(data.service.toLowerCase().includes('calcpulse'));
  assert.equal(typeof data.uptime, 'number');
  assert.equal(typeof data.timestamp, 'string');
});

test('GET /api/history returns calculation tape list', async () => {
  const res = await fetch(`${baseUrl}/api/history`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(Array.isArray(data.history), true);
});

test('POST /api/history adds new entry and DELETE removes it', async () => {
  // 1. Add entry
  const createRes = await fetch(`${baseUrl}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expression: '45 * 2',
      result: '90',
      timestamp: '12:00:00 PM'
    })
  });
  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  assert.equal(createData.success, true);
  assert.equal(createData.entry.expression, '45 * 2');
  assert.equal(createData.entry.result, '90');
  const entryId = createData.entry.id;
  assert.ok(entryId);

  // 2. Verify it appears in history
  const listRes = await fetch(`${baseUrl}/api/history`);
  const listData = await listRes.json();
  const found = listData.history.find((item) => item.id === entryId);
  assert.ok(found);

  // 3. Delete single entry
  const deleteRes = await fetch(`${baseUrl}/api/history/${encodeURIComponent(entryId)}`, {
    method: 'DELETE'
  });
  assert.equal(deleteRes.status, 200);
  const deleteData = await deleteRes.json();
  assert.equal(deleteData.success, true);
  assert.equal(deleteData.id, entryId);

  // 4. Deleting nonexistent entry returns 404
  const deleteMissingRes = await fetch(`${baseUrl}/api/history/nonexistent_id_999`, {
    method: 'DELETE'
  });
  assert.equal(deleteMissingRes.status, 404);
});

test('POST /api/history validates input types and sizes', async () => {
  // Empty body
  const emptyRes = await fetch(`${baseUrl}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(emptyRes.status, 400);

  // Missing result
  const missingResultRes = await fetch(`${baseUrl}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression: '1 + 1' })
  });
  assert.equal(missingResultRes.status, 400);

  // Oversized expression
  const hugeRes = await fetch(`${baseUrl}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expression: 'x'.repeat(600),
      result: '10'
    })
  });
  assert.equal(hugeRes.status, 400);
});

test('GET /api/converter/rates returns USD base currency rates', async () => {
  const res = await fetch(`${baseUrl}/api/converter/rates`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.base, 'USD');
  assert.equal(typeof data.rates.EUR, 'number');
  assert.equal(typeof data.rates.JPY, 'number');
  assert.equal(typeof data.rates.GBP, 'number');
});

test('POST /api/financial/emi calculates loan repayment accurately', async () => {
  // $100,000 at 6% for 30 years (360 months)
  const res = await fetch(`${baseUrl}/api/financial/emi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      principal: 100000,
      annualRate: 6,
      tenureMonths: 360
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.monthlyEmi, 599.55);
  assert.equal(data.totalPayable, 215838.19);
  assert.equal(data.totalInterest, 115838.19);

  // 0% interest loan
  const zeroInterestRes = await fetch(`${baseUrl}/api/financial/emi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      principal: 12000,
      annualRate: 0,
      tenureMonths: 12
    })
  });
  assert.equal(zeroInterestRes.status, 200);
  const zeroData = await zeroInterestRes.json();
  assert.equal(zeroData.monthlyEmi, 1000);
  assert.equal(zeroData.totalInterest, 0);

  // Invalid inputs
  const invalidRes = await fetch(`${baseUrl}/api/financial/emi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ principal: -500, annualRate: 5, tenureMonths: 12 })
  });
  assert.equal(invalidRes.status, 400);
});

test('POST /api/financial/compound calculates investment growth', async () => {
  // $10,000 initial + $500/mo at 8% for 10 years
  const res = await fetch(`${baseUrl}/api/financial/compound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initialDeposit: 10000,
      monthlyDeposit: 500,
      annualRate: 8,
      years: 10,
      frequency: 12
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.futureValue > 100000);
  assert.equal(data.totalInvested, 70000);
  assert.ok(data.totalInterest > 30000);

  // Invalid inputs
  const invalidRes = await fetch(`${baseUrl}/api/financial/compound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initialDeposit: 'invalid', annualRate: -2 })
  });
  assert.equal(invalidRes.status, 400);
});

test('POST /api/matrix/analyze analyzes 2x2 and 3x3 matrices', async () => {
  // 2x2 matrix: [[1, 2], [3, 4]] -> det = 1*4 - 2*3 = -2, trace = 5
  const res2 = await fetch(`${baseUrl}/api/matrix/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      matrix: [[1, 2], [3, 4]]
    })
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.success, true);
  assert.equal(data2.order, '2x2');
  assert.equal(data2.trace, 5);
  assert.equal(data2.determinant, -2);
  assert.equal(data2.isSingular, false);

  // Singular matrix: [[2, 4], [1, 2]] -> det = 0
  const resSingular = await fetch(`${baseUrl}/api/matrix/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      matrix: [[2, 4], [1, 2]]
    })
  });
  assert.equal(resSingular.status, 200);
  const dataSingular = await resSingular.json();
  assert.equal(dataSingular.isSingular, true);

  // Non-square matrix error
  const resNonSquare = await fetch(`${baseUrl}/api/matrix/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      matrix: [[1, 2, 3], [4, 5, 6]]
    })
  });
  assert.equal(resNonSquare.status, 400);
});

test('POST /api/equations/quadratic solves real and complex roots', async () => {
  // Two real roots: x^2 - 5x + 6 = 0 -> roots: 3, 2
  const resTwoReal = await fetch(`${baseUrl}/api/equations/quadratic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a: 1, b: -5, c: 6 })
  });
  assert.equal(resTwoReal.status, 200);
  const dataTwoReal = await resTwoReal.json();
  assert.equal(dataTwoReal.type, 'two_real');
  assert.deepEqual(dataTwoReal.roots, [3, 2]);

  // Repeated real root: x^2 - 4x + 4 = 0 -> root: 2
  const resRepeated = await fetch(`${baseUrl}/api/equations/quadratic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a: 1, b: -4, c: 4 })
  });
  assert.equal(resRepeated.status, 200);
  const dataRepeated = await resRepeated.json();
  assert.equal(dataRepeated.type, 'repeated_real');
  assert.deepEqual(dataRepeated.roots, [2, 2]);

  // Complex roots: x^2 + 1 = 0 -> roots: 0 + 1i, 0 - 1i
  const resComplex = await fetch(`${baseUrl}/api/equations/quadratic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a: 1, b: 0, c: 1 })
  });
  assert.equal(resComplex.status, 200);
  const dataComplex = await resComplex.json();
  assert.equal(dataComplex.type, 'complex_conjugate');
  assert.ok(dataComplex.roots[0].includes('1.0000i'));

  // Invalid: a = 0
  const resZeroA = await fetch(`${baseUrl}/api/equations/quadratic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a: 0, b: 2, c: 1 })
  });
  assert.equal(resZeroA.status, 400);
});

test('Unknown /api route returns JSON 404', async () => {
  const res = await fetch(`${baseUrl}/api/non_existent_route`);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('content-type')?.includes('application/json'), true);
  const data = await res.json();
  assert.equal(data.error, 'API endpoint not found');
});

test('Frontend static assets and SPA fallback serve index.html', async () => {
  // Root path
  const rootRes = await fetch(`${baseUrl}/`);
  assert.equal(rootRes.status, 200);
  const rootText = await rootRes.text();
  assert.ok(rootText.includes('<div id="root">'));
  assert.ok(rootText.includes('CalcPulse'));

  // Static asset (favicon)
  const faviconRes = await fetch(`${baseUrl}/favicon.svg`);
  assert.equal(faviconRes.status, 200);

  // Missing static asset returns 404, not index.html
  const missingAssetRes = await fetch(`${baseUrl}/assets/missing-asset-file.js`);
  assert.equal(missingAssetRes.status, 404);
  const missingAssetJson = await missingAssetRes.json();
  assert.equal(missingAssetJson.error, 'Asset not found');

  // Frontend route fallback (e.g. /financial)
  const spaRes = await fetch(`${baseUrl}/financial`);
  assert.equal(spaRes.status, 200);
  const spaText = await spaRes.text();
  assert.ok(spaText.includes('<div id="root">'));
});
