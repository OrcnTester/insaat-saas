"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type T = {
  id: string;
  title: string;
  status: "TODO" | "DOING" | "DONE";
  assignee?: string | null;
  due?: string | null;
  priority?: number;
};

export default function MiniTasks() {
  const [tasks, setTasks] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("/api/tasks", { cache: "no-store" });
      const data = await r.json();
      setTasks(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  // tarih yardımcıları
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const hasDue = (d?: string | null) => d && !Number.isNaN(new Date(d).getTime());
  const isPending = (t: T) => t.status !== "DONE";

  // sıralama: gecikmiş → bugün → diğer (priority desc, due asc)
  const sorted = useMemo(() => {
    const sc = [...tasks];
    sc.sort((a, b) => {
      const ad = hasDue(a.due) ? new Date(a.due!).getTime() : Infinity;
      const bd = hasDue(b.due) ? new Date(b.due!).getTime() : Infinity;
      // overdue/bugün öncelik
      const aOver = isPending(a) && hasDue(a.due) && new Date(a.due!) < startOfToday ? 0 : 1;
      const bOver = isPending(b) && hasDue(b.due) && new Date(b.due!) < startOfToday ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const aToday = isPending(a) && hasDue(a.due) && new Date(a.due!) >= startOfToday && new Date(a.due!) < endOfToday ? 0 : 1;
      const bToday = isPending(b) && hasDue(b.due) && new Date(b.due!) >= startOfToday && new Date(b.due!) < endOfToday ? 0 : 1;
      if (aToday !== bToday) return aToday - bToday;
      const ap = (a.priority ?? 0);
      const bp = (b.priority ?? 0);
      if (ap !== bp) return bp - ap; // büyük öncelik önce
      return ad - bd;
    });
    return sc;
  }, [tasks]);

  const overdueCount = tasks.filter(t => isPending(t) && hasDue(t.due) && new Date(t.due!) < startOfToday).length;

  const badge = (t: T) => {
    if (t.status === "DONE") return <span className="pill pill-ok">Done</span>;
    if (hasDue(t.due)) {
      const d = new Date(t.due!);
      if (d < startOfToday) return <span className="pill pill-bad">Geçti</span>;
      if (d < endOfToday)   return <span className="pill pill-warn">Bugün</span>;
    }
    return <span className="pill pill-warn">{t.status === "DOING" ? "Doing" : "To-Do"}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold">Günlük İş Planı</div>
          <div className="text-sm opacity-70">Detaylı plan ve sürükle-bırak için aç</div>
        </div>
        <Link href="/tasks" className="btn btn-primary">Aç</Link>
      </div>

      {loading ? (
        <div className="text-sm opacity-60">Yükleniyor…</div>
      ) : sorted.length === 0 ? (
        <div className="text-sm opacity-60">Kayıt yok.</div>
      ) : (
        <ul className="space-y-2">
          {sorted.slice(0, 5).map(t => (
            <li key={t.id} className="flex items-center justify-between border rounded-xl p-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.title}</div>
                <div className="text-xs opacity-70">
                  {t.assignee ? `${t.assignee} • ` : ""}
                  {hasDue(t.due) ? new Date(t.due!).toLocaleDateString("tr-TR") : "Termin yok"}
                </div>
              </div>
              {badge(t)}
            </li>
          ))}
        </ul>
      )}

      {/* küçük alt bilgi */}
      <div className="text-xs opacity-60 mt-2">
        {overdueCount > 0 ? `⏰ ${overdueCount} geciken iş var` : "Geciken iş yok"}
      </div>
    </div>
  );
}
