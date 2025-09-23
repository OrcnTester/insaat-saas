//src/app/api/orders/[id]/deliver/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAmount } from "@/lib/qty";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "not-found" }, { status: 404 });

  // Zaten teslimse tekrar artırma
  if (order.status === "delivered") {
    return NextResponse.json(order);
  }

  const { qty, unit } = parseAmount(order.amount || "");
  if (!qty || !unit) {
    return NextResponse.json({ error: "bad-amount" }, { status: 400 });
  }

  // Envanteri güncelle + hareket ekle
  const inv = await prisma.inventory.upsert({
    where: {
      customerId_material_unit: { customerId: order.customerId, material: order.material, unit },
    },
    create: { customerId: order.customerId, material: order.material, unit, qty: 0, minQty: 0 },
    update: {},
  });

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "delivered" } }),
    prisma.inventory.update({
      where: { id: inv.id },
      data: {
        qty: { increment: qty },
        movements: {
          create: {
            kind: "in",
            refType: "order",
            refId: order.id,
            qty,
            note: `Sipariş teslim: ${order.amount}`,
          },
        },
      },
    }),
  ]);

  const updated = await prisma.order.findUnique({ where: { id: order.id } });
  return NextResponse.json(updated);
}
