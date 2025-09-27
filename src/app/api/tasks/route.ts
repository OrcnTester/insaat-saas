// src/app/api/tasks/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAny, PANELS } from '@/lib/roles';
// yyyy-mm-dd → Date
function parseDue(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) return input;

  const s = String(input).trim();
  // yalnız gün verildiyse 00:00:00 ekle
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    // Yerel saat 00:00:00 (timezone kayması istemiyorsan 'T00:00:00' iyi)
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  try {
      if (!requireAny(req, PANELS.miniTasks)) {
      return NextResponse.json([], { status: 403 });
    }
    const rows = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET /api/tasks ERR:", e?.message);
    return NextResponse.json({ error: "server", detail: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    console.log("POST /api/tasks raw:", raw);
    const body = raw ? JSON.parse(raw) : {};

    const data = {
      customerId: String(body.customerId ?? "demo-small"),
      title: String(body.title ?? "").trim(),
      // UI’den geleni normalize et: OPEN gelirse TODO’ya çevir
      status: (["TODO", "DOING", "DONE"].includes(body.status) ? body.status : "TODO") as
        "TODO" | "DOING" | "DONE",
      assignee: body.assignee ?? null,
      due: parseDue(body.due),           // <-- KRİTİK DÖNÜŞÜM
      priority: Number(body.priority ?? 0),
      note: body.note ?? null,
    };

    if (!data.title) {
      return NextResponse.json({ error: "missing title" }, { status: 400 });
    }

    const created = await prisma.task.create({ data });
    console.log("POST /api/tasks created:", created.id);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/tasks ERR:", e?.message, e);
    return NextResponse.json({ error: "server", detail: e?.message }, { status: 500 });
  }
}
