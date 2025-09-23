// src/app/api/tasks/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { customerId, title, assignee, due, priority, note } = await req.json();
  if (!customerId || !title) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }
  const t = await prisma.task.create({
    data: {
      customerId,
      title,
      assignee: assignee ?? null,
      due: due ? new Date(due) : null,
      priority: typeof priority === "number" ? priority : 0,
      note: note ?? null,
    },
  });
  return NextResponse.json(t, { status: 201 });
}
