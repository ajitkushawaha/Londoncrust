import { NextRequest, NextResponse } from 'next/server';
import { GUEST_SESSION_COOKIE_NAME, getGuestSessionByToken } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableId = (searchParams.get('tableId') || '').trim();
  const token = req.cookies.get(GUEST_SESSION_COOKIE_NAME)?.value;
  if (!tableId || !token) {
    return NextResponse.json<ApiResponse<{ valid: boolean }>>({
      ok: true,
      data: { valid: false },
    });
  }
  const session = await getGuestSessionByToken(token);
  const valid = !!session && session.tableId === tableId;
  return NextResponse.json<ApiResponse<{ valid: boolean }>>({
    ok: true,
    data: { valid },
  });
}
