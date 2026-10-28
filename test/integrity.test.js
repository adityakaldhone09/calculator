import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Check that dist directory contains all essential production assets', () => {
  const distDir = path.join(rootDir, 'dist');
  assert.ok(fs.existsSync(distDir), 'dist directory must exist after build');

  const indexPath = path.join(distDir, 'index.html');
  assert.ok(fs.existsSync(indexPath), 'dist/index.html must exist');

  const html = fs.readFileSync(indexPath, 'utf-8');
  assert.ok(html.includes('<div id="root">'), 'index.html must have root div');

  // Verify public assets copied to dist
  assert.ok(fs.existsSync(path.join(distDir, 'favicon.svg')), 'favicon.svg must exist in dist');
  assert.ok(fs.existsSync(path.join(distDir, 'icons.svg')), 'icons.svg must exist in dist');

  // Verify assets directory has JS and CSS bundles
  const assetsDir = path.join(distDir, 'assets');
  assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');
  const assetFiles = fs.readdirSync(assetsDir);
  assert.ok(assetFiles.some((f) => f.endsWith('.js')), 'dist/assets must contain bundled JS');
  assert.ok(assetFiles.some((f) => f.endsWith('.css')), 'dist/assets must contain bundled CSS');
});

test('Check that all component files imported in App.jsx exist', () => {
  const appPath = path.join(rootDir, 'src', 'App.jsx');
  const content = fs.readFileSync(appPath, 'utf-8');
  const importLines = content.match(/import\s+.*?from\s+['"](.*?)['"]/g) || [];

  for (const line of importLines) {
    const match = line.match(/from\s+['"](.*?)['"]/);
    if (!match) continue;
    const importPath = match[1];

    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(appPath), importPath);
      const candidates = [
        resolved,
        `${resolved}.jsx`,
        `${resolved}.js`,
        `${resolved}.css`
      ];
      const exists = candidates.some((c) => fs.existsSync(c));
      assert.ok(exists, `Imported file does not exist: ${importPath}`);
    }
  }
});

test('Check repository for accidentally committed secrets or credentials', () => {
  const filesToScan = [
    'package.json',
    'vite.config.js',
    'server/index.js',
    'src/App.jsx',
    'index.html',
    'README.md'
  ];

  const secretPatterns = [
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
    /-----BEGIN (RSA|EC|DSA|OPENSSH|PRIVATE) KEY-----/,
    /(api[_-]?key|secret[_-]?key|auth[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9+/=]{20,}['"]/i
  ];

  for (const relFile of filesToScan) {
    const fullPath = path.join(rootDir, relFile);
    if (!fs.existsSync(fullPath)) continue;
    const text = fs.readFileSync(fullPath, 'utf-8');

    for (const pattern of secretPatterns) {
      assert.ok(!pattern.test(text), `Potential exposed secret detected in ${relFile} matching ${pattern}`);
    }
  }
});

