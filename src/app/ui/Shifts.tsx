"use client";
import { useEffect, useState } from "react";

export default function Shifts() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [customerId] = useState("demo-small");
  const [workerName, setWorkerName] = useState("Ali Usta");

  const load = async()=> setShifts(await (await fetch("/api/shifts")).json());
  useEffect(()=>{ load(); },[]);

  async function act(action:"start"|"stop"){
    await fetch("/api/shifts",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ customerId, workerName, action })
    });
    await load();
  }

  return (
    <div>
      <h2 className="font-extrabold text-lg mb-2">👷 Vardiya</h2>
      <div className="grid grid-cols-2 gap-2">
        <input className="input" value={workerName} onChange={e=>setWorkerName(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={()=>act("start")}>👤 Başlat</button>
          <button className="btn btn-secondary flex-1" onClick={()=>act("stop")}>✅ Çıkış</button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {shifts.map(s=>(
          <div key={s.id} className="flex justify-between items-center border p-2 rounded-xl">
            <div>{s.workerName}</div>
            <div className="text-sm opacity-70">{new Date(s.startAt).toLocaleString()} {s.endAt ? "— " + new Date(s.endAt).toLocaleTimeString() : "— aktif"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
