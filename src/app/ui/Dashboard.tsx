// src/app/ui/Dashboard.tsx
"use client";
import { useEffect, useState } from "react";

type Finance = {
  expense: number;
  income: number;
  balance: number;
  txns: any[];
};
type Shift = { endAt?: string | null };

function asArray(x: any): any[] {
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  return [];
}
function asNumber(x: any, def = 0): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : def;
}
function asFinance(x: any): Finance {
  return {
    expense: asNumber(x?.expense, 0),
    income: asNumber(x?.income, 0),
    balance: asNumber(x?.balance, 0),
    txns: asArray(x?.txns),
  };
}
const isValidDate = (d: any) => d && !Number.isNaN(new Date(d).getTime());

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [finance, setFinance] = useState<Finance>({
    expense: 0,
    income: 0,
    balance: 0,
    txns: [],
  });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [inv, setInv] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  async function load() {
    try {
      const [o, f, s, i, t] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()).catch(() => []),
        fetch("/api/finance").then((r) => r.json()).catch(() => ({})),
        fetch("/api/shifts").then((r) => r.json()).catch(() => []),
        fetch("/api/inventory").then((r) => r.json()).catch(() => []),
        fetch("/api/tasks").then((r) => r.json()).catch(() => []),
      ]);
      setOrders(asArray(o));
      setFinance(asFinance(f));
      setShifts(asArray(s));
      setInv(asArray(i));
      setTasks(asArray(t));
    } catch {
      // sessiz geç
      setOrders([]);
      setFinance({ expense: 0, income: 0, balance: 0, txns: [] });
      setShifts([]);
      setInv([]);
      setTasks([]);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const critical = inv.filter(
    (x: any) => asNumber(x?.minQty) > 0 && asNumber(x?.qty) <= asNumber(x?.minQty)
  );
  const todoCount = tasks.filter((x: any) => x?.status === "TODO").length;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const pending = (t: any) => t?.status !== "DONE";

  const overdueList = tasks
    .filter(
      (t: any) => pending(t) && isValidDate(t?.due) && new Date(t.due) < startOfToday
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.due).getTime() - new Date(b.due).getTime()
    );

  // Render
  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">📊 Patron Dashboard</h2>

      <div className="grid md:grid-cols-4 gap-2">
        <div className="card p-3">
          <div className="text-sm opacity-70">Bugün Harcama</div>
          <div className="text-xl font-extrabold">
            {finance.expense.toLocaleString("tr-TR")} TL
          </div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Bugün Gelir</div>
          <div className="text-xl font-extrabold">
            {finance.income.toLocaleString("tr-TR")} TL
          </div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Aktif Vardiya</div>
          <div className="text-xl font-extrabold">
            {shifts.filter((s) => !s?.endAt).length}
          </div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Sipariş</div>
          <div className="text-xl font-extrabold">{orders.length}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-2 mt-2">
        <div className="card p-3">
          <div className="text-sm opacity-70">Kritik Stok</div>
          <div className="text-xl font-extrabold">{critical.length}</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Açık İş</div>
        <div className="text-xl font-extrabold">{todoCount}</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Geciken İş</div>
          <div className="text-xl font-extrabold text-rose-700">
            {overdueList.length}
          </div>
        </div>
      </div>

      {overdueList.length > 0 && (
        <div className="card p-3 mt-2">
          <div className="font-bold mb-2">⏰ Gecikenler (ilk 3)</div>
          <ul className="list-disc pl-5 space-y-1">
            {overdueList.slice(0, 3).map((t: any) => (
              <li key={t.id}>
                {t.title}{" "}
                <span className="text-xs opacity-70">
                  ({new Date(t.due).toLocaleDateString("tr-TR")})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="font-bold mb-2">Anlık Olaylar</div>
          <ul className="list-disc pl-5 space-y-1">
            {orders.slice(0, 5).map((o: any) => (
              <li key={o.id}>
                🧱 {o.material} — <b>{o.amount}</b>{" "}
                <span className="pill pill-ok ml-2">{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-3">
          <div className="font-bold mb-2">Finans Hareketleri</div>
          <ul className="space-y-1">
            {finance.txns.slice(0, 5).map((t: any) => (
              <li key={t.id} className="flex justify-between">
                <span>{t.kind === "expense" ? "⛔" : "✅"} {t.title}</span>
                <span className="font-bold">
                  {t.kind === "expense" ? "-" : "+"}
                  {asNumber(t.amountTL).toLocaleString("tr-TR")} TL
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
