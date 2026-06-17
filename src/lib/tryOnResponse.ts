export type TryOnMode = 'ai' | 'fallback';

export type TryOnDisplayStatus =
  | 'idle'
  | 'processing'
  | 'success'
  | 'failed'
  | 'image_load_failed';

export interface TryOnApiBody {
  mode?: TryOnMode;
  output?: string;
  reason?: string;
  error?: string;
}

export interface ParsedTryOnResult {
  ok: boolean;
  mode?: TryOnMode;
  output?: string;
  reason?: string;
  error?: string;
}

export function buildFallbackPayload(output: string, reason: string): TryOnApiBody {
  return {
    mode: 'fallback',
    output,
    reason,
  };
}

export function buildAiPayload(output: string): TryOnApiBody {
  return {
    mode: 'ai',
    output,
  };
}

/** Parse /api/tryon JSON — activates client fallback when server returns 5xx without a body mode. */
export function parseTryOnApiResult(
  data: unknown,
  httpStatus: number,
  garmentFallbackUrl: string
): ParsedTryOnResult {
  const body = (data && typeof data === 'object' ? data : {}) as TryOnApiBody;

  if (body.mode === 'fallback' && typeof body.output === 'string' && body.output.length > 0) {
    return {
      ok: true,
      mode: 'fallback',
      output: body.output,
      reason: body.reason || 'AI try-on is temporarily unavailable.',
    };
  }

  if (typeof body.output === 'string' && body.output.length > 0 && body.mode !== 'fallback') {
    return {
      ok: true,
      mode: body.mode === 'ai' ? 'ai' : 'ai',
      output: body.output,
    };
  }

  if (body.error) {
    if (httpStatus >= 500 && garmentFallbackUrl) {
      return {
        ok: true,
        mode: 'fallback',
        output: garmentFallbackUrl,
        reason: body.error,
      };
    }
    return { ok: false, error: body.error };
  }

  if (httpStatus >= 500 && garmentFallbackUrl) {
    return {
      ok: true,
      mode: 'fallback',
      output: garmentFallbackUrl,
      reason: `Try-on server returned status ${httpStatus}`,
    };
  }

  if (!httpStatus || httpStatus >= 400) {
    return {
      ok: false,
      error: `Try-on server returned status ${httpStatus}`,
    };
  }

  return { ok: false, error: 'No output image URL returned from AI.' };
}

export function isFallbackOutput(
  fitOutput: string | null,
  garmentImageUrl: string
): boolean {
  if (!fitOutput) return false;
  return fitOutput === garmentImageUrl;
}
