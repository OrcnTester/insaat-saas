// src/app/ui/RoleBar.tsx
"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const roles = [
  { key: "patron", label: "👑 Patron" },
  { key: "muhasebe", label: "📒 Muhasebe" },
  { key: "depo", label: "📦 Depo" },
  { key: "santiye_sefi", label: "🛠️ Şantiye Şefi" },
  { key: "ofis", label: "🗂️ Ofis" },
] as const;

export default function RoleBar() {
  const sp = useSearchParams();
  const active = sp.get("role") ?? "patron";
  return (
    <div className="sticky top-0 z-20 -mt-4 mb-2">
      <nav className="flex flex-wrap gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2">
        {roles.map((r) => (
          <Link
            key={r.key}
            href={`/?role=${r.key}`}
            onClick={() => { document.cookie = `role=${r.key}; Path=/; Max-Age=31536000`; }}
            className={[
              "text-sm px-3 py-1.5 rounded-lg border transition",
              active === r.key
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100",
            ].join(" ")}
          >
            {r.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
