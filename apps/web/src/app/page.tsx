export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Raichu</h1>
      <p className="text-[var(--text-secondary)] mb-8">A strategy board game</p>
      <div className="flex gap-4">
        <a
          href="/play"
          className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Play
        </a>
      </div>
    </main>
  );
}
