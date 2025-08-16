import { createPRNG } from './prng';
import { TeamId, Seat } from './types';

export interface CoinTossResult {
  dealerTeam: TeamId;
  dealerSeat: Seat;
}

export function coinToss(seed: number): CoinTossResult {
  const rng = createPRNG(seed);
  const dealerTeam: TeamId = rng() < 0.5 ? 'A' : 'B';
  // choose seat 0-3 with team parity (0 & 2 => A, 1 & 3 => B)
  const seats: Seat[] = dealerTeam === 'A' ? [0, 2] : [1, 3];
  const dealerSeat = seats[Math.floor(rng() * seats.length)];
  return { dealerTeam, dealerSeat };
}
