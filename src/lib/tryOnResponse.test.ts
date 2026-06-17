import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAiPayload,
  buildFallbackPayload,
  isFallbackOutput,
  parseTryOnApiResult,
} from './tryOnResponse';

describe('tryOnResponse', () => {
  const garment = 'https://example.com/garment.jpg';

  it('parses AI success payload', () => {
    const result = parseTryOnApiResult(buildAiPayload('https://ai.example/out.png'), 200, garment);
    assert.equal(result.ok, true);
    assert.equal(result.mode, 'ai');
    assert.equal(result.output, 'https://ai.example/out.png');
  });

  it('parses explicit fallback payload', () => {
    const result = parseTryOnApiResult(
      buildFallbackPayload(garment, 'Agnes offline'),
      200,
      garment
    );
    assert.equal(result.ok, true);
    assert.equal(result.mode, 'fallback');
    assert.equal(result.output, garment);
    assert.equal(result.reason, 'Agnes offline');
  });

  it('falls back on 500 with error body', () => {
    const result = parseTryOnApiResult({ error: 'Quota exceeded' }, 500, garment);
    assert.equal(result.ok, true);
    assert.equal(result.mode, 'fallback');
    assert.equal(result.reason, 'Quota exceeded');
  });

  it('falls back on 500 without body', () => {
    const result = parseTryOnApiResult({}, 500, garment);
    assert.equal(result.ok, true);
    assert.equal(result.mode, 'fallback');
  });

  it('returns error on 400 without fallback', () => {
    const result = parseTryOnApiResult({ error: 'Invalid image' }, 400, garment);
    assert.equal(result.ok, false);
    assert.match(result.error || '', /Invalid image/);
  });

  it('detects fallback output URL match', () => {
    assert.equal(isFallbackOutput(garment, garment), true);
    assert.equal(isFallbackOutput('https://ai.example/out.png', garment), false);
    assert.equal(isFallbackOutput(null, garment), false);
  });
});
