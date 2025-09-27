// src/app/ui/Shifts.tsx
"use client";
import { useEffect, useState } from "react";

type Shift = {
  id: string;
  customerId: string;
  workerName: string;
  startAt: string;          // ISO string
  endAt?: string | null;    // ISO string | null
};

function normalize(raw: any): Shift[] {
  // /api/shifts → [], {items:[…]}, {data:[…]} veya hata objesi gelebilir
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  return arr.map((x: any): Shift => ({
    id: String(x.id ?? crypto.randomUUID()),
    customerId: String(x.customerId ?? "demo-small"),
    workerName: String(x.workerName ?? x.worker ?? "—"),
    // startAt / startedAt / start
    startAt: String(
      x.startAt ?? x.startedAt ?? x.start ?? x.createdAt ?? new Date().toISOString()
    ),
    // endAt / endedAt / end
    endAt: x.endAt ?? x.endedAt ?? x.end ?? null,
  }));
}

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [customerId] = useState("demo-small");
  const [workerName, setWorkerName] = useState("Ali Usta");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/shifts", { cache: "no-store" });
      const json = await r.json().catch(() => ([]));
      setShifts(normalize(json));
    } catch (e) {
      setErr("Vardiyalar alınamadı.");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function act(action: "start" | "stop") {
    await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, workerName, action }),
    }).catch(() => {});
    await load();
  }

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">👷 Vardiya</h2>

      <div className="grid grid-cols-2 gap-2">
        <input
          className="input"
          value={workerName}
          onChange={(e) => setWorkerName(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={() => act("start")}>
            👤 Başlat
          </button>
          <button className="btn btn-secondary flex-1" onClick={() => act("stop")}>
            ✅ Çıkış
          </button>
        </div>
      </div>

      {loading && <div className="mt-3 text-sm opacity-70">Yükleniyor…</div>}
      {err && !loading && <div className="mt-3 text-sm text-red-600">{err}</div>}

      <div className="mt-3 space-y-2">
        {(shifts ?? []).map((s) => (
          <div key={s.id} className="flex justify-between items-center border p-2 rounded-xl">
            <div>{s.workerName}</div>
            <div className="text-sm opacity-70">
              {new Date(s.startAt).toLocaleString()}{" "}
              {s.endAt ? "— " + new Date(s.endAt).toLocaleTimeString() : "— aktif"}
            </div>
          </div>
        ))}
        {!loading && !err && shifts.length === 0 && (
          <div className="text-sm opacity-70">Kayıt yok.</div>
        )}
      </div>
    </div>
  );
}
