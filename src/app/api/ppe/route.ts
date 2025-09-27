export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.pPECheck.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json(rows);
  } catch (e:any) {
    console.error("GET /ppe", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let data:any; try { data = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
    if (!data?.customerId) return NextResponse.json({ error: "missing customerId" }, { status: 400 });
    const created = await prisma.pPECheck.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e:any) {
    console.error("POST /ppe", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}
