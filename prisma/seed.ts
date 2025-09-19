// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Temizle (geliştirme için)
  await prisma.transaction.deleteMany();
  await prisma.pPECheck.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  // Müşteriler
  const small = await prisma.customer.create({
    data: { id: "demo-small", name: "Anadolu İnşaat", tier: "SMALL" },
  });
  const mid = await prisma.customer.create({
    data: { id: "demo-mid", name: "Marmara Yapı", tier: "MID" },
  });
  const big = await prisma.customer.create({
    data: { id: "demo-big", name: "MegaProje A.Ş.", tier: "BIG" },
  });

  // Siparişler
  await prisma.order.createMany({
    data: [
      { customerId: small.id, material: "Çimento 42,5R", amount: "20 ton", supplier: "Aydınçim A.Ş.", eta: "Yarın 14:00" },
      { customerId: mid.id, material: "Demir Ø16", amount: "5 ton", supplier: "Ereğli Demir", eta: "2 gün sonra" },
      { customerId: big.id, material: "Tuğla", amount: "50 palet", supplier: "Kale Tuğla", eta: "1 hafta sonra" },
    ],
  });

  // Vardiyalar
  await prisma.shift.createMany({
    data: [
      { customerId: small.id, workerName: "Ali Usta", startAt: new Date(), endAt: null },
      { customerId: small.id, workerName: "Veli Kalfa", startAt: new Date(), endAt: null },
      { customerId: mid.id, workerName: "Ayşe İşçi", startAt: new Date(), endAt: new Date() },
    ],
  });

  // PPE Kontrolleri
  await prisma.pPECheck.createMany({
    data: [
      { customerId: small.id, helmet: true, harness: false, ok: false, note: "Kemer yoktu" },
      { customerId: mid.id, helmet: true, harness: true, ok: true },
      { customerId: big.id, helmet: false, harness: false, ok: false, note: "Tam korumasız" },
    ],
  });

  // Finansal hareketler
  await prisma.transaction.createMany({
    data: [
      { customerId: small.id, kind: "expense", title: "Çimento ödemesi", amountTL: 20000 },
      { customerId: small.id, kind: "income", title: "Daire satışı avansı", amountTL: 50000 },
      { customerId: mid.id, kind: "expense", title: "Demir alımı", amountTL: 30000 },
      { customerId: big.id, kind: "income", title: "Hakediş ödemesi", amountTL: 150000 },
    ],
  });
}

main()
  .then(() => {
    console.log("✅ Seed verisi eklendi");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
