export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type RankOrder = 'HIGH' | 'LOW';
export type Trump = Suit | 'NT';
export type Seat = 0 | 1 | 2 | 3; // clockwise
export type TeamId = 'A' | 'B';

export interface TrickResult {
  winner: Seat;
  cards: Card[];
}
