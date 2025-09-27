import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAny, PANELS } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!requireAny(req, PANELS.orders)) {
      return NextResponse.json([], { status: 403 });
    }
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error('GET /orders', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    if (!requireAny(req, PANELS.orders)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const b = await req.json();
    const data: any = {
      customerId: b.customerId ?? 'demo-small',
      material: String(b.material ?? '').trim(),
      amount: String(b.amount ?? '').trim(),
      supplier: String(b.supplier ?? '').trim(),
      status: String(b.status ?? 'PENDING').toUpperCase(),
    };

    // eta sadece GEÇERLİ ise ekle
    if (b.eta) {
      const d = new Date(b.eta);
      if (!Number.isNaN(d.getTime())) {
        data.eta = d;
      }
    }

    if (!data.material || !data.amount) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    const created = await prisma.order.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error('POST /orders', e);
    return NextResponse.json({ error: 'server', detail: e.message }, { status: 500 });
  }
}
