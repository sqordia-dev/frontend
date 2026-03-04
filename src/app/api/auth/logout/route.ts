import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5241';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Optionally notify backend about logout
    if (accessToken) {
      try {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // Ignore backend logout errors
      }
    }

    // Clear all auth cookies
    const res = NextResponse.json({ success: true });
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');

    return res;
  } catch (error) {
    console.error('Logout error:', error);

    // Even on error, clear cookies
    const res = NextResponse.json({ success: true });
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');

    return res;
  }
}
