import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeResizeDimensions,
  UPLOAD_RULES,
  validateImageDimensions,
  validateUploadMimeAndSize,
} from './uploadValidation';

describe('uploadValidation', () => {
  it('rejects unsupported mime types', () => {
    const result = validateUploadMimeAndSize('image/gif', 1000);
    assert.equal(result.ok, false);
  });

  it('rejects oversized files', () => {
    const result = validateUploadMimeAndSize('image/jpeg', UPLOAD_RULES.maxBytes + 1);
    assert.equal(result.ok, false);
  });

  it('accepts valid jpeg under size limit', () => {
    const result = validateUploadMimeAndSize('image/jpeg', 1024);
    assert.equal(result.ok, true);
  });

  it('rejects images below minimum dimensions', () => {
    const result = validateImageDimensions(300, 500);
    assert.equal(result.ok, false);
  });

  it('warns on landscape orientation', () => {
    const result = validateImageDimensions(800, 600);
    assert.equal(result.ok, true);
    assert.match(result.warnings?.[0] || '', /Portrait/);
  });

  it('computes resize dimensions for large images', () => {
    const resized = computeResizeDimensions(3000, 4000);
    assert.equal(Math.max(resized.width, resized.height), UPLOAD_RULES.maxLongEdge);
  });

  it('keeps dimensions when already small enough', () => {
    const resized = computeResizeDimensions(600, 900);
    assert.deepEqual(resized, { width: 600, height: 900 });
  });
});
