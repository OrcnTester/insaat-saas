// src/app/ui/Inventory.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

type Inv = {
  id?: string;
  customerId: string;
  material: string;
  unit: string;
  qty: number;
  minQty: number;
};

function normalize(raw: any): Inv[] {
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  return arr.map((x: any): Inv => ({
    id: x.id ?? x.item_id ?? undefined,
    customerId: String(x.customerId ?? x.customer_id ?? "demo-small"),
    material: String(x.material ?? x.name ?? x.title ?? "—"),
    unit: String(x.unit ?? x.uom ?? ""),
    qty: Number(x.qty ?? x.quantity ?? 0),
    minQty: Number(x.minQty ?? x.min ?? 0),
  }));
}

export default function Inventory() {
  const [items, setItems] = useState<Inv[]>([]);
  const [form, setForm] = useState({
    customerId: "demo-small",
    material: "Çimento (42,5R)",
    unit: "ton",
    qty: 1,
    kind: "out" as "in" | "out",
    note: "şantiye tüketim",
  });

  const load = async () => {
    try {
      const r = await fetch("/api/inventory", { cache: "no-store" });
      const json = await r.json();
      setItems(normalize(json));
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function move(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        qty: Number(form.qty),
        refType: form.kind === "out" ? "usage" : "manual",
      }),
    });
    await load();
  }

  const critical = useMemo(
    () => items.filter((i) => i.minQty > 0 && i.qty <= i.minQty),
    [items]
  );

  function buildPayload(i: Inv, kind: "in" | "out", qty: number) {
    const customerId = i.customerId || "demo-small";
    const q = new URLSearchParams({
      customerId,
      material: i.material,
      unit: i.unit,
      qty: String(qty),
      kind,
      note: "etiket",
    });
    return `inv://move?${q.toString()}`;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("QR payload kopyalandı.");
    } catch {
      alert("Kopyalama başarısız.");
    }
  }

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">🏷️ Depo / Stok</h2>

      {critical.length > 0 && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          ⚠️ Kritik stok:{" "}
          {critical.map((c) => `${c.material} (${c.qty} ${c.unit})`).join(", ")}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Malzeme</th>
              <th className="p-2">Birim</th>
              <th className="p-2">Miktar</th>
              <th className="p-2">Min</th>
              <th className="p-2">QR</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={`${i.material}-${i.unit}`} className="border-t">
                <td className="p-2">{i.material}</td>
                <td className="p-2">{i.unit}</td>
                <td className="p-2 font-bold">{i.qty}</td>
                <td className="p-2">{i.minQty}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary text-xs"
                      onClick={() => copy(buildPayload(i, "out", 1))}
                    >
                      ⬇️ OUT x1
                    </button>
                    <button
                      className="btn btn-secondary text-xs"
                      onClick={() => copy(buildPayload(i, "in", 1))}
                    >
                      ⬆️ IN x1
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-2 opacity-60" colSpan={5}>
                  Kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={move} className="grid md:grid-cols-5 gap-2 mt-3">
        <select
          className="input"
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value as "in" | "out" })}
        >
          <option value="out">Kullanım (çıkış)</option>
          <option value="in">Giriş (manuel)</option>
        </select>
        <input
          className="input"
          placeholder="Malzeme"
          value={form.material}
          onChange={(e) => setForm({ ...form, material: e.target.value })}
        />
        <input
          className="input"
          placeholder="Birim (ton/palet/adet)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Miktar"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
        />
        <button className="btn btn-primary">Kaydet</button>
      </form>
    </div>
  );
}
