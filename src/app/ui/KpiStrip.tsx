// src/app/ui/KpiStrip.tsx
export default function KpiStrip() {
  // DEMO değerler – sonra Prisma ile gerçek veriye bağlarız.
  const data = {
    activeSites: 3,   // Aktif Şantiye
    openOrders: 12,   // Açık Sipariş
    cashBalance: 84500, // Nakit Durumu (₺)
  };

  const fmt = new Intl.NumberFormat("tr-TR");

  const items = [
    { label: "Aktif Şantiye", value: fmt.format(data.activeSites), hint: "Bugün veri girişi olan şantiyeler" },
    { label: "Açık Sipariş", value: fmt.format(data.openOrders), hint: "Teslim edilmemiş / Onay bekleyen" },
    { label: "Nakit Durumu", value: `₺${fmt.format(data.cashBalance)}`, hint: "Gelir − Gider (son 7 gün)" },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">{it.label}</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{it.value}</div>
          <div className="mt-1 text-xs text-gray-400">{it.hint}</div>
        </div>
      ))}
    </section>
  );
}
