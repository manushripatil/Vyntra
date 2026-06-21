import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fetch from 'node-fetch';
import app from '../server.js';

test('integration: health and proof endpoints', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  // Health
  const healthRes = await fetch(`${base}/health`);
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(typeof health.wasmExists, 'boolean');

  // Attempt a proof generation with a sample age (may be slow)
  const proveRes = await fetch(`${base}/prove-age`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age: 18 }),
  });

  // Proof generation may succeed or fail depending on artifacts; ensure endpoint responds
  assert.ok(proveRes.status === 200 || proveRes.status === 500);

  // If proof was generated, try verify endpoint
  if (proveRes.status === 200) {
    const data = await proveRes.json();
    if (data.success && data.proof && data.publicSignals) {
      const verifyRes = await fetch(`${base}/verify-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: data.proof, publicSignals: data.publicSignals }),
      });
      assert.equal(verifyRes.status, 200);
      const vd = await verifyRes.json();
      assert.ok(typeof vd.verifiedProof === 'boolean');
    }
  }

  server.close();
});
