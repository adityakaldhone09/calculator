import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

async function runSmokeTest() {
  const testPort = '5002';
  console.log(`Starting production server on port ${testPort}...`);

  const serverProc = spawn('node', ['server/index.js'], {
    env: {
      ...process.env,
      PORT: testPort,
      NODE_ENV: 'production'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverOutput = '';
  serverProc.stdout.on('data', (d) => {
    serverOutput += d.toString();
  });
  serverProc.stderr.on('data', (d) => {
    serverOutput += d.toString();
  });

  // Wait for server to be ready
  const baseUrl = `http://127.0.0.1:${testPort}`;
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // Retry
    }
  }

  if (!ready) {
    serverProc.kill('SIGKILL');
    console.error('Server output:\n', serverOutput);
    throw new Error('Server failed to start within timeout');
  }

  console.log('✔ Production server started successfully and bound to host');

  try {
    // 1. Health check
    console.log('Testing /api/health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'online');
    assert.equal(healthData.service, 'CalcPulse Backend API');
    console.log('✔ /api/health passed');

    // 2. Frontend root HTML
    console.log('Testing frontend root GET /...');
    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const rootHtml = await rootRes.text();
    assert.ok(rootHtml.includes('<div id="root">'));
    console.log('✔ Frontend root index.html passed');

    // 3. Static asset
    console.log('Testing static asset GET /favicon.svg...');
    const favRes = await fetch(`${baseUrl}/favicon.svg`);
    assert.equal(favRes.status, 200);
    console.log('✔ Static asset serving passed');

    // 4. API 404 response
    console.log('Testing unknown API route GET /api/does-not-exist...');
    const notFoundRes = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(notFoundRes.status, 404);
    const notFoundJson = await notFoundRes.json();
    assert.equal(notFoundJson.error, 'API endpoint not found');
    console.log('✔ API 404 JSON response passed');

    // 5. Calculation persistence tape workflow
    console.log('Testing calculation tape POST & GET /api/history...');
    const postRes = await fetch(`${baseUrl}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression: '100 * 5.2',
        result: '520',
        timestamp: '1:00:00 PM'
      })
    });
    assert.equal(postRes.status, 201);
    const postData = await postRes.json();
    assert.equal(postData.success, true);
    assert.ok(postData.entry.id);

    const getRes = await fetch(`${baseUrl}/api/history`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.ok(getData.history.some((h) => h.id === postData.entry.id));
    console.log('✔ Calculation tape persistence workflow passed');

    // 6. SPA fallback test
    console.log('Testing SPA routing fallback GET /converter...');
    const spaRes = await fetch(`${baseUrl}/converter`);
    assert.equal(spaRes.status, 200);
    const spaHtml = await spaRes.text();
    assert.ok(spaHtml.includes('<div id="root">'));
    console.log('✔ SPA routing fallback passed');

    console.log('\n🎉 ALL PRODUCTION SERVER SMOKE TESTS PASSED!');
  } finally {
    serverProc.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 300));
  }
}

runSmokeTest().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});

