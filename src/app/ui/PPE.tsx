// src/app/ui/PPE.tsx
"use client";
import { useState } from "react";

export default function PPE() {
  const [form, setForm] = useState({
    customerId: "demo-small",
    helmet: true,
    harness: false,
    note: "",
  });
  const [last, setLast] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/ppe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setLast(await res.json());
    } catch {
      setLast({ ok: false });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🦺</span>
        <h2 className="text-lg font-semibold">Koruyucu Ekipman</h2>
      </div>

      <form onSubmit={submit} className="grid gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.helmet}
              onChange={(e) => setForm({ ...form, helmet: e.target.checked })}
            />
            <span>Baret</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.harness}
              onChange={(e) => setForm({ ...form, harness: e.target.checked })}
            />
            <span>Emniyet Kemeri</span>
          </label>
        </div>

        <input
          className="input"
          placeholder="Not"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <button className="btn btn-primary">📷 Kontrol Kaydet</button>
      </form>

      {last && (
        <div className="mt-2 border rounded-xl p-3">
          <div className="font-medium">
            Sonuç:{" "}
            {last.ok ? (
              <span className="pill pill-ok">UYGUN</span>
            ) : (
              <span className="pill pill-bad">UYGUN DEĞİL</span>
            )}
          </div>
          <div className="text-sm opacity-70">
            Baret: {String(last.helmet)} — Kemer: {String(last.harness)}
          </div>
        </div>
      )}
    </div>
  );
}
