import { PrismaClient } from "@prisma/client";
import { parseAmount } from "../src/lib/qty"; // qty.ts eklemiştik ya, oradan

const prisma = new PrismaClient();

async function main() {
  // 1. Demo müşteri
  const customer = await prisma.customer.upsert({
    where: { id: "demo-small" },
    update: {},
    create: {
      id: "demo-small",
      name: "Demo İnşaat Ltd.",
      tier: "SMALL",
    },
  });

  // 2. Siparişler
  const order1 = await prisma.order.create({
    data: {
      customerId: customer.id,
      material: "Çimento (42,5R)",
      amount: "10 ton",
      supplier: "AYDINÇİM A.Ş.",
      eta: "Yarın 14:00",
      status: "ordered",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customer.id,
      material: "Tuğla",
      amount: "500 palet",
      supplier: "TUĞLASAN",
      eta: "Haftaya",
      status: "delivered",
    },
  });

  // 3. Finans hareketleri
  await prisma.transaction.createMany({
    data: [
      { customerId: customer.id, kind: "expense", title: "Çimento alımı", amountTL: 38500 },
      { customerId: customer.id, kind: "expense", title: "Tuğla alımı", amountTL: 120000 },
      { customerId: customer.id, kind: "income", title: "Avans Ödemesi", amountTL: 200000 },
    ],
  });

  // 4. Vardiya
  await prisma.shift.create({
    data: { customerId: customer.id, workerName: "Ali Usta", startAt: new Date() },
  });

  // 5. PPE kontrolü
  await prisma.pPECheck.create({
    data: { customerId: customer.id, helmet: true, harness: false, ok: false, note: "Kemer yok" },
  });

  // 6. Inventory + StockMove
  // order2 delivered olduğu için stok ekle
  const { qty, unit } = parseAmount(order2.amount);
  const inv = await prisma.inventory.upsert({
    where: {
      customerId_material_unit: { customerId: customer.id, material: order2.material, unit },
    },
    update: { qty },
    create: { customerId: customer.id, material: order2.material, unit, qty, minQty: 100 },
  });

  await prisma.stockMove.create({
    data: {
      inventoryId: inv.id,
      kind: "in",
      refType: "order",
      refId: order2.id,
      qty,
      note: "Seed: Tuğla siparişi teslim alındı",
    },
  });

  console.log("✅ Seed data yüklendi");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
