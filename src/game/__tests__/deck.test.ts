import { describe, expect, it } from 'vitest';
import { createDeck, shuffle } from '../deck';
import { createPRNG } from '../prng';

describe('deck', () => {
  it('creates 32 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(32);
    const set = new Set(deck.map(c => c.suit + c.rank));
    expect(set.size).toBe(32);
  });

  it('shuffles deterministically with seed', () => {
    const deck = createDeck();
    const rng1 = createPRNG(123);
    const rng2 = createPRNG(123);
    const s1 = shuffle(deck, rng1);
    const s2 = shuffle(deck, rng2);
    expect(s1).toEqual(s2);
  });
});
