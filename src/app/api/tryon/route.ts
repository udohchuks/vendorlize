import { NextResponse } from 'next/server';

function getAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-hackathon.codedematrixtech.com';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

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

    const apiKey = process.env.AGNES_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      return NextResponse.json(
        { error: 'Agnes AI API Key (AGNES_API_KEY) is not configured. Please add it to your .env file.' },
        { status: 500, headers: corsHeaders }
      );
    }

    const absolutePersonUrl = getAbsoluteUrl(personImageUrl);
    const absoluteGarmentUrl = getAbsoluteUrl(garmentImageUrl);

    const endpoint = 'https://apihub.agnes-ai.com/v1/images/generations';
    const payload = {
      model: 'agnes-image-2.1-flash',
      prompt: 'Virtual try-on: Fit the garment from the second image onto the person in the first image, seamlessly draping it onto their body while preserving the person\'s identity, facial features, posture, and background.',
      size: '1024x768',
      extra_body: {
        image: [absolutePersonUrl, absoluteGarmentUrl],
        response_format: 'url',
      },
    };

    console.log('Sending request to Agnes AI image model...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {}
      const errorMessage = errorJson?.error?.message || errorJson?.error || errorText || `HTTP error ${response.status}`;
      throw new Error(`Agnes AI API failed: ${errorMessage}`);
    }

    const result = await response.json();
    const outputUrl = result?.data?.[0]?.url;

    if (!outputUrl) {
      throw new Error('Agnes AI returned a successful response, but no output image URL was found.');
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
