const base = process.env.BASE_URL || 'http://localhost:10000';
const fetch = globalThis.fetch || (url => import('node-fetch').then(m => m.default(url)));

async function run() {
  try {
    console.log('BASE:', base);
    const h = await (await fetch(base + '/health')).json();
    console.log('/health ->', h);

    const proofResp = await (await fetch(base + '/prove-age', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: 18 })
    })).json();
    console.log('/prove-age -> success:', proofResp.success, 'verified:', proofResp.verified);

    const verifyResp = await (await fetch(base + '/verify-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof: proofResp.proof, publicSignals: proofResp.publicSignals })
    })).json();
    console.log('/verify-proof ->', verifyResp);

    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
}

run();
