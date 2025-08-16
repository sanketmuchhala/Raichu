import { describe, expect, it } from 'vitest';
import { resolveAuction, Bid } from '../auction';

describe('auction', () => {
  it('resolves grim win', () => {
    const bids: Bid[] = ['PASS','GRIM','PASS','PASS'];
    expect(resolveAuction(bids)).toBe(1);
  });

  it('double takeover', () => {
    const bids: Bid[] = ['GRIM','DOUBLE','PASS','PASS'];
    expect(resolveAuction(bids)).toBe(1);
  });

  it('all pass', () => {
    const bids: Bid[] = ['PASS','PASS','PASS','PASS'];
    expect(resolveAuction(bids)).toBe(-1);
  });
});
