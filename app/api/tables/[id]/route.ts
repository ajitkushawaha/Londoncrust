import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import type { ApiResponse } from '@/lib/types';

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  try {
    const db = await getDb();
    const _id = new ObjectId(id);
    await db.collection('tables').deleteOne({ _id });
    return NextResponse.json<ApiResponse<null>>({ ok: true });
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

