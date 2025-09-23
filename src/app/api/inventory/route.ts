//src/app/api/inventory/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.inventory.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(items);
}

// Manuel giriş/çıkış veya "usage" (sahada tüketim) için:
export async function POST(req: Request) {
  const { customerId, material, unit, qty, kind, note, refType } = await req.json();
  if (!customerId || !material || !unit || !qty || !kind) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  // Envanter kaydı yoksa oluştur
  const inv = await prisma.inventory.upsert({
    where: { customerId_material_unit: { customerId, material, unit } },
    update: {},
    create: { customerId, material, unit, qty: 0, minQty: 0 },
  });

  const delta = kind === "in" ? Number(qty) : -Number(qty);
  const updated = await prisma.inventory.update({
    where: { id: inv.id },
    data: {
      qty: { increment: delta },
      movements: {
        create: {
          kind,
          refType: refType ?? "manual",
          qty: Math.abs(Number(qty)),
          note,
        },
      },
    },
    include: { movements: false },
  });

  return NextResponse.json(updated, { status: 201 });
}
