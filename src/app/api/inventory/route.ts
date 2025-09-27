import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAny, PANELS } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!requireAny(req, PANELS.inventory)) {
      return NextResponse.json([], { status: 403 });
    }
    const items = await prisma.inventory.findMany();
    return NextResponse.json(items);
  } catch (e) {
    console.error('GET /inventory', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    if (!requireAny(req, PANELS.inventory)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const b = await req.json();
    const customerId = b.customerId ?? 'demo-small';
    const material = String(b.material ?? '').trim();
    const unit = String(b.unit ?? '').trim();
    const qty = Number(b.qty ?? 0);
    const kind = String(b.refType ?? b.kind ?? 'manual').toLowerCase(); // usage|manual|out|in

    if (!material || !unit || !qty) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    const sign = (kind === 'usage' || kind === 'out') ? -1 : 1;

    const existing = await prisma.inventory.findFirst({
      where: { customerId, material, unit },
    });

    if (existing) {
      const updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: { qty: Number(existing.qty ?? 0) + sign * qty },
      });
      return NextResponse.json(updated, { status: 201 });
    }

    // yeni satır (DİKKAT: sadece modelde olan alanları yaz!)
    const created = await prisma.inventory.create({
      data: { customerId, material, unit, qty: sign * qty, minQty: 0 },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error('POST /inventory', e);
    return NextResponse.json({ error: 'server', detail: e.message }, { status: 500 });
  }
}
