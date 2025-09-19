import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bu API içinde gereken minimal alanlar:
type Txn = { kind: "expense" | "income" | string; amountTL: number };

export async function GET() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Prisma dönüşünü minimal tipe daraltıyoruz
  const txns = (await prisma.transaction.findMany({
    where: { createdAt: { gte: start } },
    orderBy: { createdAt: "desc" },
    select: { kind: true, amountTL: true, id: true, title: true, createdAt: true }, // UI'de listeliyoruz
  })) as Txn[] & any[]; // reduce'da inference için

  const expense = txns
    .filter((t: Txn) => t.kind === "expense")
    .reduce((sum: number, t: Txn) => sum + t.amountTL, 0);

  const income = txns
    .filter((t: Txn) => t.kind === "income")
    .reduce((sum: number, t: Txn) => sum + t.amountTL, 0);

  return NextResponse.json({ expense, income, balance: income - expense, txns });
}

export async function POST(req: Request) {
  const { customerId, kind, title, amountTL } = await req.json();
  if (!customerId || !kind || !title || typeof amountTL !== "number") {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const t = await prisma.transaction.create({
    data: { customerId, kind, title, amountTL },
    select: { id: true, customerId: true, kind: true, title: true, amountTL: true, createdAt: true },
  });

  return NextResponse.json(t, { status: 201 });
}
