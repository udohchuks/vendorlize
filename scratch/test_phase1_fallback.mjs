/**
 * Phase 1 integration test: /api/tryon must return fallback when Agnes is unavailable.
 * Run with dev server up: node scratch/test_phase1_fallback.mjs
 */
const BASE = process.env.TRYON_TEST_BASE || 'http://localhost:3000';

const person =
  'https://api-hackathon.codedematrixtech.com/images/phasion-sense/ps4.jpg';
const garment =
  'https://api-hackathon.codedematrixtech.com/images/phasion-sense/ps1.jpg';

async function postTryOn() {
  const res = await fetch(`${BASE}/api/tryon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personImageUrl: person, garmentImageUrl: garment }),
    signal: AbortSignal.timeout(120000),
  });
  const data = await res.json();
  return { status: res.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

async function main() {
  console.log('Phase 1 integration test against', BASE);

  const missing = await fetch(`${BASE}/api/tryon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personImageUrl: person }),
  });
  assert(missing.status === 400, 'Missing garment should return 400');
  console.log('PASS: validation 400 for missing garment');

  const { status, data } = await postTryOn();
  assert(status === 200, `Expected 200, got ${status}`);
  assert(
    data.mode === 'ai' || data.mode === 'fallback',
    `Expected mode ai or fallback, got ${JSON.stringify(data)}`
  );
  assert(typeof data.output === 'string' && data.output.length > 0, 'Expected output URL');

  if (data.mode === 'fallback') {
    assert(typeof data.reason === 'string', 'Fallback must include reason');
    console.log('PASS: fallback response with reason:', data.reason.slice(0, 80));
  } else {
    console.log('PASS: AI response with output URL');
  }

  console.log('Phase 1 integration: ALL PASSED');
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});
