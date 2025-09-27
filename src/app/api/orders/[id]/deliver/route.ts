// src/app/api/orders/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET /orders", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => null);
    if (!data) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

    const required = ["customerId", "material", "amount", "supplier", "eta"];
    for (const k of required) {
      if (!data?.[k]) return NextResponse.json({ error: `missing ${k}` }, { status: 400 });
    }

    // eta DateTime ise string -> Date dönüştür (ISO string de kabul edilir ama garantiye alıyoruz)
    if (typeof data.eta === "string") {
      const d = new Date(data.eta);
      if (isNaN(d.valueOf())) {
        return NextResponse.json({ error: "invalid eta" }, { status: 400 });
      }
      data.eta = d;
    }

    const created = await prisma.order.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("POST /orders", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}
