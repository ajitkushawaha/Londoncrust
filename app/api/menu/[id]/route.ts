import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import type { ApiResponse, MenuItem, Offer } from '@/lib/types';
import { getSessionByToken, SESSION_COOKIE_NAME } from '@/lib/auth';

function normalizeOffer(input: any): Offer | undefined {
  if (!input || input.type === 'none') return undefined;
  const type = input.type as Offer['type'];
  const value = typeof input.value === 'number' ? input.value : Number(input.value || 0);
  const label = typeof input.label === 'string' ? input.label.trim() : undefined;
  if (type === 'bogo') return { type: 'bogo', label: label || 'BOGO' };
  if ((type === 'percent' || type === 'flat') && value > 0) {
    return { type, value, label };
  }
  return undefined;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token || !(await getSessionByToken(token))) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    const body = (await req.json()) as Partial<MenuItem> & { offer?: Offer | null };
    const updates: any = {};
    if (body?.name !== undefined) updates.name = String(body.name).trim();
    if (body?.description !== undefined) updates.description = String(body.description).trim();
    if (body?.image !== undefined) updates.image = String(body.image).trim();
    if (body?.category !== undefined) updates.category = String(body.category).trim() || 'Uncategorized';
    if (body?.price !== undefined) updates.price = body.price;
    if (body?.priceLabel !== undefined) updates.priceLabel = String(body.priceLabel).trim() || undefined;
    if (body?.variants !== undefined) updates.variants = Array.isArray(body.variants) ? body.variants : [];
    if (body?.offer !== undefined) updates.offer = normalizeOffer(body.offer);

    const db = await getDb();
    await db.collection('menu_items').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updates },
    );

    return NextResponse.json<ApiResponse<null>>({ ok: true });
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Failed to update item' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token || !(await getSessionByToken(token))) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    const db = await getDb();
    await db.collection('menu_items').deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json<ApiResponse<null>>({ ok: true });
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Failed to delete item' },
      { status: 500 },
    );
  }
}
