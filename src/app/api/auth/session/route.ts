import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5241';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify token with backend
    const response = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token is invalid, try to refresh
      const refreshToken = cookieStore.get('refreshToken')?.value;

      if (refreshToken) {
        const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: accessToken, refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.value?.accessToken || refreshData.accessToken || refreshData.token;
          const newRefreshToken = refreshData.value?.refreshToken || refreshData.refreshToken;

          // Update cookies
          const res = NextResponse.json({ user: refreshData.value?.user || refreshData.user });

          res.cookies.set('accessToken', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
          });

          if (newRefreshToken) {
            res.cookies.set('refreshToken', newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          }

          return res;
        }
      }

      // Clear invalid cookies
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    const data = await response.json();
    return NextResponse.json({ user: data.value || data });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null, error: 'Internal error' }, { status: 500 });
  }
}
