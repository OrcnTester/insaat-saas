"use client";
import { useEffect, useState } from "react";

export default function Finance() {
  const [summary, setSummary] = useState<any>({ expense:0, income:0, balance:0, txns:[] });
  const [form, setForm] = useState({ customerId:"demo-small", kind:"expense", title:"Çimento", amountTL:38500 });

  const load = async()=> setSummary(await (await fetch("/api/finance")).json());
  useEffect(()=>{ load(); },[]);

  async function add(e:any){
    e.preventDefault();
    await fetch("/api/finance",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ ...form, amountTL:Number(form.amountTL) }) });
    await load();
  }

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">💰 Günlük Finans</h2>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3">
          <div className="text-sm opacity-70">Harcama</div>
          <div className="text-xl font-extrabold">{summary.expense.toLocaleString("tr-TR")} TL</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Gelir</div>
          <div className="text-xl font-extrabold">{summary.income.toLocaleString("tr-TR")} TL</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Bakiye</div>
          <div className="text-xl font-extrabold text-emerald-700">{summary.balance.toLocaleString("tr-TR")} TL</div>
        </div>
      </div>

      <form onSubmit={add} className="grid md:grid-cols-4 gap-2 mt-3">
        <select className="input" value={form.kind} onChange={e=>setForm({...form, kind:e.target.value})}>
          <option value="expense">Harcama</option>
          <option value="income">Gelir</option>
        </select>
        <input className="input" placeholder="Başlık" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input className="input" type="number" placeholder="Tutar (TL)" value={form.amountTL} onChange={e=>setForm({...form, amountTL:Number(e.target.value)})}/>
        <button className="btn btn-primary">➕ Ekle</button>
      </form>

      <div className="mt-3 space-y-2">
        {summary.txns?.map((t:any)=>(
          <div key={t.id} className="flex justify-between items-center border p-2 rounded-xl">
            <div>{t.kind==="expense" ? "⛔" : "✅"} {t.title}</div>
            <div className="font-bold">{t.kind==="expense" ? "-" : "+"}{t.amountTL.toLocaleString("tr-TR")} TL</div>
          </div>
        ))}
      </div>
    </div>
  );
}
