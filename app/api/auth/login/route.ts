import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  createSession,
  ensureDefaultAdmin,
  getSessionCookieOptions,
  verifyUserPassword,
} from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body?.username || '').toString().trim();
    const password = (body?.password || '').toString();

    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Username and password are required' },
        { status: 400 },
      );
    }

    await ensureDefaultAdmin();
    const user = await verifyUserPassword(username, password);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    const session = await createSession(user._id);
    const res = NextResponse.json<ApiResponse<null>>({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, session.token, getSessionCookieOptions());
    return res;
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Login failed' },
      { status: 500 },
    );
  }
}
