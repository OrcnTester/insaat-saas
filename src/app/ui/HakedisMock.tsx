"use client";
import React from "react";

// ⚠️ MOCK/UI-ONLY: Bu bileşen gerçek veri kullanmaz.
// Sadece sütun ve satır başlıklarını, layout ve görsel hiyerarşiyi gösterir.
// Entegrasyon noktaları // TODO şeklinde işaretlenmiştir.

// ---- Tipler (ileride gerçek API modelleri ile değiştirilebilir) ----
type Money = string; // Örn: "₺0,00" (gösterim katmanı)

type IsKalemi = {
  aciklama: string;
  birimVeyaSaat: string;
  birimFiyat: Money;
  toplamTutar: Money;
  kategori?: "is" | "dusulecek";
};

type HarfiyatSatiri = {
  blokAdi: string;
  miktarM3: string; // "0,00"
  birimFiyat: Money | string; // "15" ya da "₺15,00"
  tutar: Money;
};

type HakedisSatiri = {
  no: string;
  aciklama: string;
  odemeTarihi: string; // ISO ya da dd.mm.yyyy
  odemeSekli: string;
  odenen: Money;
};

type GunlukIsSatiri = {
  tarih: string;
  aciklama: string;
  calismaSaati: string;
  birimFiyat: Money;
  tutar: Money;
};

type FinansOzet = {
  toplamTutarKdvsiz: Money;
  kdv: Money;
  genelTutarKdvdahil: Money;
  anlasilanTutar: Money;
  toplamOdenen: Money;
  kalanBakiye: Money;
  birimM3Kdvdahil?: Money;
  birimM3Kdvsiz?: Money;
};

// ---- MOCK DATA (Temsili, anonim) ----
const MOCK_PROJE = {
  projeAdi: "(Örnek) Şantiye A – Hafriyat ve Dolgu",
  tarihAraligi: "05–07/10/2022",
  notlar: [
    "Saha içi hafriyat birim fiyat (ör.)",
    "Anlaşma ve revizyon notları (ör.)",
  ],
};

const MOCK_IS_KALEMLERI: IsKalemi[] = [
  { aciklama: "Ekskavatör", birimVeyaSaat: "—", birimFiyat: "₺—", toplamTutar: "₺—", kategori: "is" },
  { aciklama: "Kamyon", birimVeyaSaat: "—", birimFiyat: "₺—", toplamTutar: "₺—", kategori: "is" },
  { aciklama: "Can Lojistik (düşülecek)", birimVeyaSaat: "—", birimFiyat: "₺—", toplamTutar: "₺—", kategori: "dusulecek" },
  { aciklama: "Mazot (düşülecek)", birimVeyaSaat: "—", birimFiyat: "₺—", toplamTutar: "₺—", kategori: "dusulecek" },
];

const MOCK_HARFIYAT: HarfiyatSatiri[] = [
  { blokAdi: "A", miktarM3: "—", birimFiyat: "—", tutar: "₺—" },
  { blokAdi: "B", miktarM3: "—", birimFiyat: "—", tutar: "₺—" },
  { blokAdi: "C", miktarM3: "—", birimFiyat: "—", tutar: "₺—" },
  { blokAdi: "D", miktarM3: "—", birimFiyat: "—", tutar: "₺—" },
  { blokAdi: "E", miktarM3: "—", birimFiyat: "—", tutar: "₺—" },
];

const MOCK_HAKEDIS: HakedisSatiri[] = [
  { no: "1", aciklama: "Blok Harfiyat (ör.)", odemeTarihi: "—", odemeSekli: "—", odenen: "₺—" },
  { no: "2", aciklama: "Dolgu (ör.)", odemeTarihi: "—", odemeSekli: "—", odenen: "₺—" },
  { no: "3", aciklama: "Kalan Bakiye (ör.)", odemeTarihi: "—", odemeSekli: "—", odenen: "₺—" },
];

const MOCK_GUNLUK_IS: GunlukIsSatiri[] = [
  { tarih: "—", aciklama: "Blok dolgu (ör.)", calismaSaati: "—", birimFiyat: "₺—", tutar: "₺—" },
  { tarih: "—", aciklama: "Kamyon sefer (ör.)", calismaSaati: "—", birimFiyat: "₺—", tutar: "₺—" },
  { tarih: "—", aciklama: "Nakliye (ör.)", calismaSaati: "—", birimFiyat: "₺—", tutar: "₺—" },
];

const MOCK_FINANS: FinansOzet = {
  toplamTutarKdvsiz: "₺—",
  kdv: "₺—",
  genelTutarKdvdahil: "₺—",
  anlasilanTutar: "₺—",
  toplamOdenen: "₺—",
  kalanBakiye: "₺—",
  birimM3Kdvdahil: "₺—",
  birimM3Kdvsiz: "₺—",
};

// ---- Yardımcı küçük UI parçaları ----
const Card: React.FC<React.PropsWithChildren<{ title?: string; subtitle?: string }>> = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {(title || subtitle) && (
      <div className="px-5 pt-4">
        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const Table: React.FC<React.PropsWithChildren<{ headers: string[] }>> = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
  </div>
);

// ---- Ana Bileşen ----
export default function InsaatSaasHakedisMock() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Başlık Kartı */}
      <Card title={MOCK_PROJE.projeAdi} subtitle={`Tarih Aralığı: ${MOCK_PROJE.tarihAraligi}`}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-medium text-slate-800">Anlaşma / Notlar</div>
            <ul className="mt-2 list-disc pl-5">
              {MOCK_PROJE.notlar.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="text-slate-500">Harﬁyat Toplam (ör.)</div>
              <div className="text-xl font-semibold text-slate-800">₺—</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <div className="text-slate-500">Anlaşılan Rakam (ör.)</div>
              <div className="text-xl font-semibold text-slate-800">₺—</div>
            </div>
          </div>
        </div>
      </Card>

      {/* İş Kalemleri & Düşülecekler */}
      <Card title="İş Kalemleri / Masraf Girişleri" subtitle="(Sadece başlıklar – örnek satırlar)">
        <Table headers={["Açıklama", "Birim/Saat", "Birim Fiyat", "Toplam Tutar"]}>
          {MOCK_IS_KALEMLERI.map((row, idx) => (
            <tr key={idx} className={row.kategori === "dusulecek" ? "bg-red-50/40" : ""}>
              <td className="px-3 py-2 text-sm text-slate-800">{row.aciklama}</td>
              <td className="px-3 py-2 text-sm text-slate-600">{row.birimVeyaSaat}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{row.birimFiyat}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{row.toplamTutar}</td>
            </tr>
          ))}
        </Table>
        {/* TODO: + İş kalemi ekle butonu, kategori filtresi, export */}
      </Card>

      {/* Harfiyat Tablosu */}
      <Card title="Harfiyat (Blok Bazlı)" subtitle="m³ ve birim fiyat sütunları">
        <Table headers={["Blok Adı", "Harfiyat Miktarı (m³)", "Birim Fiyat", "Tutar (TL)"]}>
          {MOCK_HARFIYAT.map((r, i) => (
            <tr key={i}>
              <td className="px-3 py-2 text-sm text-slate-800">{r.blokAdi}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{r.miktarM3}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{r.birimFiyat}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{r.tutar}</td>
            </tr>
          ))}
          {/* TOPLAM satırı (UI) */}
          <tr>
            <td className="px-3 py-2 text-sm font-medium text-slate-700">TOPLAM</td>
            <td className="px-3 py-2 text-sm tabular-nums">—</td>
            <td className="px-3 py-2 text-sm tabular-nums">—</td>
            <td className="px-3 py-2 text-sm tabular-nums">₺—</td>
          </tr>
        </Table>
        {/* TODO: TOPLAM hesapları (frontend) */}
      </Card>

      {/* Hakediş & Ödeme */}
      <Card title="Hakediş & Ödeme Takibi" subtitle="Ödeme tarihleri, şekli ve tutarlar">
        <Table headers={["Hakediş No", "Açıklama", "Ödeme Tarihi", "Ödeme Şekli", "Ödenen (TL)"]}>
          {MOCK_HAKEDIS.map((h) => (
            <tr key={h.no}>
              <td className="px-3 py-2 text-sm tabular-nums">{h.no}</td>
              <td className="px-3 py-2 text-sm">{h.aciklama}</td>
              <td className="px-3 py-2 text-sm">{h.odemeTarihi}</td>
              <td className="px-3 py-2 text-sm">{h.odemeSekli}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{h.odenen}</td>
            </tr>
          ))}
          <tr className="bg-slate-50">
            <td className="px-3 py-2 text-sm font-medium text-slate-700" colSpan={4}>Toplam Ödenen</td>
            <td className="px-3 py-2 text-sm tabular-nums">₺—</td>
          </tr>
          <tr className="bg-amber-50/60">
            <td className="px-3 py-2 text-sm font-medium text-slate-700" colSpan={4}>Kalan Bakiye</td>
            <td className="px-3 py-2 text-sm tabular-nums">₺—</td>
          </tr>
        </Table>
        {/* TODO: Ödeme ekle / banka dekontu link alanı */}
      </Card>

      {/* Günlük İş & Makine Kullanımı */}
      <Card title="Günlük İş / Makine Kullanımı" subtitle="Tarih bazlı kayıtlar">
        <Table headers={["Tarih", "Açıklama", "Çalıştığı Saat", "Birim Fiyat (TL)", "Tutar (TL)"]}>
          {MOCK_GUNLUK_IS.map((g, i) => (
            <tr key={i}>
              <td className="px-3 py-2 text-sm">{g.tarih}</td>
              <td className="px-3 py-2 text-sm">{g.aciklama}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{g.calismaSaati}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{g.birimFiyat}</td>
              <td className="px-3 py-2 text-sm tabular-nums">{g.tutar}</td>
            </tr>
          ))}
        </Table>
        {/* TODO: CSV/PDF dışa aktarım, hızlı filtreler */}
      </Card>

      {/* Finans Özeti */}
      <Card title="Finans Özeti" subtitle="KDV, Genel Toplam ve Anlaşılan Tutar">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-slate-500">Toplam Tutar (KDV Hariç)</div>
            <div className="text-xl font-semibold tabular-nums text-slate-800">{MOCK_FINANS.toplamTutarKdvsiz}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-slate-500">KDV</div>
            <div className="text-xl font-semibold tabular-nums text-slate-800">{MOCK_FINANS.kdv}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-slate-500">Genel Tutar (KDV Dahil)</div>
            <div className="text-xl font-semibold tabular-nums text-slate-800">{MOCK_FINANS.genelTutarKdvdahil}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="text-slate-500">Anlaşılan Tutar</div>
            <div className="text-xl font-semibold tabular-nums text-slate-800">{MOCK_FINANS.anlasilanTutar}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="text-slate-500">Toplam Ödenen</div>
            <div className="text-xl font-semibold tabular-nums text-slate-800">{MOCK_FINANS.toplamOdenen}</div>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <div className="text-slate-500">Kalan Bakiye</div>
            <div className="text-xl font-semibold tabular-nums text-slate-800">{MOCK_FINANS.kalanBakiye}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <div className="text-slate-500">Birim m³ (KDV Dahil)</div>
            <div className="text-base font-medium tabular-nums text-slate-800">{MOCK_FINANS.birimM3Kdvdahil}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <div className="text-slate-500">Birim m³ (KDV Hariç)</div>
            <div className="text-base font-medium tabular-nums text-slate-800">{MOCK_FINANS.birimM3Kdvsiz}</div>
          </div>
        </div>
        {/* TODO: Otomatik KDV hesap modu (oran seçimi), para formatlayıcı */}
      </Card>

      {/* Entegrasyon notları */}
      <Card title="Entegrasyon Notları">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Bu UI yalnızca sütun/satır başlıklarını gösterir; veriler API ile beslenecek.</li>
          <li>Gerçek veri bağlamak için üstteki MOCK_* dizilerini API sorgularıyla değiştirin. {/* TODO: fetch/RTK/React Query */}</li>
          <li>Para ve m³ değerleri için <code className="rounded bg-slate-100 px-1">tabular-nums</code> sınıfı ile hizalı görünüm sağlandı.</li>
          <li>Tablolara sıralama/filtreleme/export eklemek için uygun tablo kütüphanesi entegre edilebilir (ör. basit client-side).</li>
          <li>Sayfa, <strong>Tailwind</strong> dışında ek bağımlılık kullanmaz; doğrudan Next.js app router ile çalışır.</li>
        </ol>
      </Card>
    </div>
  );
}
