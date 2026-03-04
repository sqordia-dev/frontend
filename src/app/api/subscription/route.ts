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

    const response = await fetch(`${API_URL}/api/v1/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return free plan if no subscription found
      if (response.status === 404) {
        return NextResponse.json({ plan: 'free', status: 'active' });
      }
      const data = await response.json();
      return NextResponse.json(
        { error: data.error || data.message || 'Failed to fetch subscription' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const subscription = data.value || data;
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    // Return free plan on error
    return NextResponse.json({ plan: 'free', status: 'active' });
  }
}
