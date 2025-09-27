import { PrismaClient, Tier, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Temiz başla (ilişkili tablolarda sıralama önemli)
  await prisma.stockMove.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.pPECheck.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.task.deleteMany();
  await prisma.customer.deleteMany();

  // -------- Customers
  const cSmall = await prisma.customer.create({
    data: { id: "demo-small", name: "Demo İnşaat - Küçük", tier: Tier.SMALL },
  });
  const cMid = await prisma.customer.create({
    data: { id: "demo-mid", name: "Demonstrasyon A.Ş. - Orta", tier: Tier.MID },
  });
  const cBig = await prisma.customer.create({
    data: { id: "demo-big", name: "Mega İnşaat - Büyük", tier: Tier.BIG },
  });

  // -------- Tasks (küçük müşteri ağırlıklı)
  await prisma.task.createMany({
    data: [
      {
        customerId: cSmall.id,
        title: "Şantiye giriş kapısı tamiri",
        status: TaskStatus.TODO,
        priority: 2,
        due: addDays(0, 17), // bugün 17:00
        assignee: "Ali Usta",
      },
      {
        customerId: cSmall.id,
        title: "Elektrik panosu etiketleme",
        status: TaskStatus.DOING,
        priority: 1,
        due: addDays(1, 12),
        assignee: "Mehmet",
      },
      {
        customerId: cSmall.id,
        title: "Beton döküm alanı kontrolü",
        status: TaskStatus.DONE,
        priority: 0,
        due: addDays(-1, 15),
        assignee: "Ayşe",
      },
      {
        customerId: cMid.id,
        title: "Malzeme sayımı",
        status: TaskStatus.TODO,
        priority: 1,
        due: addDays(2, 10),
      },
    ],
  });

  // -------- Transactions (gelir/gider)
  await prisma.transaction.createMany({
    data: [
      // demo-small (senin örneklerle uyumlu)
      {
        customerId: cSmall.id,
        kind: "expense",
        title: "Çimento",
        amountTL: 38500,
      },
      {
        customerId: cSmall.id,
        kind: "income",
        title: "Daire Avans",
        amountTL: 500000,
      },
      // diğer müşteriler
      {
        customerId: cMid.id,
        kind: "expense",
        title: "Demir (12mm)",
        amountTL: 92000,
      },
      {
        customerId: cBig.id,
        kind: "income",
        title: "Hakediş",
        amountTL: 1250000,
      },
    ],
  });

  // -------- Orders (eta -> Date objesi, statüler uppercase/open mantığına uygun)
  await prisma.order.createMany({
    data: [
      {
        customerId: cSmall.id,
        material: "C25 Beton",
        amount: "15m³",
        supplier: "XYZ Hazır Beton",
        eta: addHours(2), // 2 saat sonra
        status: "PENDING",
      },
      {
        customerId: cSmall.id,
        material: "Tuğla (yüksek delikli)",
        amount: "2 palet",
        supplier: "Tuğla A.Ş.",
        eta: addHours(-5),
        status: "DELIVERED",
      },
      {
        customerId: cMid.id,
        material: "Demir Ø12",
        amount: "4 ton",
        supplier: "DemirSan",
        eta: addHours(6),
        status: "PENDING",
      },
    ],
  });

  // -------- Shifts (bir tanesi aktif)
  await prisma.shift.createMany({
    data: [
      {
        customerId: cSmall.id,
        workerName: "Ali Usta",
        startAt: addHours(-3),
        // endAt yok -> aktif
      } as any,
      {
        customerId: cSmall.id,
        workerName: "Mehmet",
        startAt: addHours(-6),
        endAt: addHours(-2),
      },
      {
        customerId: cMid.id,
        workerName: "Ayşe",
        startAt: addHours(-1),
        // aktif
      } as any,
    ],
  });

  // -------- PPE Checks
  await prisma.pPECheck.createMany({
    data: [
      {
        customerId: cSmall.id,
        helmet: true,
        harness: true,
        ok: true,
        note: "Girişte kontrol edildi.",
      },
      {
        customerId: cSmall.id,
        helmet: true,
        harness: false,
        ok: false,
        note: "Yüksekte çalışma için uyarıldı.",
      },
      {
        customerId: cMid.id,
        helmet: true,
        harness: true,
        ok: true,
      },
    ],
  });

  // -------- Inventories + StockMoves (qty ile tutarlı)
  // Çimento (42,5R) — torba: 500 giriş, 50 çıkış -> qty 450
  const invCement = await prisma.inventory.create({
    data: {
      customerId: cSmall.id,
      material: "Çimento (42,5R)",
      unit: "torba",
      minQty: 100,
      qty: 450,
    },
  });
  await prisma.stockMove.createMany({
    data: [
      {
        inventoryId: invCement.id,
        kind: "in",
        refType: "manual",
        qty: 500,
        note: "Başlangıç stok",
      },
      {
        inventoryId: invCement.id,
        kind: "out",
        refType: "usage",
        qty: 50,
        note: "Şantiye tüketim",
      },
    ],
  });

  // Alçı — torba: 250 giriş -> qty 250
  const invAlci = await prisma.inventory.create({
    data: {
      customerId: cSmall.id,
      material: "alçı",
      unit: "torba",
      minQty: 50,
      qty: 250,
    },
  });
  await prisma.stockMove.create({
    data: {
      inventoryId: invAlci.id,
      kind: "in",
      refType: "manual",
      qty: 250,
      note: "Sevkiyat 001",
    },
  });

  // Orta müşteri — Demir — ton: 4 giriş -> qty 4
  const invDemir = await prisma.inventory.create({
    data: {
      customerId: cMid.id,
      material: "Demir",
      unit: "ton",
      minQty: 2,
      qty: 4,
    },
  });
  await prisma.stockMove.create({
    data: {
      inventoryId: invDemir.id,
      kind: "in",
      refType: "order",
      qty: 4,
      note: "İrsaliye #A-102",
    },
  });

  // Büyük müşteri — Tuğla — palet: 3 giriş, 1 çıkış -> qty 2
  const invTugla = await prisma.inventory.create({
    data: {
      customerId: cBig.id,
      material: "Tuğla",
      unit: "palet",
      minQty: 1,
      qty: 2,
    },
  });
  await prisma.stockMove.createMany({
    data: [
      { inventoryId: invTugla.id, kind: "in", refType: "manual", qty: 3 },
      { inventoryId: invTugla.id, kind: "out", refType: "usage", qty: 1 },
    ],
  });

  console.log("✅ Seed tamam.");
}

function addHours(h: number) {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d;
}
function addDays(days: number, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

main()
  .catch((e) => {
    console.error("❌ Seed hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
