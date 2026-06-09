import { NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export async function POST(request: Request) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { personImageUrl, garmentImageUrl } = await request.json();

    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: 'Missing personImageUrl or garmentImageUrl' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse person image blob (handle data URIs or external URLs)
    let personBlob: Blob;
    if (personImageUrl.startsWith('data:')) {
      const match = personImageUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) {
        throw new Error('Invalid personImageUrl Data URL format');
      }
      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      personBlob = new Blob([buffer], { type: mimeType });
    } else {
      const personResponse = await fetch(personImageUrl);
      personBlob = await personResponse.blob();
    }

    // Parse garment image blob (handle data URIs or external URLs)
    let garmentBlob: Blob;
    if (garmentImageUrl.startsWith('data:')) {
      const match = garmentImageUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) {
        throw new Error('Invalid garmentImageUrl Data URL format');
      }
      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      garmentBlob = new Blob([buffer], { type: mimeType });
    } else {
      const garmentResponse = await fetch(garmentImageUrl);
      garmentBlob = await garmentResponse.blob();
    }

    let outputUrl = '';

    // Step 1: Attempt to connect to zhengchong/CatVTON (requested by user)
    try {
      console.log('Attempting connection to zhengchong/CatVTON...');
      const client = await Client.connect('zhengchong/CatVTON', {
        token: process.env.HF_TOKEN as any,
      });
      const result = await client.predict('/submit_function', {
        person_image: {
          background: personBlob,
          layers: [],
          composite: null,
        },
        cloth_image: garmentBlob,
        cloth_type: 'overall',
        num_inference_steps: 50,
        guidance_scale: 2.5,
        seed: 42,
        show_type: 'result only',
      }) as any;

      if (result.data && result.data[0]) {
        outputUrl = result.data[0].url || result.data[0].path || '';
      }
    } catch (catVtonError) {
      console.warn('zhengchong/CatVTON is offline or failed. Falling back to yisol/IDM-VTON...', catVtonError);

      // Step 2: Fallback to running yisol/IDM-VTON space
      const client = await Client.connect('yisol/IDM-VTON', {
        token: process.env.HF_TOKEN as any,
      });
      const result = await client.predict('/tryon', {
        dict: {
          background: personBlob,
          layers: [],
          composite: null,
        },
        garm_img: garmentBlob,
        garment_des: 'clothing item',
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      }) as any;

      if (result.data && result.data[0]) {
        outputUrl = result.data[0].url || result.data[0].path || '';
      }
    }

    if (!outputUrl) {
      throw new Error('Failed to retrieve try-on output URL from Hugging Face Gradio client.');
    }

    return NextResponse.json({ output: outputUrl }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error('Try-on API Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during the virtual try-on.' },
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
