import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5241';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Login failed' },
        { status: response.status }
      );
    }

    // Extract tokens - handle both wrapped and direct response formats
    const accessToken = data.value?.accessToken || data.value?.token || data.accessToken || data.token;
    const refreshToken = data.value?.refreshToken || data.refreshToken;
    const user = data.value?.user || data.user;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Invalid server response' },
        { status: 500 }
      );
    }

    // Create response with user data
    const res = NextResponse.json({
      success: true,
      user,
    });

    // Set HTTP-only cookies for tokens
    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
