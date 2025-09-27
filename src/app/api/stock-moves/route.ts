//src/app/api/stock-moves/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.stockMove.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json(rows);
  } catch (e:any) {
    console.error("GET /stock-moves", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let data:any; try { data = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
    if (!data?.inventoryId) return NextResponse.json({ error: "missing inventoryId" }, { status: 400 });
    if (typeof data?.delta !== "number") return NextResponse.json({ error: "missing/invalid delta" }, { status: 400 });

    const created = await prisma.stockMove.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e:any) {
    console.error("POST /stock-moves", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}
