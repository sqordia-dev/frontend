import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5241';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/v1/invoices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return empty array if no invoices found
      if (response.status === 404) {
        return NextResponse.json({ invoices: [] });
      }
      const data = await response.json();
      return NextResponse.json(
        { error: data.error || data.message || 'Failed to fetch invoices' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const invoices = data.value || data;
    return NextResponse.json({ invoices: Array.isArray(invoices) ? invoices : [] });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json({ invoices: [] });
  }
}
