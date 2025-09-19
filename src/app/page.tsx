import Orders from "./ui/Orders";
import Shifts from "./ui/Shifts";
import PPE from "./ui/PPE";
import Finance from "./ui/Finance";
import Dashboard from "./ui/Dashboard";

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <header className="card p-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
        <h1 className="text-2xl font-extrabold">İnşaat SaaS — Demo</h1>
        <p className="opacity-95">Usta için basit — Patron için net.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="card p-4"><Orders/></section>
        <section className="card p-4"><Shifts/></section>
        <section className="card p-4"><PPE/></section>
        <section className="card p-4"><Finance/></section>
        <section className="card p-4 md:col-span-2"><Dashboard/></section>
      </div>
    </main>
  );
}
