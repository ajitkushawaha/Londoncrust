import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, deleteSession, getSessionCookieOptions } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) await deleteSession(token);
    const res = NextResponse.json<ApiResponse<null>>({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, '', { ...getSessionCookieOptions(), maxAge: 0 });
    return res;
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Logout failed' },
      { status: 500 },
    );
  }
}
