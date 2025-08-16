import { Rank, RankOrder, Suit, Card } from './types';

const high: Record<Rank, number> = {
  A: 7,
  K: 6,
  Q: 5,
  J: 4,
  '10': 3,
  '9': 2,
  '8': 1,
  '7': 0,
};

const low: Record<Rank, number> = {
  '7': 7,
  '8': 6,
  '9': 5,
  '10': 4,
  J: 3,
  Q: 2,
  K: 1,
  A: 0,
};

export function compareRanks(a: Rank, b: Rank, order: RankOrder): number {
  const table = order === 'HIGH' ? high : low;
  return table[a] - table[b];
}

export function trickWinner(
  trick: Card[],
  lead: Suit,
  order: RankOrder,
  trump?: Suit | null
): number {
  let winner = 0;
  for (let i = 1; i < trick.length; i++) {
    const card = trick[i];
    const win = trick[winner];
    if (trump && card.suit === trump && win.suit !== trump) {
      winner = i;
      continue;
    }
    if (win.suit === trump && card.suit !== trump) {
      continue;
    }
    if (card.suit === win.suit && card.suit === lead) {
      if (compareRanks(card.rank, win.rank, order) > 0) winner = i;
    } else if (win.suit !== trump && card.suit !== trump && card.suit === lead && win.suit !== lead) {
      winner = i;
    }
  }
  return winner;
}
