import { NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { Blob } from 'buffer';

export async function POST(request: Request) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { personImageUrl, garmentImageUrl, clothType } = await request.json();

    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: 'Missing personImageUrl or garmentImageUrl' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Hugging Face token is optional for public Spaces, but improves reliability/rate limits.
    // Support a few common env var names.
    const hfToken: string =
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_TOKEN ||
      process.env.HF_ACCESS_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN ||
      '';
    type ConnectOptions = Parameters<typeof Client.connect>[1];
    const connectOpts: ConnectOptions = hfToken ? { token: hfToken as `hf_${string}` } : undefined;

    const loadBlob = async (u: string, label: string): Promise<Blob> => {
      if (typeof u !== 'string' || u.length === 0) {
        throw new Error(`Missing ${label} URL`);
      }

      // Data URL (base64)
      if (u.startsWith('data:')) {
        const match = u.match(/^data:(.*?);base64,(.*)$/);
        if (!match) throw new Error(`Invalid ${label} data URL format`);
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        return new Blob([buffer], { type: mimeType });
      }

      // Remote or local absolute URL (e.g. http://127.0.0.1:3000/images/...)
      const resp = await fetch(u);
      if (!resp.ok) {
        throw new Error(`Failed to fetch ${label} (${resp.status})`);
      }
      const arrayBuffer = await resp.arrayBuffer();
      const contentType = resp.headers.get('content-type') || 'application/octet-stream';
      return new Blob([arrayBuffer], { type: contentType });
    };

    const personBlob = await loadBlob(personImageUrl, 'personImageUrl');
    const garmentBlob = await loadBlob(garmentImageUrl, 'garmentImageUrl');
    // Many Spaces infer output format from filenames. Use .png to avoid JPEG alpha issues.
    const personFile = new File([await personBlob.arrayBuffer()], 'person.png', {
      type: 'image/png',
    });
    const garmentFile = new File([await garmentBlob.arrayBuffer()], 'garment.png', {
      type: 'image/png',
    });

    let outputUrl = '';

    const extractFirstUrl = (resultData: unknown): string => {
      // Gradio JS client usually returns an array of outputs (one per component),
      // but some Spaces may return a single object directly.
      const tryExtract = (value: unknown): string => {
        if (!value || typeof value !== 'object') return '';
        const rec = value as Record<string, unknown>;
        const url = rec.url;
        const path = rec.path;
        if (typeof url === 'string') return url;
        if (typeof path === 'string') return path;
        return '';
      };

      if (Array.isArray(resultData)) {
        if (resultData.length === 0) return '';
        return tryExtract(resultData[0]);
      }

      return tryExtract(resultData);
    };

    // Step 1: Attempt to connect to zhengchong/CatVTON (requested by user)
    try {
      console.log('Attempting connection to zhengchong/CatVTON...');
      const client = await Client.connect('zhengchong/CatVTON', connectOpts);
      // CatVTON exposes /submit_function, not /tryon.
      // See: client.view_api().named_endpoints keys.
      const normalizedClothType =
        clothType === 'lower' || clothType === 'overall' ? clothType : 'upper';
      const result = await client.predict('/submit_function', {
        person_image: {
          background: personFile,
          layers: [],
          composite: null,
        },
        cloth_image: garmentFile,
        cloth_type: normalizedClothType,
        num_inference_steps: 30,
        guidance_scale: 2.5,
        seed: 42,
        show_type: 'result only',
      });

      outputUrl = extractFirstUrl(result.data);
    } catch (catVtonError) {
      const catMsg =
        catVtonError instanceof Error
          ? catVtonError.message
          : typeof catVtonError === 'string'
            ? catVtonError
            : (() => {
                try {
                  return JSON.stringify(catVtonError);
                } catch {
                  return String(catVtonError);
                }
              })();
      console.warn(`zhengchong/CatVTON failed (${catMsg}). Falling back to yisol/IDM-VTON...`);

      // Step 2: Fallback to running yisol/IDM-VTON space
      const client = await Client.connect('yisol/IDM-VTON', connectOpts);
      const result = await client.predict('/tryon', {
        dict: {
          background: personFile,
          layers: [],
          composite: null,
        },
        garm_img: garmentFile,
        garment_des: 'clothing item',
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      });

      outputUrl = extractFirstUrl(result.data);
    }

    if (!outputUrl) {
      throw new Error('Failed to retrieve try-on output URL from Hugging Face Gradio client.');
    }

    return NextResponse.json({ output: outputUrl }, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    console.error('Try-on API Route Error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : (() => {
                  try {
                    return JSON.stringify(err);
                  } catch {
                    return 'An unexpected error occurred during the virtual try-on.';
                  }
                })(),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
