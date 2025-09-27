// src/app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAny, PANELS } from "@/lib/roles";

const parseDue = (v: unknown) => {
  if (!v) return null;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!requireAny(req, PANELS.miniTasks)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const body = await req.json();
    const data: any = {};

    if (typeof body.status === "string") data.status = body.status; // "TODO" | "DOING" | "DONE"
    if ("assignee" in body) data.assignee = body.assignee ?? null;
    if ("priority" in body) data.priority = Number(body.priority) || 0;
    if ("note" in body) data.note = body.note ?? null;
    if ("due" in body) data.due = parseDue(body.due);

    const updated = await prisma.task.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/tasks/[id]", e);
    return NextResponse.json({ error: "server", detail: e.message }, { status: 500 });
  }
}
