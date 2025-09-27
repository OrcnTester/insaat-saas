//src/app/ui/Orders.tsx
"use client";
import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({
    customerId:"demo-small",
    material:"Çimento (42,5R)",
    amount:"10 ton",
    supplier:"AYDINÇİM A.Ş. — 3.850 TL/ton",
    eta:"2025-09-27 00:07:14.91"
  });

  const load = async()=> setOrders(await (await fetch("/api/orders")).json());
  useEffect(()=>{ load(); },[]);

  async function submit(e:any){
    e.preventDefault();
    await fetch("/api/orders",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    });
    await load();
  }

    async function deliver(id:string){
    await fetch(`/api/orders/${id}/deliver`, { method:"PATCH" });
    await load();
  }

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">🧱 Malzeme Siparişi</h2>
      <form onSubmit={submit} className="grid gap-2">
        <label className="label">Malzeme</label>
        <input className="input" value={form.material} onChange={e=>setForm({...form, material:e.target.value})}/>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Miktar</label>
            <input className="input" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/>
          </div>
          <div>
            <label className="label">Teslim</label>
            <input className="input" value={form.eta} onChange={e=>setForm({...form, eta:e.target.value})}/>
          </div>
        </div>
        <label className="label">Tedarikçi</label>
        <input className="input" value={form.supplier} onChange={e=>setForm({...form, supplier:e.target.value})}/>
        <button className="btn btn-primary mt-2">➕ Sipariş Oluştur</button>
      </form>

      <div className="mt-4 space-y-2">
        {orders.map(o=>(
          <div key={o.id} className="flex justify-between items-center border p-2 rounded-xl">
            <div>{o.material} — <b>{o.amount}</b></div>
            <div className="pill pill-ok">{o.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
  <div className="mt-4 space-y-2">
  {orders.map(o=>(
    <div key={o.id} className="flex justify-between items-center border p-2 rounded-xl gap-3">
      <div className="min-w-0">
        {o.material} — <b>{o.amount}</b>
      </div>
      <div className="flex items-center gap-2">
        <div className={`pill ${o.status==="delivered" ? "pill-ok" : "pill-warn"}`}>{o.status}</div>
        {o.status!=="delivered" && (
          <button className="btn btn-secondary" onClick={()=>deliver(o.id)}>🚚 Teslim Al</button>
        )}
      </div>
    </div>
  ))}
</div>
}
