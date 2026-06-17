import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateTryOnInputs } from './tryOnServerValidation';

describe('tryOnServerValidation', () => {
  const garment = 'https://example.com/garment.jpg';

  it('requires both image urls', () => {
    assert.equal(validateTryOnInputs('', garment).ok, false);
    assert.equal(validateTryOnInputs('https://x.com/p.jpg', '').ok, false);
  });

  it('accepts http person and garment urls', () => {
    const result = validateTryOnInputs('https://example.com/person.jpg', garment);
    assert.equal(result.ok, true);
  });

  it('accepts valid base64 portrait', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQ';
    assert.equal(validateTryOnInputs(dataUrl, garment).ok, true);
  });

  it('rejects unsupported base64 mime', () => {
    const result = validateTryOnInputs('data:image/gif;base64,abc', garment);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'person_invalid_format');
  });

  it('rejects garment data uris', () => {
    const result = validateTryOnInputs(
      'https://example.com/person.jpg',
      'data:image/jpeg;base64,abc'
    );
    assert.equal(result.ok, false);
    assert.equal(result.code, 'garment_data_uri');
  });
});
