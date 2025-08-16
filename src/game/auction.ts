export type Bid = 'PASS' | 'GRIM' | 'DOUBLE';

// returns index of winning seat or -1 if all pass
export function resolveAuction(bids: Bid[]): number {
  let winner = -1;
  let doubleIndex = -1;
  bids.forEach((bid, i) => {
    if (bid === 'GRIM') winner = i;
    if (bid === 'DOUBLE') doubleIndex = i;
  });
  return doubleIndex !== -1 ? doubleIndex : winner;
}
