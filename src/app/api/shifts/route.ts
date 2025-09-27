import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAny, PANELS } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!requireAny(req, PANELS.shifts)) {
      return NextResponse.json([], { status: 403 });
    }
    const rows = await prisma.shift.findMany({
      orderBy: { startAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(rows);
  } catch (e:any) {
    console.error('GET /shifts', e);
    return NextResponse.json([], { status: 200 }); // UI patlamasın
  }
}

export async function POST(req: Request) {
  try {
    if (!requireAny(req, PANELS.shifts)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const { customerId='demo-small', workerName, action } = body || {};
    if (!workerName || !['start','stop'].includes(action)) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    if (action === 'start') {
      const created = await prisma.shift.create({ data: { customerId, workerName, startAt: new Date() }});
      return NextResponse.json(created, { status: 201 });
    } else {
      // Son açık vardiyayı kapat
      const last = await prisma.shift.findFirst({
        where: { workerName, endAt: null },
        orderBy: { startAt: 'desc' },
      });
      if (!last) return NextResponse.json({ ok: false });
      const updated = await prisma.shift.update({
        where: { id: last.id },
        data: { endAt: new Date() },
      });
      return NextResponse.json(updated);
    }
  } catch (e:any) {
    console.error('POST /shifts', e);
    return NextResponse.json({ error: 'server', detail: e.message }, { status: 500 });
  }
}
