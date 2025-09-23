// src/app/api/tasks/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: any = {};

  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.assignee === "string" || body.assignee === null) data.assignee = body.assignee;
  if (typeof body.priority === "number") data.priority = body.priority;
  if (typeof body.note === "string" || body.note === null) data.note = body.note;
  if (typeof body.status === "string") data.status = body.status; // TODO/DOING/DONE
  if (typeof body.due === "string" || body.due === null) data.due = body.due ? new Date(body.due) : null;

  const updated = await prisma.task.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}
