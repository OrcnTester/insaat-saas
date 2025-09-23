// src/app/page.tsx
import Image from "next/image";
import Orders from "./ui/Orders";
import Shifts from "./ui/Shifts";
import PPE from "./ui/PPE";
import Finance from "./ui/Finance";
import Inventory from "./ui/Inventory";
import Dashboard from "./ui/Dashboard";
import MiniTasks from "./ui/MiniTasks";
import KpiStrip from "./ui/KpiStrip";

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <header className="relative rounded-2xl p-8 md:p-12 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white shadow-lg">
  <div className="flex flex-col md:flex-row items-center gap-8">
    {/* Sol: Logo */}
    <div className="w-full md:w-1/3 flex justify-center md:justify-start">
      <Image
        src="/insaat-saasLogo.png"
        alt="İnşaat SaaS Logo"
        width={224}
        height={224}
        priority
        className="w-24 md:w-40 lg:w-52 h-auto object-contain"
      />
    </div>

    {/* Sağ: Başlık + tagline */}
    <div className="text-center md:text-left md:flex-1">
      <h1 className="text-3xl md:text-4xl font-extrabold">İnşaat SaaS — Demo</h1>
      <p className="text-base md:text-lg opacity-90 mt-3">Herkes için basit • Patron için net</p>
      <p className="text-sm opacity-80 mt-1">Demo sürüm kodlanıyor — geri bildirimleriniz değerli</p>

      {/* CTA'lar — MOBİL/SMALL ekranlar için burada (desktop'ta gizli) */}
      <div className="mt-6 flex flex-wrap justify-center md:hidden gap-3">
        <a href="https://github.com/OrcnTester/insaat-saas" target="_blank" rel="noopener noreferrer"
           className="px-5 py-2 rounded-xl bg-black hover:bg-gray-900 text-white font-medium shadow-md transition">GitHub Repo</a>
        <a href="https://www.linkedin.com/in/orcun-yoruk-355b52147" target="_blank" rel="noopener noreferrer"
           className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition">LinkedIn Profile</a>
        <a href="/signup"
           className="px-5 py-2 rounded-xl bg-white/90 hover:bg-white text-emerald-700 font-semibold shadow-md transition ring-2 ring-white/40">ÜYE OL</a>
      </div>
    </div>
  </div>

  {/* Sol alt: Tech stack ikonları — sadece md+ */}
  <div className="hidden md:flex absolute left-6 bottom-6 gap-5 opacity-80">
    <Image src="/stack/nextjs.svg" alt="Next.js" width={28} height={28} />
    <Image src="/stack/typescript.svg" alt="TypeScript" width={28} height={28} />
    <Image src="/stack/prisma.svg" alt="Prisma" width={28} height={28} />
    <Image src="/stack/postgresql.svg" alt="PostgreSQL" width={28} height={28} />
    <Image src="/stack/tailwind.svg" alt="Tailwind CSS" width={28} height={28} />
    <Image src="/stack/vercel.svg" alt="Vercel" width={28} height={28} />
  </div>

  {/* Sağ alt: CTA bar — sadece md+ */}
  <div className="hidden md:flex absolute right-6 bottom-6 gap-3">
    <a href="https://github.com/OrcnTester/insaat-saas" target="_blank" rel="noopener noreferrer"
       className="px-5 py-2 rounded-xl bg-black hover:bg-gray-900 text-white font-medium shadow-md transition">GitHub Repo</a>
    <a href="https://www.linkedin.com/in/orcun-yoruk-355b52147" target="_blank" rel="noopener noreferrer"
       className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition">LinkedIn Profile</a>
    <a href="/signup"
       className="px-5 py-2 rounded-xl bg-white/90 hover:bg-white text-emerald-700 font-semibold shadow-md transition ring-2 ring-white/40">ÜYE OL</a>
  </div>
</header>

      {/* KPI Şeridi */}
      <KpiStrip />

      {/* MASONRY LAYOUT (boşluk yok!) */}
      {/* columns-2 ile 2 sütun; her kart inline-block ve break-inside-avoid */}
      <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
        <section className="card p-4 mb-4 inline-block w-full break-inside-avoid">
          <Orders />
        </section>

        <section className="card p-4 mb-4 inline-block w-full break-inside-avoid">
          <Shifts />
        </section>

        <section className="card p-3 md:p-4 mb-4 inline-block w-full break-inside-avoid">
          <PPE />
        </section>

        <section className="card p-4 mb-4 inline-block w-full break-inside-avoid">
          <Finance />
        </section>

        <section className="card p-4 mb-4 inline-block w-full break-inside-avoid">
          <Inventory />
        </section>

        <section className="card p-4 mb-4 inline-block w-full break-inside-avoid">
          <MiniTasks />
        </section>

        {/* Büyük panel altta — masonry yine boşluk bırakmaz */}
        <section className="card p-4 mb-4 inline-block w-full break-inside-avoid">
          <Dashboard />
        </section>
      </div>
    </main>
  );
}
