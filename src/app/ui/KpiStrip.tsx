// src/app/ui/KpiStrip.tsx
"use client";
import { useEffect, useState } from "react";

type FinanceSummary = { expense: number; income: number; balance: number };
type Order = { status?: string };
type Shift = { customerId?: string; startAt?: string; endAt?: string };

const fmt = new Intl.NumberFormat("tr-TR");

export default function KpiStrip({ role = "patron" }: { role?: string }) {
  const [activeSites, setActiveSites] = useState(0);
  const [openOrders, setOpenOrders] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    // Patron değilse sıfırla ve çık
    if (role !== "patron") {
      setActiveSites(0);
      setOpenOrders(0);
      setCashBalance(0);
      return;
    }

    const q = `?role=${role}`; // guard’lar rol paramı bekliyor
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startMs = start.getTime();

    (async () => {
      try {
        // Finans
        const fRes = await fetch(`/api/finance${q}`, { cache: "no-store" });
        const fJson: Partial<FinanceSummary> = fRes.ok ? await fRes.json() : {};
        setCashBalance(Number(fJson?.balance ?? 0));

        // Siparişler
        const oRes = await fetch(`/api/orders${q}`, { cache: "no-store" });
        const orders: Order[] = oRes.ok ? await oRes.json() : [];
        const open = orders.filter((o) => {
          const st = (o.status ?? "PENDING").toUpperCase();
          return st !== "DELIVERED" && st !== "DONE" && st !== "CANCELLED";
        }).length;
        setOpenOrders(open);

        // Vardiyalar
        const sRes = await fetch(`/api/shifts${q}`, { cache: "no-store" });
        const shifts: Shift[] = sRes.ok ? await sRes.json() : [];
        const siteSet = new Set<string>();
        for (const s of shifts) {
          const started = s?.startAt ? new Date(s.startAt).getTime() : NaN;
          const isToday = Number.isFinite(started) && started >= startMs;
          const isActive = !s?.endAt;
          if ((isActive || isToday) && s?.customerId) siteSet.add(s.customerId);
        }
        setActiveSites(siteSet.size);
      } catch {
        // sessiz düş
        setActiveSites(0);
        setOpenOrders(0);
        setCashBalance(0);
      }
    })();
  }, [role]); // 👈 rol değişince yeniden çalış

  if (role !== "patron") return null;

  const items = [
    { label: "Aktif Şantiye", value: fmt.format(activeSites), hint: "Bugün veri girişi olan şantiyeler" },
    { label: "Açık Sipariş", value: fmt.format(openOrders), hint: "Teslim edilmemiş / Onay bekleyen" },
    { label: "Nakit Durumu", value: `₺${fmt.format(cashBalance)}`, hint: "Gelir − Gider (bugün)" },
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
