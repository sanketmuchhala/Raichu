import { describe, expect, it } from 'vitest';
import { scoreGrim, scoreMake5 } from '../scoring';

describe('scoring', () => {
  it('scores grim and double', () => {
    expect(scoreGrim(4,false,true)).toBe(16);
    expect(scoreGrim(4,true,true)).toBe(32);
    expect(scoreGrim(8,false,false)).toBe(-128);
  });

  it('scores make-5', () => {
    expect(scoreMake5(true)).toBe(5);
    expect(scoreMake5(false)).toBe(10);
  });
});
