import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { ApiResponse, Table } from '@/lib/types';

export async function GET() {
  const db = await getDb();
  const docs = await db
    .collection('tables')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  const data: Table[] = docs.map((d: any) => ({
    _id: String(d._id),
    number: d.number,
    createdAt: d.createdAt,
  }));
  return NextResponse.json<ApiResponse<Table[]>>({ ok: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { number: string };
    const number = (body?.number || '').toString().trim();
    if (!number) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Table number required' },
        { status: 400 },
      );
    }
    const db = await getDb();
    const exists = await db.collection('tables').findOne({ number });
    if (exists) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Table already exists' },
        { status: 409 },
      );
    }
    const now = Date.now();
    const res = await db
      .collection('tables')
      .insertOne({ number, active: true, createdAt: now });
    const data: Table = {
      _id: String(res.insertedId),
      number,
      createdAt: now,
    };
    return NextResponse.json<ApiResponse<Table>>({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

