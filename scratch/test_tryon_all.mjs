/**
 * Full try-on test suite — run with dev server: node scratch/test_tryon_all.mjs
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

async function post(body, headers = {}) {
  const res = await fetch(`${BASE}/api/tryon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log('Running full try-on test suite against', BASE);

  const missing = await post({ personImageUrl: person });
  assert(missing.status === 400, 'Missing garment should 400');
  console.log('PASS: missing garment validation');

  const badMime = await post({
    personImageUrl: 'data:image/gif;base64,abc',
    garmentImageUrl: garment,
  });
  assert(badMime.status === 400, 'GIF portrait should 400');
  console.log('PASS: invalid portrait mime validation');

  const forced = await post(
    { personImageUrl: person, garmentImageUrl: garment },
    { 'x-tryon-force-fallback': '1' }
  );
  assert(forced.status === 200 && forced.data.mode === 'fallback', 'Forced fallback should 200');
  console.log('PASS: forced fallback');

  const live = await post({ personImageUrl: person, garmentImageUrl: garment });
  assert(live.status === 200, `Live try-on should 200, got ${live.status}`);
  assert(live.data.mode === 'ai' || live.data.mode === 'fallback', 'Live try-on needs mode');
  assert(typeof live.data.output === 'string', 'Live try-on needs output');
  console.log(`PASS: live try-on (${live.data.mode})`);

  console.log('ALL TESTS PASSED');
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});
