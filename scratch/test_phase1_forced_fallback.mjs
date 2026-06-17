/**
 * Phase 1 forced-fallback test via dev-only header (no separate server).
 */
const BASE = process.env.TRYON_TEST_BASE || 'http://localhost:3000';

const person =
  'https://api-hackathon.codedematrixtech.com/images/phasion-sense/ps4.jpg';
const garment =
  'https://api-hackathon.codedematrixtech.com/images/phasion-sense/ps1.jpg';

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

async function main() {
  console.log('Phase 1 forced-fallback test against', BASE);

  const res = await fetch(`${BASE}/api/tryon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tryon-force-fallback': '1',
    },
    body: JSON.stringify({ personImageUrl: person, garmentImageUrl: garment }),
  });
  const data = await res.json();

  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(data.mode === 'fallback', `Expected fallback mode, got ${JSON.stringify(data)}`);
  assert(data.output === garment, `Output should be garment URL, got ${data.output}`);
  assert(typeof data.reason === 'string', 'Expected fallback reason');

  console.log('PASS: forced fallback via x-tryon-force-fallback header');
  console.log('Phase 1 forced-fallback: ALL PASSED');
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});
