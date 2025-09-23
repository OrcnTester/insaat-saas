// src/app/qr/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

type MovePayload = {
  customerId: string;
  material: string;
  unit: string;
  qty: number;
  kind: "in" | "out";
  note?: string | null;
  refType?: string | null;
};

function tryParsePayload(text: string): MovePayload | null {
  // JSON
  try {
    const j = JSON.parse(text);
    if (j && j.customerId && j.material && j.unit && j.qty && j.kind) {
      return {
        customerId: String(j.customerId),
        material: String(j.material),
        unit: String(j.unit),
        qty: Number(j.qty),
        kind: j.kind === "in" ? "in" : "out",
        note: j.note ?? null,
        refType: j.refType ?? "qr",
      };
    }
  } catch {}

  // inv://move?...
  if (text.startsWith("inv://")) {
    const fake = new URL(text.replace("inv://", "https://dummy/"));
    const q = fake.searchParams;
    const kind = q.get("kind") === "in" ? "in" : "out";
    const qty = Number(q.get("qty") ?? "0");
    const unit = q.get("unit") ?? "";
    const material = q.get("material") ?? "";
    const customerId = q.get("customerId") ?? "";
    const note = q.get("note");
    if (customerId && material && unit && qty > 0) {
      return { customerId, material, unit, qty, kind, note, refType: "qr" };
    }
  }

  // http(s)://... aynı parametre şemasıyla
  if (/^https?:\/\//i.test(text)) {
    try {
      const u = new URL(text);
      const q = u.searchParams;
      const kind = q.get("kind") === "in" ? "in" : "out";
      const qty = Number(q.get("qty") ?? "0");
      const unit = q.get("unit") ?? "";
      const material = q.get("material") ?? "";
      const customerId = q.get("customerId") ?? "";
      const note = q.get("note");
      if (customerId && material && unit && qty > 0) {
        return { customerId, material, unit, qty, kind, note, refType: "qr" };
      }
    } catch {}
  }

  return null;
}

export default function QRPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);
  const [status, setStatus] = useState("Hazır");
  const [lastText, setLastText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(""); // ⬅️ HOOK burada olmalı

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    return () => {
      controls?.stop(); // cleanup
    };
  }, [controls]);

  async function start() {
    if (!readerRef.current || !videoRef.current) return;
    setStatus("Kamera izni isteniyor…");

    // 1) İzin penceresini tetikle
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      s.getTracks().forEach((t) => t.stop());
    } catch (e: any) {
      setStatus("Kamera izni verilmedi. Tarayıcı ayarlarından bu siteye Camera → Allow yap.");
      return;
    }

    // 2) Arka kamera (yoksa ilk cihaz)
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const back = devices.find((d) => /back|rear|environment/i.test(d.label));
      const deviceId = (back ?? devices[0])?.deviceId;
      if (!deviceId) {
        setStatus("Kamera bulunamadı.");
        return;
      }
      const ctrl = await readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result) => { if (result) setLastText(result.getText()); }
      );
      setControls(ctrl);
      setStatus("QR bekleniyor…");
    } catch (e: any) {
      setStatus("Kamera açılamadı: " + String(e?.message ?? e));
    }
  }

  function stop() {
    controls?.stop();
    setControls(null);
    setStatus("Durduruldu");
  }

  async function apply() {
    if (!lastText) return;
    const payload = tryParsePayload(lastText);
    if (!payload) { setStatus("Geçersiz QR"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: payload.customerId,
          material: payload.material,
          unit: payload.unit,
          qty: payload.qty,
          kind: payload.kind,
          note: payload.note ?? "QR move",
          refType: payload.refType ?? "qr",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus(`✔️ ${payload.material} ${payload.kind === "out" ? "-" : "+"}${payload.qty} ${payload.unit}`);
      setLastText(null);
    } catch (e: any) {
      setStatus("Hata: " + String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-3">
      <header className="card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">📷 QR Okut — Depo/Stok</h1>
          <a href="/" className="btn btn-secondary">← Anasayfa</a>
        </div>
        <p className="text-sm opacity-70 mt-1">
          Format: <code>inv://move?customerId=demo-small&material=Çimento%20(42,5R)&unit=ton&qty=1&kind=out&note=Etiket</code> veya JSON.
        </p>
      </header>

      <section className="card p-4 space-y-3">
        <video ref={videoRef} className="w-full rounded-xl bg-black" />
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={start}>▶️ Başlat</button>
          <button className="btn btn-secondary" onClick={stop}>⏹️ Durdur</button>

          {/* Kamera yoksa/izin yoksa: elle yapıştır */}
          <input className="input flex-1" placeholder="QR metnini yapıştır"
                 value={manual} onChange={(e)=>setManual(e.target.value)} />
          <button className="btn btn-secondary" onClick={async()=>{ try{ const t=await navigator.clipboard.readText(); setManual(t);}catch{} }}>
            📋 Panodan al
          </button>
          <button className="btn btn-primary" onClick={()=> setLastText(manual)}>Yükle</button>

          <button className="btn btn-secondary" disabled={!lastText || busy} onClick={apply}>✅ Uygula</button>
        </div>
        <div className="text-sm opacity-80">Durum: {status}</div>
        {lastText && <div className="text-xs break-all opacity-70">Okunan: {lastText}</div>}
      </section>
    </main>
  );
}
