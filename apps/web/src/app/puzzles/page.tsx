// TODO: Puzzle mode — future feature
// This page will load puzzle positions and validate user solutions.
// Puzzle data types will be defined in @raichu/shared-types.
// A puzzle service endpoint will be added to the API.

// TODO: Define Puzzle type: { id, title, board, player, solution: Move[], difficulty }
// TODO: Puzzle loading from API or static JSON
// TODO: Solution validation against engine legal moves
// TODO: Puzzle progression / rating system

export default function PuzzlesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Puzzles</h1>
      <p className="text-[var(--text-secondary)] mb-2">Coming soon</p>
      <p className="text-sm text-[var(--text-secondary)]">
        Practice tactics with curated board positions
      </p>
      <a
        href="/"
        className="mt-6 text-[var(--accent)] hover:underline"
      >
        Back to home
      </a>
    </main>
  );
}
