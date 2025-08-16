import { describe, expect, it } from 'vitest';
import { coinToss } from '../coin';

describe('coin toss', () => {
  it('is deterministic for seed', () => {
    expect(coinToss(1)).toEqual(coinToss(1));
  });

  it('returns team and seat parity', () => {
    const res = coinToss(2);
    if (res.dealerTeam === 'A') {
      expect([0,2]).toContain(res.dealerSeat);
    } else {
      expect([1,3]).toContain(res.dealerSeat);
    }
  });
});
