// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { parseAmount } from "../src/lib/qty";

const prisma = new PrismaClient();

async function main() {
  // 1) Demo müşteri
  const customer = await prisma.customer.upsert({
    where: { id: "demo-small" },
    update: {},
    create: { id: "demo-small", name: "Demo İnşaat Ltd.", tier: "SMALL" },
  });

  // 2) Siparişler
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

  // 3) Finans hareketleri
  await prisma.transaction.createMany({
    data: [
      { customerId: customer.id, kind: "expense", title: "Çimento alımı", amountTL: 38500 },
      { customerId: customer.id, kind: "expense", title: "Tuğla alımı", amountTL: 120000 },
      { customerId: customer.id, kind: "income",  title: "Avans Ödemesi", amountTL: 200000 },
    ],
  });

  // 4) Vardiya
  await prisma.shift.create({
    data: { customerId: customer.id, workerName: "Ali Usta", startAt: new Date() },
  });

  // 5) PPE kontrolü
  await prisma.pPECheck.create({
    data: { customerId: customer.id, helmet: true, harness: false, ok: false, note: "Kemer yok" },
  });

  // 6) Inventory + StockMove: order2 delivered → Tuğla stoğu gir
  const { qty: qty2, unit: unit2 } = parseAmount(order2.amount);
  const invBrick = await prisma.inventory.upsert({
    where: { customerId_material_unit: { customerId: customer.id, material: order2.material, unit: unit2 } },
    update: { qty: qty2, minQty: 100 },
    create: { customerId: customer.id, material: order2.material, unit: unit2, qty: qty2, minQty: 100 },
  });
  await prisma.stockMove.create({
    data: {
      inventoryId: invBrick.id,
      kind: "in",
      refType: "order",
      refId: order2.id,
      qty: qty2,
      note: "Seed: Tuğla siparişi teslim alındı",
    },
  });

  // 6b) Kritik olmayan örnek: Taşyün
  await prisma.inventory.upsert({
    where: { customerId_material_unit: { customerId: customer.id, material: "Taşyün", unit: "bağ" } },
    update: { qty: 100, minQty: 0 },
    create: { customerId: customer.id, material: "Taşyün", unit: "bağ", qty: 100, minQty: 0 },
  });

  // 6c) 🔥 Kritik stok: Çimento (42,5R) ton → qty 3, min 5
  const invCement = await prisma.inventory.upsert({
    where: { customerId_material_unit: { customerId: customer.id, material: "Çimento (42,5R)", unit: "ton" } },
    update: { qty: 3, minQty: 5 },
    create: { customerId: customer.id, material: "Çimento (42,5R)", unit: "ton", qty: 3, minQty: 5 },
  });
  await prisma.stockMove.create({
    data: {
      inventoryId: invCement.id,
      kind: "in",
      refType: "seed",
      qty: 3,
      note: "Seed: başlangıç çimento stoğu (kritik seviyede)",
    },
  });

  // 7) Tasks — overdue / due-today / future / done
  await prisma.task.deleteMany({ where: { customerId: customer.id } });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = (daysFromToday: number, hour = 17) => {
    const dt = new Date(startOfToday);
    dt.setDate(dt.getDate() + daysFromToday);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  };

  await prisma.task.createMany({
    data: [
      { customerId: customer.id, title: "2. kat kaba sıva",        status: "TODO",  assignee: "Ali Usta",    due: due(-1, 17), priority: 3, note: "3 daire" },
      { customerId: customer.id, title: "Elektrik kablo çekimi",   status: "DOING", assignee: "Mehmet Usta", due: due(0, 18),  priority: 2 },
      { customerId: customer.id, title: "Merdiven korkuluk montajı", status: "TODO",  assignee: null,         due: due(2, 17),  priority: 1 },
      { customerId: customer.id, title: "Şantiye girişi düzenleme", status: "DONE",  assignee: "Veli Usta",   due: due(-3, 17), priority: 1 },
    ],
  });

  console.log("✅ Seed data yüklendi (kritik stok + tuğla stoğu + geciken/günlük görevler).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
