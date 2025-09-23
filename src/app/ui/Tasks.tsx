"use client";
import { useEffect, useMemo, useState } from "react";

type TaskDTO = {
  id: string; customerId: string; title: string;
  status: "TODO"|"DOING"|"DONE";
  assignee: string|null; due: string|null;
  priority: number; note: string|null;
  createdAt: string; updatedAt: string;
};

const fmt = (d: string|null) => d ? new Date(d).toLocaleDateString("tr-TR") : "";

function TaskCard({
  task, onMove, onAssign, onDragStart, onDragEnd,
}: {
  task: TaskDTO;
  onMove: (id:string, s:TaskDTO["status"])=>void;
  onAssign: (id:string, a:string)=>void;
  onDragStart: (id:string, e:React.DragEvent)=>void;
  onDragEnd: ()=>void;
}) {
  const overdue = task.due && new Date(task.due) < new Date() && task.status!=="DONE";
  return (
    <div
      className="border rounded-xl p-3 bg-white space-y-2 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => onDragStart(task.id, e)}
      onDragEnd={onDragEnd}
      aria-grabbed="true"
      role="listitem"
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold truncate">{task.title}</div>
        <span className="text-zinc-400 select-none" title="Sürükle">⋮⋮</span>
      </div>

      <div className="text-xs opacity-70 flex items-center justify-between">
        <span>Öncelik: {task.priority}</span>
        <div className="flex items-center gap-2">
          {task.due && <span>Son: {fmt(task.due)}</span>}
          {overdue && <span className="pill pill-bad">GEÇTİ</span>}
        </div>
      </div>

      <input
        className="input"
        placeholder="Usta"
        value={task.assignee ?? ""}
        onChange={(e)=>onAssign(task.id, e.target.value)}
      />

      <div className="flex gap-2 pt-1">
        {task.status!=="TODO"  && <button className="btn btn-secondary" onClick={()=>onMove(task.id,"TODO")}>⬅️ To-Do</button>}
        {task.status!=="DOING" && <button className="btn btn-secondary" onClick={()=>onMove(task.id,"DOING")}>🏗️ Doing</button>}
        {task.status!=="DONE"  && <button className="btn btn-primary"   onClick={()=>onMove(task.id,"DONE")}>✅ Done</button>}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [dragId, setDragId] = useState<string|null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskDTO["status"]|null>(null);

  const [form, setForm] = useState({
    customerId:"demo-small", title:"", assignee:"", due:"", priority:0, note:""
  });

  const load = async()=>{
    const r = await fetch("/api/tasks", { cache:"no-store" });
    const data = await r.json();
    setTasks(Array.isArray(data) ? data : []);
  };
  useEffect(()=>{ load(); },[]);

  async function add(e:any){
    e.preventDefault();
    if(!form.title.trim()) return;
    await fetch("/api/tasks", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        ...form,
        assignee: form.assignee || null,
        due: form.due || null,
        priority: Number(form.priority) || 0,
        note: form.note || null,
      })
    });
    setForm({ customerId:"demo-small", title:"", assignee:"", due:"", priority:0, note:"" });
    await load();
  }

  async function move(id:string, status:TaskDTO["status"]){
    await fetch(`/api/tasks/${id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ status })
    });
    await load();
  }

  async function assign(id:string, assignee:string){
    await fetch(`/api/tasks/${id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ assignee: assignee || null })
    });
    await load();
  }

  // DnD helpers
  function onDragStart(id:string, e:React.DragEvent){
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e:React.DragEvent, col:TaskDTO["status"]){
    e.preventDefault(); // drop'a izin
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(col);
  }
  async function onDrop(col:TaskDTO["status"]){
    if (dragId) await move(dragId, col);
    setDragId(null);
    setDragOverCol(null);
  }
  function onDragLeave(){
    setDragOverCol(null);
  }
  function onDragEnd(){
    setDragId(null);
    setDragOverCol(null);
  }

  const cols = useMemo(()=>({
    TODO: tasks.filter(t=>t.status==="TODO"),
    DOING: tasks.filter(t=>t.status==="DOING"),
    DONE: tasks.filter(t=>t.status==="DONE"),
  }),[tasks]);

  const dz = (col:TaskDTO["status"]) =>
    `card p-3 min-h-[260px] transition-all ${
      dragOverCol===col ? "ring-2 ring-emerald-500" : "ring-0"
    }`;

  return (
    <div>
      <form onSubmit={add} className="grid md:grid-cols-5 gap-2 mb-3">
        <input className="input md:col-span-2" placeholder="Başlık (örn. 2. kat kaba sıva)"
               value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})}/>
        <input className="input" placeholder="Usta (örn. Ali Usta)"
               value={form.assignee} onChange={(e)=>setForm({...form, assignee:e.target.value})}/>
        <input className="input" type="date" value={form.due}
               onChange={(e)=>setForm({...form, due:e.target.value})}/>
        <div className="flex gap-2">
          <input className="input w-24" type="number" placeholder="Öncelik"
                 value={form.priority} onChange={(e)=>setForm({...form, priority:Number(e.target.value)})}/>
          <button className="btn btn-primary">➕ Ekle</button>
        </div>
      </form>

      <div className="grid md:grid-cols-3 gap-3" role="list">
        <div className={dz("TODO")}
             onDragOver={(e)=>onDragOver(e,"TODO")}
             onDrop={()=>onDrop("TODO")}
             onDragLeave={onDragLeave}>
          <div className="font-bold mb-2">📝 To-Do ({cols.TODO.length})</div>
          <div className="space-y-2">
            {cols.TODO.map(t => (
              <TaskCard key={t.id}
                        task={t}
                        onMove={move}
                        onAssign={assign}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}/>
            ))}
          </div>
        </div>

        <div className={dz("DOING")}
             onDragOver={(e)=>onDragOver(e,"DOING")}
             onDrop={()=>onDrop("DOING")}
             onDragLeave={onDragLeave}>
          <div className="font-bold mb-2">🏗️ Doing ({cols.DOING.length})</div>
          <div className="space-y-2">
            {cols.DOING.map(t => (
              <TaskCard key={t.id}
                        task={t}
                        onMove={move}
                        onAssign={assign}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}/>
            ))}
          </div>
        </div>

        <div className={dz("DONE")}
             onDragOver={(e)=>onDragOver(e,"DONE")}
             onDrop={()=>onDrop("DONE")}
             onDragLeave={onDragLeave}>
          <div className="font-bold mb-2">✅ Done ({cols.DONE.length})</div>
          <div className="space-y-2">
            {cols.DONE.map(t => (
              <TaskCard key={t.id}
                        task={t}
                        onMove={move}
                        onAssign={assign}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
