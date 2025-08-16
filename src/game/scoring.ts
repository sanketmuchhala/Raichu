export function scoreGrim(round: 4 | 8, doubled: boolean, success: boolean): number {
  const base = round === 4 ? 16 : 64;
  const mult = doubled ? 2 : 1;
  return success ? base * mult : -base * mult * 2;
}

export function scoreMake5(leadingWon: boolean): number {
  return leadingWon ? 5 : 10;
}
