import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }});
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const { customerId, material, amount, supplier, eta } = await req.json();
  if (!customerId || !material || !amount) {
    return NextResponse.json({ error: "missing-fields" }, { status: 400 });
  }
  const order = await prisma.order.create({
    data: { customerId, material, amount, supplier: supplier ?? "", eta: eta ?? "" }
  });
  return NextResponse.json(order, { status: 201 });
}
