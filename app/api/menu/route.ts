import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { menuItems as seedMenu } from '@/lib/mockData';
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

function toDto(doc: any): MenuItem {
  return {
    id: String(doc._id),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    priceLabel: doc.priceLabel,
    image: doc.image,
    category: doc.category,
    variants: doc.variants || [],
    offer: doc.offer,
  };
}

export async function GET() {
  const db = await getDb();
  const col = db.collection('menu_items');
  const count = await col.countDocuments();
  if (count === 0) {
    const seedDocs = seedMenu.map((item) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      priceLabel: item.priceLabel,
      image: item.image,
      category: item.category,
      variants: item.variants || [],
      createdAt: Date.now(),
    }));
    if (seedDocs.length > 0) await col.insertMany(seedDocs as any);
  }
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  const data: MenuItem[] = docs.map(toDto);
  return NextResponse.json<ApiResponse<MenuItem[]>>({ ok: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token || !(await getSessionByToken(token))) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    const body = (await req.json()) as Partial<MenuItem> & { offer?: Offer | null };
    const name = (body?.name || '').toString().trim();
    const description = (body?.description || '').toString().trim();
    const image = (body?.image || '').toString().trim();
    const category = (body?.category || '').toString().trim();
    const price = body?.price;
    const priceLabel = (body?.priceLabel || '').toString().trim();
    const variants = Array.isArray(body?.variants) ? body?.variants : [];
    const offer = normalizeOffer(body?.offer);

    if (!name || !description || !image) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: 'Name, description, and image are required' },
        { status: 400 },
      );
    }

    const doc = {
      name,
      description,
      image,
      category: category || 'Uncategorized',
      price: typeof price === 'number' ? price : undefined,
      priceLabel: priceLabel || undefined,
      variants,
      offer,
      createdAt: Date.now(),
    };

    const db = await getDb();
    const res = await db.collection('menu_items').insertOne(doc as any);
    const data: MenuItem = { ...doc, id: String(res.insertedId) } as MenuItem;
    return NextResponse.json<ApiResponse<MenuItem>>({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: e?.message || 'Failed to create item' },
      { status: 500 },
    );
  }
}
