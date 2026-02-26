import { NextRequest, NextResponse } from 'next/server';
import {
  createGuestSession,
  GUEST_SESSION_COOKIE_NAME,
  getGuestSessionCookieOptions,
} from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';
import { getDb } from '@/lib/db';

function normalizePhone(value: string) {
  return value.replace(/\s+/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      tableId?: string;
      phone?: string;
      consent?: boolean;
    };
    const tableId = (body?.tableId || '').toString().trim();
    const rawPhone = (body?.phone || '').toString().trim();
    const phone = normalizePhone(rawPhone);
    const consent = Boolean(body?.consent);

    if (!tableId || !phone) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Table ID and mobile number are required' },
        { status: 400 },
      );
    }

    if (phone.length < 6 || phone.length > 15) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Enter a valid mobile number' },
        { status: 400 },
      );
    }

    const session = await createGuestSession(tableId, phone, consent);
    const db = await getDb();
    await db.collection('leads').updateOne(
      { phone },
      {
        $set: {
          phone,
          consent,
          lastSeenAt: Date.now(),
          lastTableId: tableId,
        },
        $setOnInsert: { createdAt: Date.now() },
      },
      { upsert: true },
    );
    const res = NextResponse.json<ApiResponse<null>>({ ok: true });
    res.cookies.set(
      GUEST_SESSION_COOKIE_NAME,
      session.token,
      getGuestSessionCookieOptions(),
    );
    return res;
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Failed to start session' },
      { status: 500 },
    );
  }
}
