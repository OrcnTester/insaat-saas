export default function PricingPage() {
  const features = [
    { key: "orders", label: "Sipariş & Malzeme Takibi" },
    { key: "shifts", label: "Vardiya & Personel" },
    { key: "ppe", label: "İSG / PPE Envanteri" },
    { key: "finance", label: "Finans & Nakit Akışı" },
    { key: "inventory", label: "Stok / Depo" },
    { key: "qr", label: "QR ile İş Emri & Mobil Okuma" },
    { key: "reports", label: "Raporlar & İhracat (CSV/PDF)" },
    { key: "multiSite", label: "Çoklu Şantiye Yönetimi" },
    { key: "roles", label: "Rol Bazlı Yetki / Onay Akışı" },
    { key: "integrations", label: "Muhasebe/ERP Entegrasyonları" },
    { key: "sla", label: "Öncelikli Destek & SLA" },
  ];

  const plans = [
    {
      id: "classic",
      name: "Classic",
      price: "₺",
      tag: "Başlangıç",
      includes: {
        orders: true,
        shifts: true,
        ppe: true,
        finance: false,
        inventory: false,
        qr: false,
        reports: true,
        multiSite: false,
        roles: false,
        integrations: false,
        sla: false,
      },
    },
    {
      id: "avantgarde",
      name: "Avantgarde",
      price: "₺₺",
      tag: "Büyüyen Ekip",
      includes: {
        orders: true,
        shifts: true,
        ppe: true,
        finance: true,
        inventory: true,
        qr: true,
        reports: true,
        multiSite: true,
        roles: true,
        integrations: false,
        sla: false,
      },
    },
    {
      id: "amg",
      name: "AMG",
      price: "₺₺₺",
      tag: "Kurumsal",
      includes: {
        orders: true,
        shifts: true,
        ppe: true,
        finance: true,
        inventory: true,
        qr: true,
        reports: true,
        multiSite: true,
        roles: true,
        integrations: true,
        sla: true,
      },
    },
  ] as const;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold">Üyelik Planları</h1>
        <p className="text-gray-600 mt-2">Classic • Avantgarde • AMG</p>
      </header>

      {/* Kartlar */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.id} className="rounded-2xl border shadow-sm p-6 bg-white">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold">{p.name}</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{p.tag}</span>
            </div>
            <div className="text-gray-500 mt-1">{p.price} / ay</div>

            <ul className="mt-4 space-y-2 text-sm">
              {features.map(f => (
                <li key={f.key} className="flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${p.includes[f.key as keyof typeof p.includes] ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                    {p.includes[f.key as keyof typeof p.includes] ? "✓" : "–"}
                  </span>
                  <span className={p.includes[f.key as keyof typeof p.includes] ? "" : "text-gray-400 line-through"}>{f.label}</span>
                </li>
              ))}
            </ul>

            <a
              href={`/signup?plan=${p.id}`}
              className="mt-6 inline-flex w-full justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Bu planla başla
            </a>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        Fiyatlar örnek gösterim amaçlıdır. Kurumsal entegrasyonlar için <a className="text-emerald-700 underline" href="/contact">iletişime geçin</a>.
      </p>
    </main>
  );
}
