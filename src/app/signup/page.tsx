// src/app/signup/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function SignupContent() {
  const sp = useSearchParams();
  const initialPlan = sp.get("plan") ?? "classic";
  const [plan, setPlan] = useState(initialPlan);

  const PLAN_OPTIONS = [
    { id: "classic", name: "Classic" },
    { id: "avantgarde", name: "Avantgarde" },
    { id: "amg", name: "AMG" },
  ] as const;

  return (
    <main className="max-w-lg mx-auto p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold">Hesap Oluştur</h1>
        <p className="text-gray-600 mt-1">Plan seç ve ekibini içeri al.</p>
      </header>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input
            type="email"
            className="w-full rounded-xl border px-3 py-2"
            placeholder="you@company.com"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PLAN_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              className={`rounded-xl border px-3 py-2 text-sm ${
                plan === p.id
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2"
        >
          Devam Et
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Devam ederek{" "}
        <a href="/terms" className="underline">
          Şartlar
        </a>{" "}
        ve{" "}
        <a href="/privacy" className="underline">
          Gizlilik
        </a>
        ’i kabul edersin.
      </p>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-6">Yükleniyor…</div>}>
      <SignupContent />
    </Suspense>
  );
}
