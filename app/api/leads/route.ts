import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionByToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

interface LeadDto {
  id: string;
  phone: string;
  consent: boolean;
  createdAt?: number;
  lastSeenAt?: number;
  lastTableId?: string;
  visits?: number;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }
  const session = await getSessionByToken(token);
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const db = await getDb();
  const docs = await db
    .collection('leads')
    .find({})
    .sort({ lastSeenAt: -1, createdAt: -1 })
    .toArray();

  const data: LeadDto[] = docs.map((d: any) => ({
    id: String(d._id),
    phone: d.phone,
    consent: Boolean(d.consent),
    createdAt: d.createdAt,
    lastSeenAt: d.lastSeenAt,
    lastTableId: d.lastTableId,
    visits: d.visits || 1,
  }));

  return NextResponse.json<ApiResponse<LeadDto[]>>({ ok: true, data });
}
