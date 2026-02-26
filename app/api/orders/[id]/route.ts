import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Order } from '@/lib/types';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  try {
    const db = await getDb();
    const idStr = id.trim();
    let _id: ObjectId | undefined;
    try {
      _id = new ObjectId(idStr);
    } catch {
      _id = undefined;
    }
    const doc =
      (await db
        .collection('orders')
        .findOne((_id ? { _id } : { _id: idStr }) as any)) ||
      (await db.collection('orders').findOne({ _id: idStr } as any));
    if (!doc) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Order not found' },
        { status: 404 },
      );
    }
    const order: Order = {
      id: String(doc._id),
      tableId: doc.tableId,
      items: doc.items,
      total: doc.total,
      status: doc.status,
      createdAt: doc.createdAt,
      verifiedAt: doc.verifiedAt,
      sentToKitchenAt: doc.sentToKitchenAt,
      acceptedAt: doc.acceptedAt,
      etaMinutes: doc.etaMinutes,
      billRequested: doc.billRequested,
      billRequestAccepted: doc.billRequestAccepted,
    };
    return NextResponse.json<ApiResponse<Order>>({ ok: true, data: order });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: 'Order not found' },
      { status: 404 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  try {
    const body = (await req.json()) as {
      action:
      | 'verify'
      | 'send_to_kitchen'
      | 'accept'
      | 'complete'
      | 'cancel'
      | 'reject'
      | 'request_bill'
      | 'accept_bill';
      etaMinutes?: number;
    };
    const db = await getDb();
    const idStr = id.trim();
    let _id: ObjectId | undefined;
    try {
      _id = new ObjectId(idStr);
    } catch {
      _id = undefined;
    }
    const now = Date.now();
    let set: any = {};
    if (body.action === 'verify') {
      set = { status: 'verified', verifiedAt: now };
    } else if (body.action === 'send_to_kitchen') {
      set = { status: 'kitchen_queue', sentToKitchenAt: now };
    } else if (body.action === 'accept') {
      set = {
        status: 'in_progress',
        acceptedAt: now,
        etaMinutes: typeof body.etaMinutes === 'number' ? body.etaMinutes : undefined,
      };
    } else if (body.action === 'complete') {
      set = { status: 'completed' };
    } else if (body.action === 'cancel') {
      set = { status: 'cancelled' };
    } else if (body.action === 'reject') {
      set = { status: 'rejected' };
    } else if (body.action === 'request_bill') {
      set = { billRequested: true };
    } else if (body.action === 'accept_bill') {
      set = { billRequestAccepted: true };
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Invalid action' },
        { status: 400 },
      );
    }
    const updatedDoc =
      (await db.collection('orders').findOneAndUpdate(
        (_id ? { _id } : { _id: idStr }) as any,
        { $set: set } as any,
        { returnDocument: 'after' } as any,
      )) ||
      (await db.collection('orders').findOneAndUpdate(
        { _id: idStr } as any,
        { $set: set } as any,
        { returnDocument: 'after' } as any,
      ));

    if (!updatedDoc) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Order not found' },
        { status: 404 },
      );
    }
    const order: Order = {
      id: String((updatedDoc as any)._id),
      tableId: (updatedDoc as any).tableId,
      items: (updatedDoc as any).items,
      total: (updatedDoc as any).total,
      status: (updatedDoc as any).status,
      createdAt: (updatedDoc as any).createdAt,
      verifiedAt: (updatedDoc as any).verifiedAt,
      sentToKitchenAt: (updatedDoc as any).sentToKitchenAt,
      acceptedAt: (updatedDoc as any).acceptedAt,
      etaMinutes: (updatedDoc as any).etaMinutes,
      billRequested: (updatedDoc as any).billRequested,
      billRequestAccepted: (updatedDoc as any).billRequestAccepted,
    };
    return NextResponse.json<ApiResponse<Order>>({ ok: true, data: order });
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
