"use client";
import { useState } from "react";

export default function PPE() {
  const [form, setForm] = useState({ customerId:"demo-small", helmet:true, harness:false, note:"" });
  const [last, setLast] = useState<any>(null);

  async function submit(e:any){
    e.preventDefault();
    const res = await fetch("/api/ppe",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    setLast(await res.json());
  }

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">🦺 PPE / QR</h2>
      <form onSubmit={submit} className="grid gap-2">
        <div className="flex items-center gap-3">
          <label className="label min-w-24">Baret</label>
          <input type="checkbox" checked={form.helmet} onChange={e=>setForm({...form, helmet:e.target.checked})}/>
          <label className="label min-w-24">Emniyet Kemeri</label>
          <input type="checkbox" checked={form.harness} onChange={e=>setForm({...form, harness:e.target.checked})}/>
        </div>
        <input className="input" placeholder="Not" value={form.note} onChange={e=>setForm({...form, note:e.target.value})}/>
        <button className="btn btn-primary">📷 Kontrol Kaydet</button>
      </form>

      {last && (
        <div className="mt-3 border rounded-xl p-3">
          <div>Sonuç: {last.ok ? <span className="pill pill-ok">UYGUN</span> : <span className="pill pill-bad">UYGUN DEĞİL</span>}</div>
          <div className="text-sm opacity-70">Baret: {String(last.helmet)} — Kemer: {String(last.harness)}</div>
        </div>
      )}
    </div>
  );
}
