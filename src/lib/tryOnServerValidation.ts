const MAX_BASE64_CHARS = 2_800_000; // ~2MB decoded upper bound for person uploads
const MAX_URL_LENGTH = 2048;

export interface ServerValidationResult {
  ok: boolean;
  error?: string;
  code?: string;
}

export function validateTryOnInputs(
  personImageUrl: unknown,
  garmentImageUrl: unknown
): ServerValidationResult {
  if (typeof personImageUrl !== 'string' || !personImageUrl.trim()) {
    return { ok: false, error: 'Missing personImageUrl', code: 'missing_person' };
  }
  if (typeof garmentImageUrl !== 'string' || !garmentImageUrl.trim()) {
    return { ok: false, error: 'Missing garmentImageUrl', code: 'missing_garment' };
  }

  const person = personImageUrl.trim();
  const garment = garmentImageUrl.trim();

  if (person.startsWith('data:')) {
    if (person.length > MAX_BASE64_CHARS) {
      return {
        ok: false,
        error: 'Uploaded portrait is too large after encoding. Please use a smaller image.',
        code: 'person_too_large',
      };
    }
    if (!/^data:image\/(jpeg|png|webp);base64,/i.test(person)) {
      return {
        ok: false,
        error: 'Uploaded portrait must be JPEG, PNG, or WebP.',
        code: 'person_invalid_format',
      };
    }
  } else if (!/^https?:\/\//i.test(person)) {
    return { ok: false, error: 'Invalid personImageUrl', code: 'person_invalid_url' };
  } else if (person.length > MAX_URL_LENGTH) {
    return { ok: false, error: 'personImageUrl is too long', code: 'person_url_too_long' };
  }

  if (garment.startsWith('data:')) {
    return { ok: false, error: 'Garment image must be a URL, not a data URI.', code: 'garment_data_uri' };
  }
  if (!/^https?:\/\//i.test(garment) && !garment.startsWith('/')) {
    return { ok: false, error: 'Invalid garmentImageUrl', code: 'garment_invalid_url' };
  }
  if (garment.length > MAX_URL_LENGTH) {
    return { ok: false, error: 'garmentImageUrl is too long', code: 'garment_url_too_long' };
  }

  return { ok: true };
}

export type TryOnFailureCode =
  | 'validation'
  | 'missing_key'
  | 'agnes_error'
  | 'agnes_no_output'
  | 'forced_fallback'
  | 'unexpected';

export function logTryOnEvent(event: {
  outcome: 'ai_success' | 'fallback' | 'validation_error' | 'server_error';
  code?: TryOnFailureCode | string;
  message?: string;
  attempt?: number;
}) {
  console.info('[tryon]', JSON.stringify({ ts: new Date().toISOString(), ...event }));
}
