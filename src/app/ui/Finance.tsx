// src/app/ui/Finance.tsx
"use client";
import { useEffect, useState } from "react";

type Txn = { id?: string; kind: "expense" | "income"; title: string; amountTL: number };
type Summary = { expense: number; income: number; balance: number; txns: Txn[] };

const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const money = (v: any) => toNum(v).toLocaleString("tr-TR");

export default function Finance() {
  const [summary, setSummary] = useState<Summary>({
    expense: 0,
    income: 0,
    balance: 0,
    txns: [],
  });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<{
    customerId: string;
    kind: "expense" | "income";
    title: string;
    amountTL: number;
  }>({
    customerId: "demo-small",
    kind: "expense",
    title: "Çimento",
    amountTL: 38500,
  });

  async function load() {
    try {
      const r = await fetch("/api/finance", { cache: "no-store" });
      const j = await r.json();

      // txns/entries/items -> tek tipe normalize
      const raw =
        (Array.isArray(j?.txns) && j.txns) ||
        (Array.isArray(j?.entries) && j.entries) ||
        (Array.isArray(j?.items) && j.items) ||
        [];

      const txns: Txn[] = raw.map((t: any) => ({
        id: t.id,
        // "IN/OUT" gelirse income/expense'e çevir
        kind: (t.kind === "IN" ? "income" : t.kind === "OUT" ? "expense" : t.kind) as
          | "income"
          | "expense",
        title: t.title ?? t.note ?? "",
        amountTL: toNum(t.amountTL ?? t.amount),
      }));

      const expense =
        toNum(j?.expense ?? j?.totalExpense) ||
        txns.filter((t) => t.kind === "expense").reduce((a, b) => a + toNum(b.amountTL), 0);

      const income =
        toNum(j?.income ?? j?.totalIncome) ||
        txns.filter((t) => t.kind === "income").reduce((a, b) => a + toNum(b.amountTL), 0);

      const balance = toNum(j?.balance ?? j?.total ?? income - expense);

      setSummary({ expense, income, balance, txns });
    } catch {
      setSummary({ expense: 0, income: 0, balance: 0, txns: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amountTL: toNum(form.amountTL) }),
    });
    setForm((f) => ({ ...f, title: "", amountTL: 0 })); // ister temizle
    await load();
  }

  if (loading) return <div className="text-sm opacity-70">Finans yükleniyor…</div>;

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">💰 Günlük Finans</h2>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3">
          <div className="text-sm opacity-70">Harcama</div>
          <div className="text-xl font-extrabold">{money(summary.expense)} TL</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Gelir</div>
          <div className="text-xl font-extrabold">+{money(summary.income)} TL</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Bakiye</div>
          <div className="text-xl font-extrabold text-emerald-700">
            {money(summary.balance)} TL
          </div>
        </div>
      </div>

      {/* Eski form geri geldi */}
      <form onSubmit={add} className="grid md:grid-cols-4 gap-2 mt-3">
        <select
          className="input"
          value={form.kind}
          onChange={(e) =>
            setForm({ ...form, kind: e.target.value as "expense" | "income" })
          }
        >
          <option value="expense">Harcama</option>
          <option value="income">Gelir</option>
        </select>
        <input
          className="input"
          placeholder="Başlık"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="input"
          type="number"
          placeholder="Tutar (TL)"
          value={form.amountTL}
          onChange={(e) => setForm({ ...form, amountTL: toNum(e.target.value) })}
        />
        <button className="btn btn-primary">➕ Ekle</button>
      </form>

      <div className="mt-3 space-y-2">
        {(summary.txns ?? []).map((t, i) => (
          <div key={t.id ?? i} className="flex justify-between items-center border p-2 rounded-xl">
            <div>{t.kind === "expense" ? "⛔" : "✅"} {t.title}</div>
            <div className="font-bold">
              {t.kind === "expense" ? "-" : "+"}
              {money(t.amountTL)} TL
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
