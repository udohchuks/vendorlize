import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatProcessingMessage,
  nextDisplayStatusAfterApi,
  shouldShowAiResult,
  shouldShowFallbackOverlay,
} from './tryOnDisplay';

describe('tryOnDisplay', () => {
  it('formats processing messages by elapsed time', () => {
    assert.match(formatProcessingMessage(5), /Aligning shoulder/);
    assert.match(formatProcessingMessage(20), /up to 90 seconds/);
    assert.match(formatProcessingMessage(60), /Still processing/);
  });

  it('maps API result to display status', () => {
    assert.equal(nextDisplayStatusAfterApi(true, 'ai'), 'success');
    assert.equal(nextDisplayStatusAfterApi(true, 'fallback'), 'success');
    assert.equal(nextDisplayStatusAfterApi(false), 'failed');
  });

  it('selects AI vs fallback viewport modes', () => {
    assert.equal(shouldShowAiResult('ai', 'https://out.png'), true);
    assert.equal(shouldShowAiResult('fallback', 'https://g.jpg'), false);
    assert.equal(shouldShowFallbackOverlay('fallback', 'https://g.jpg'), true);
    assert.equal(shouldShowFallbackOverlay('ai', 'https://out.png'), false);
  });
});
