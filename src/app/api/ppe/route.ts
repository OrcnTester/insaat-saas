import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { customerId, helmet, harness, note } = await req.json();
  if (!customerId) return NextResponse.json({ error: "missing" }, { status: 400 });

  const ok = Boolean(helmet) && Boolean(harness);
  const rec = await prisma.pPECheck.create({
    data: { customerId, helmet: !!helmet, harness: !!harness, ok, note }
  });
  return NextResponse.json(rec, { status: 201 });
}
