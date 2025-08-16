# Grim Rules

## Overview
- 4 players, 2 teams (partners sit opposite). Play proceeds clockwise.
- Deck of 32 cards: 7,8,9,10,J,Q,K,A in each suit. No jokers.
- Ranks have two possible orders:
  - **High**: A > K > Q > J > 10 > 9 > 8 > 7
  - **Low**: 7 < 8 < 9 < 10 < J < Q < K < A
- Gameplay consists of deals with up to three auction rounds followed by trick play.

## Auctions
Each deal starts with four cards to each player. Up to three rounds are possible:

1. **Round 1**
   - Players bid Pass, Grim, or Double Grim (to take over a Grim).
   - Winner chooses High/Low and Trump suit or No-Trump.
   - Play 4 tricks, score, deal ends.
   - If all pass: set these cards aside unseen, pre-declare a *suit* trump for contingency, proceed to Round 2.
2. **Round 2**
   - Deal 4 new cards each and repeat auction.
   - If all pass: proceed to Round 3.
3. **Round 3**
   - Deal 8 cards each and auction.
   - If all pass: play **Make-5** using the pre-declared suit as trump (No-Trump not allowed).

## Trick Play
- Declarer leads first trick; winner leads next.
- Players must follow suit if possible, otherwise may play any card.
- Any trump beats non-trump. Otherwise highest card of the led suit wins based on chosen order (High or Low).

## Objectives & Scoring
- Declarer’s team must win **all** tricks to succeed (4 or 8 depending on stage).
- Scores:
  - 4-card Grim: +16 for success, −32 for failure.
  - Double Grim: +32 for success, −64 for failure.
  - 8-card Grim: +64 for success, −128 for failure.
- **Make-5**: Leading team needs 5 tricks for +5. Defenders need 4 for +10. No negative score.

## Dealer & Leading
- After each deal, the dealer is a member of the *losing team*; deal starts to the dealer’s left (who is on the leading team).

## Match
- A match lasts a fixed number of deals (default 12, configurable 10–15).
- Display Team A, Team B totals and the A−B difference.

## Coin Toss
- Before first deal, perform a seeded PRNG coin toss to select the initial dealer team (50/50).
- Randomly choose the dealer seat within that team.
- Log the result and allow retoss before confirming.
