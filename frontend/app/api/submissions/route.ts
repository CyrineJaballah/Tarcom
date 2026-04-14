import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api-url';

const BACKEND_BASE_URL = getApiBaseUrl(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL);
export const dynamic = 'force-dynamic';

async function readPayload(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => ({}));
  }
  const text = await response.text().catch(() => '');
  return text ? { message: text } : {};
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await fetch(`${BACKEND_BASE_URL}/submissions`, {
      method: 'POST',
      body: formData,
    });

    const payload = await readPayload(response);
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const response = await fetch(`${BACKEND_BASE_URL}/submissions?${searchParams.toString()}`, {
      cache: 'no-store',
    });
    const payload = await readPayload(response);
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
