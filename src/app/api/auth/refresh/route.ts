import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5241';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: accessToken || '',
        refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear invalid tokens
      const res = NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    // Extract new tokens
    const newAccessToken = data.value?.accessToken || data.value?.token || data.accessToken || data.token;
    const newRefreshToken = data.value?.refreshToken || data.refreshToken;

    if (!newAccessToken) {
      return NextResponse.json(
        { error: 'Invalid refresh response' },
        { status: 500 }
      );
    }

    // Update cookies with new tokens
    const res = NextResponse.json({ success: true });

    res.cookies.set('accessToken', newAccessToken, {
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
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
