export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [orders, tasks, shifts] = await Promise.all([
      prisma.order.count(),
      prisma.task.count(),
      prisma.shift.count(),
    ]);
    return NextResponse.json({ openOrders: orders, tasks, openShifts: shifts });
  } catch (e:any) {
    console.error("GET /kpis", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}
