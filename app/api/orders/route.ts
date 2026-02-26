import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Order, OrderItem } from '@/lib/types';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { GUEST_SESSION_COOKIE_NAME, getGuestSessionByToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any;
  const db = await getDb();
  const query: any = {};
  if (status) query.status = status;
  const docs = await db
    .collection('orders')
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
  const data: Order[] = docs.map((d: any) => ({
    id: String(d._id),
    tableId: d.tableId,
    items: d.items,
    total: d.total,
    status: d.status,
    createdAt: d.createdAt,
    verifiedAt: d.verifiedAt,
    sentToKitchenAt: d.sentToKitchenAt,
    acceptedAt: d.acceptedAt,
    etaMinutes: d.etaMinutes,
  }));
  return NextResponse.json<ApiResponse<Order[]>>({ ok: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      tableId: string;
      items: OrderItem[];
    };
    if (!body?.tableId || !Array.isArray(body?.items)) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Invalid payload' },
        { status: 400 },
      );
    }
    const token = req.cookies.get(GUEST_SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Session required' },
        { status: 401 },
      );
    }
    const session = await getGuestSessionByToken(token);
    if (!session || session.tableId !== body.tableId) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Invalid session' },
        { status: 401 },
      );
    }
    const total = body.items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0,
    );
    const now = Date.now();
    const db = await getDb();
    const doc = {
      tableId: body.tableId,
      items: body.items,
      total,
      status: 'pending_verification',
      createdAt: now,
    };
    const result = await db.collection('orders').insertOne(doc as any);
    const order: Order = {
      id: String(result.insertedId),
      tableId: body.tableId,
      items: body.items,
      total,
      status: 'pending_verification',
      createdAt: now,
    };
    return NextResponse.json<ApiResponse<Order>>(
      { ok: true, data: order },
      { status: 201 },
    );
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
