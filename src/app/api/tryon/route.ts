import { NextResponse } from 'next/server';
import { buildAiPayload, buildFallbackPayload } from '@/lib/tryOnResponse';
import { logTryOnEvent, validateTryOnInputs } from '@/lib/tryOnServerValidation';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-hackathon.codedematrixtech.com';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

function jsonFallback(garmentImageUrl: string, reason: string, code = 'agnes_error') {
  const output = getAbsoluteUrl(garmentImageUrl);
  logTryOnEvent({ outcome: 'fallback', code, message: reason });
  return NextResponse.json(buildFallbackPayload(output, reason), {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const { personImageUrl, garmentImageUrl } = await request.json();

    const validation = validateTryOnInputs(personImageUrl, garmentImageUrl);
    if (!validation.ok) {
      logTryOnEvent({
        outcome: 'validation_error',
        code: validation.code || 'validation',
        message: validation.error,
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: corsHeaders }
      );
    }

    const absoluteGarmentUrl = getAbsoluteUrl(garmentImageUrl);

    const forceFallback =
      process.env.NODE_ENV !== 'production' &&
      (process.env.TRYON_FORCE_FALLBACK === '1' ||
        request.headers.get('x-tryon-force-fallback') === '1');

    if (forceFallback) {
      return jsonFallback(garmentImageUrl, 'Forced fallback for testing.', 'forced_fallback');
    }

    const apiKey = process.env.AGNES_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      return jsonFallback(
        garmentImageUrl,
        'Agnes AI is not configured. Showing local draping preview instead.',
        'missing_key'
      );
    }

    const absolutePersonUrl = getAbsoluteUrl(personImageUrl);

    const endpoint = 'https://apihub.agnes-ai.com/v1/images/generations';
    const payload = {
      model: 'agnes-image-2.1-flash',
      prompt:
        "Virtual try-on: Fit the garment from the second image onto the person in the first image, seamlessly draping it onto their body while preserving the person's identity, facial features, posture, and background.",
      size: '1024x768',
      extra_body: {
        image: [absolutePersonUrl, absoluteGarmentUrl],
        response_format: 'url',
      },
    };

    let attempt = 0;
    const maxRetries = 3;
    let lastError: Error | null = null;
    let response: Response | null = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`Connection attempt ${attempt} to Agnes AI...`);

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            Connection: 'close',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(60000),
        });

        if (response.ok) {
          break;
        }

        const errorText = await response.text();
        let errorJson: { error?: { message?: string } | string } | undefined;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          /* ignore */
        }
        const nested = errorJson?.error;
        const errorMessage =
          (typeof nested === 'object' && nested?.message) ||
          (typeof nested === 'string' ? nested : undefined) ||
          errorText ||
          `HTTP error ${response.status}`;
        lastError = new Error(`Agnes AI API failed: ${errorMessage}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Attempt ${attempt} failed:`, message);
        lastError = err instanceof Error ? err : new Error(message);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
      }
    }

    if (!response || !response.ok) {
      return jsonFallback(
        garmentImageUrl,
        lastError?.message || 'Failed to retrieve try-on output from Agnes AI after multiple attempts.'
      );
    }

    const result = await response.json();
    const outputUrl = result?.data?.[0]?.url;

    if (!outputUrl) {
      return jsonFallback(
        garmentImageUrl,
        'Agnes AI returned a successful response, but no output image URL was found.',
        'agnes_no_output'
      );
    }

    logTryOnEvent({ outcome: 'ai_success' });
    return NextResponse.json(buildAiPayload(outputUrl), { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during the virtual try-on.';
    logTryOnEvent({ outcome: 'server_error', code: 'unexpected', message });
    console.error('Try-on API Route Error:', err);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
