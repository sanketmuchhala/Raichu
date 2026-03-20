/**
 * ELO rating calculation.
 * K-factor decreases as players play more games (more stable ratings).
 */

function getKFactor(gamesPlayed: number): number {
  if (gamesPlayed < 30) return 32;
  if (gamesPlayed < 100) return 24;
  return 16;
}

function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

interface EloResult {
  winnerNewElo: number;
  loserNewElo: number;
  winnerDelta: number;
  loserDelta: number;
}

export function calculateElo(
  winnerElo: number,
  winnerGamesPlayed: number,
  loserElo: number,
  loserGamesPlayed: number,
): EloResult {
  const winnerK = getKFactor(winnerGamesPlayed);
  const loserK = getKFactor(loserGamesPlayed);

  const winnerExpected = expectedScore(winnerElo, loserElo);
  const loserExpected = expectedScore(loserElo, winnerElo);

  const winnerDelta = Math.round(winnerK * (1 - winnerExpected));
  const loserDelta = Math.round(loserK * (0 - loserExpected));

  return {
    winnerNewElo: winnerElo + winnerDelta,
    loserNewElo: Math.max(100, loserElo + loserDelta), // floor at 100
    winnerDelta,
    loserDelta,
  };
}
