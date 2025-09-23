// src/app/ui/Dashboard.tsx
"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>({ expense:0, income:0, balance:0, txns:[] });
  const [shifts, setShifts] = useState<any[]>([]);
  const [inv, setInv] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  async function load(){
    const [o,f,s,i,t] = await Promise.all([
      fetch("/api/orders").then(r=>r.json()),
      fetch("/api/finance").then(r=>r.json()),
      fetch("/api/shifts").then(r=>r.json()),
      fetch("/api/inventory").then(r=>r.json()),
      fetch("/api/tasks").then(r=>r.json()),
    ]);
    setOrders(o);
    setFinance(f);
    setShifts(s);
    setInv(i);
    setTasks(Array.isArray(t) ? t : []); // guard
  }
  useEffect(()=>{ load(); },[]);

  const critical = inv.filter((x:any)=>x.minQty>0 && x.qty<=x.minQty);
  const todoCount = tasks.filter((x:any)=>x.status==="TODO").length;

  // Tarih yardımcıları
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24*60*60*1000);
  const valid = (d:any)=> d && !Number.isNaN(new Date(d).getTime());

  // Geciken / Bugün
  const pending = (t:any)=> t.status!=="DONE";
  const overdueList = tasks
    .filter((t:any)=> pending(t) && valid(t.due) && new Date(t.due) < startOfToday)
    .sort((a:any,b:any)=> new Date(a.due).getTime() - new Date(b.due).getTime());
  const dueToday = tasks
    .filter((t:any)=> pending(t) && valid(t.due) && new Date(t.due) >= startOfToday && new Date(t.due) < endOfToday);

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">📊 Patron Dashboard</h2>

      <div className="grid md:grid-cols-4 gap-2">
        <div className="card p-3">
          <div className="text-sm opacity-70">Bugün Harcama</div>
          <div className="text-xl font-extrabold">{finance.expense.toLocaleString("tr-TR")} TL</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Bugün Gelir</div>
          <div className="text-xl font-extrabold">{finance.income.toLocaleString("tr-TR")} TL</div>
        </div>
        <div className="card p-3">
          <div className="text-sm opacity-70">Aktif Vardiya</div>
          <div className="text-xl font-extrabold">{shifts.filter(s=>!s.endAt).length}</div>
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
          <div className="text-xl font-extrabold text-rose-700">{overdueList.length}</div>
        </div>
      </div>

      {/* Gecikenlerden ilk 3 */}
      {overdueList.length > 0 && (
        <div className="card p-3 mt-2">
          <div className="font-bold mb-2">⏰ Gecikenler (ilk 3)</div>
          <ul className="list-disc pl-5 space-y-1">
            {overdueList.slice(0,3).map((t:any)=>(
              <li key={t.id}>
                {t.title} <span className="text-xs opacity-70">({new Date(t.due).toLocaleDateString("tr-TR")})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="font-bold mb-2">Anlık Olaylar</div>
          <ul className="list-disc pl-5 space-y-1">
            {orders.slice(0,5).map((o:any)=>(
              <li key={o.id}>🧱 {o.material} — <b>{o.amount}</b> <span className="pill pill-ok ml-2">{o.status}</span></li>
            ))}
          </ul>
        </div>
        <div className="card p-3">
          <div className="font-bold mb-2">Finans Hareketleri</div>
          <ul className="space-y-1">
            {finance.txns.slice(0,5).map((t:any)=>(
              <li key={t.id} className="flex justify-between">
                <span>{t.kind==="expense" ? "⛔" : "✅"} {t.title}</span>
                <span className="font-bold">{t.kind==="expense" ? "-" : "+"}{t.amountTL.toLocaleString("tr-TR")} TL</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
