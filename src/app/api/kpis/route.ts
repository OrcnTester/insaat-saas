// src/app/api/kpis/route.ts
import { NextResponse } from "next/server";

// TODO: Gerçek veriye bağlamak istersen Prisma ile örnek:
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const openOrders = await prisma.order.count({ where: { NOT: { status: "delivered" } } });
// const activeSites = await prisma.site.count({ where: { isActive: true } });
// const cashBalance = await prisma.finance.aggregate({ /* gelir-gider toplama */ });

export async function GET() {
  // Demo: hızlı görsel doğrulama için sabit değerler
  const payload = {
    activeSites: 3,
    openOrders: 12,
    cashBalance: 84500,
  };
  return NextResponse.json(payload);
}
