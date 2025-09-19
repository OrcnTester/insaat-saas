import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const shifts = await prisma.shift.findMany({ where: { startAt: { gte: start } }, orderBy: { startAt: "desc" }});
  return NextResponse.json(shifts);
}

export async function POST(req: Request) {
  const { customerId, workerName, action } = await req.json();
  if (!customerId || !workerName || !action) return NextResponse.json({ error: "missing" }, { status: 400 });

  if (action === "start") {
    const s = await prisma.shift.create({ data: { customerId, workerName, startAt: new Date() } });
    return NextResponse.json(s, { status: 201 });
  }
  if (action === "stop") {
    const s = await prisma.shift.findFirst({ where: { customerId, workerName, endAt: null }, orderBy: { startAt: "desc" }});
    if (!s) return NextResponse.json({ error: "no-active-shift" }, { status: 404 });
    const u = await prisma.shift.update({ where: { id: s.id }, data: { endAt: new Date() }});
    return NextResponse.json(u);
  }
  return NextResponse.json({ error: "bad-action" }, { status: 400 });
}
