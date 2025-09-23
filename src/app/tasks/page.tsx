import Tasks from "../ui/Tasks";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <header className="card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">🗂️ Günlük İş Planı</h1>
          <a href="/" className="btn btn-secondary">← Anasayfa</a>
        </div>
        <p className="text-sm opacity-70 mt-1">
          Kartları sürükleyip sütunlar arasında bırakabilirsin. (Desktop)
        </p>
      </header>
      <section className="card p-4">
        <Tasks />
      </section>
    </main>
  );
}
