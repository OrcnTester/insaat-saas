import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAny, PANELS } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!requireAny(req, PANELS.finance)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const txns = await prisma.transaction.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const summary = txns.reduce(
      (acc, t) => {
        if (t.kind === 'expense') acc.expense += t.amountTL;
        else acc.income += t.amountTL;
        return acc;
      },
      { expense: 0, income: 0 }
    );
    const balance = summary.income - summary.expense;

    return NextResponse.json({ ...summary, balance, txns });
  } catch (e: any) {
    console.error('GET /finance', e);
    return NextResponse.json({ error: 'server', detail: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!requireAny(req, PANELS.finance)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { kind, title, amountTL, customerId } = body || {};
    if (!['expense','income'].includes(kind)) {
      return NextResponse.json({ error: 'invalid kind' }, { status: 400 });
    }
    if (!title || !amountTL) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }
    const created = await prisma.transaction.create({
      data: {
        customerId: customerId || 'demo-small',
        kind,
        title,
        amountTL: Number(amountTL),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e:any) {
    console.error('POST /finance', e);
    return NextResponse.json({ error: 'server', detail: e.message }, { status: 500 });
  }
}
