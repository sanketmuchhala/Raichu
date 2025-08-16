import { describe, expect, it } from 'vitest';
import { compareRanks, trickWinner } from '../compare';
import { Card } from '../types';

describe('compare', () => {
  it('compares high vs low', () => {
    expect(compareRanks('A','K','HIGH')).toBeGreaterThan(0);
    expect(compareRanks('7','8','LOW')).toBeGreaterThan(0);
  });

  it('determines trick winner with trump', () => {
    const trick: Card[] = [
      {suit:'hearts', rank:'A'},
      {suit:'spades', rank:'7'},
      {suit:'hearts', rank:'K'},
      {suit:'clubs', rank:'A'},
    ];
    const winner = trickWinner(trick,'hearts','HIGH','spades');
    expect(winner).toBe(1); // spades trump wins
  });

  it('determines trick winner without trump', () => {
    const trick: Card[] = [
      {suit:'hearts', rank:'7'},
      {suit:'hearts', rank:'A'},
      {suit:'hearts', rank:'K'},
      {suit:'clubs', rank:'A'},
    ];
    const winner = trickWinner(trick,'hearts','HIGH');
    expect(winner).toBe(1);
  });
});
