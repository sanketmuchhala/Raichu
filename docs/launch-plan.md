# Launch plan — getting the first players

Distribution plan for raichu.live. Written 20 August 2026.

This is the channel and launch companion to the product-specific
[SEO and content system](product/seo-and-content.md). It is built around each
community's actual rules, read directly at the time of writing. Rules change —
check the sidebar before posting.

---

## Where things stand

| Metric | Value |
|---|---|
| Impressions (90 days) | 491 |
| Clicks | 4 |
| Average position | **35.8** |
| Backlinks | ~0 |

Google already understands the site's topic — it shows it for "games like chess"
and 45 related queries. It shows it on **page four**, where nobody looks.

That is a ranking problem, not an indexing problem. Ranking at that level is
driven by authority the site does not have yet. The technical work (redirect
loop, split canonicals, missing schema, cannibalised pages) is done and none of
it manufactures authority. Links from real communities do.

**Posting is not separate from the SEO work — it is the SEO work.** The post
that sends fifty people today is the backlink that helps ranking in three months.

---

## Settle before posting

### Trademark

Pichu, Pikachu and Raichu are Nintendo trademarks — the game name, the domain and
all three piece names. The pieces render as chess pieces, so this is a naming
issue rather than an art one, but a launch push is what draws attention to it,
and "isn't this Nintendo IP?" derails a thread regardless of whether anything
legal follows.

Renaming is cheap now and expensive after there are players and inbound links.
Worth being a decision rather than a surprise.

### The apex/www split

Google indexes two copies of every page. Every earned link gets split across
both. Fix before sending traffic:

1. Vercel → raichu-web → Settings → Domains
2. `www.raichu.live` → redirect to `raichu.live`, status **308 Permanent**
3. `raichu.live` → primary, no redirect
4. Verify: `curl -sI https://www.raichu.live/ | head -1` shows `308`, not `307`
5. Then merge the `fix/canonical-to-apex` branch, which is held back deliberately

Apex rather than www because 479 of 491 impressions and all 4 clicks are on bare
`raichu.live` URLs.

---

## Channels

### r/WebGames — start here (rules verified)

Purpose-built for browser games. **No participation-history requirement**, unlike
most gaming subs.

Hard rules that shape the post:
- Title **must begin with the game's name**
- Link must go **as directly to the game as possible** — use `/play`, not the homepage
- Game **must not require signing up** — satisfied, since bot and local play need no account

### r/chessvariants — start here (rules verified)

Perfect topical fit, and the sub lists **no restrictive rules** — only Reddit-wide
policy applies. Small, but exactly the audience that enjoys picking apart a new
ruleset. Expect design critique; that is the value.

### Hacker News, Show HN — worth one shot

The technical angle is real: one TypeScript engine shared by web and iOS via
JavaScriptCore, AI running client-side. Post once, morning US time, answer every
comment. One shot per project in practice — do not repost.

### r/AbstractGames, r/BoardGames, r/IndieGaming — check rules first

Plausible fits; **rules not verified**. Larger board-game subs typically enforce
Reddit's 10% self-promotion guideline and expect comment history. If a sub has a
designated self-promo thread, use it rather than a top-level post.

### r/chess — do not post yet (rules verified)

Two rules make it a bad first move:

- **Rule 4** bans off-topic submissions. Raichu is chess-*inspired*, not chess, so
  removal is likely.
- **Rule 6** states that accounts with no history of participating in r/chess
  **will not be allowed** to self-promote.

If this sub is wanted later: comment genuinely there for a month, then modmail
before posting.

---

## Sequence

1. **Fix the domain split** — everything downstream compounds onto one domain.
2. **Post to r/WebGames and r/chessvariants** on different days. Low-risk tests;
   watch which framing lands ("no opening theory" vs "chess but simpler").
3. **Answer every comment.** A dead thread with 200 upvotes sends fewer players
   than a live one with 40.
4. **Show HN, once** — only after the Reddit posts reveal which explanation works.
5. **Read the analytics, then decide** where to spend the next post.

---

## Posts

Written in the voice of the person who built it. Being the creator is an asset on
Reddit as long as it is stated; pretending otherwise is what gets punished.

### r/WebGames

**Title** (must start with the game name)

```
Raichu — a chess-like strategy game with three pieces and no opening theory
```

**Link:** `https://raichu.live/play`

**Body**

```
I've been building this for a few months and it's finally good enough to show.

Raichu is an abstract strategy game on an 8x8 board. Three piece types, and what
each can capture depends on rank: the smallest piece can only take other small
pieces, the middle can take small and middle, the largest takes anything. Reach
the far side and you promote.

The idea was to keep what makes chess good — zero luck, everything visible, every
loss traceable to a mistake you can find — while cutting the part that gates new
players, which is memorising openings. There's no theory to study. The first move
is yours.

No account, no download. Play the bot or pass-and-play on one device straight
away; there's online multiplayer with an invite code if you want it, and that's
the only part that asks you to sign in.

It's free and there's nothing to buy. I'd genuinely like to know whether the piece
hierarchy feels balanced — that's the part I'm least sure about.
```

### r/chessvariants

**Title**

```
I designed a chess-like variant around a capture hierarchy instead of piece
movement — would like it torn apart
```

**Body**

```
Most variants I've played change how pieces move. I wanted to try changing what
they're allowed to capture instead, and see what that does to the game.

Three piece types on an 8x8 board. Call them small, medium and large. Movement is
fairly simple — the medium piece moves forward, left and right but never
diagonally or backwards; the large one moves like a queen but captures by jumping
rather than sliding onto the square. The rule that does the work is the
hierarchy: small can only capture small, medium captures small and medium, large
captures anything. Reach the opposite edge with a small or medium piece and it
promotes to large.

Two things I did not expect:

The capture hierarchy makes material lopsided in a way chess isn't. A large piece
isn't just worth more, it's categorically safe from most of the board, so trading
into a position where you hold the only large piece is often decisive rather than
merely good.

Because the large piece captures by jumping, blocking works completely
differently. You can't shield a piece by putting something in front of it the way
you would against a rook.

No luck, no hidden information, no opening theory — the whole thing is short
enough that a game takes a few minutes.

It's playable free in a browser with no account: https://raichu.live/play

I'm mainly after design criticism. Does the hierarchy collapse into "get a large
piece and win"? I don't think it does at a decent level, but I'm the wrong person
to judge that.
```

### Hacker News — Show HN

**Title**

```
Show HN: Raichu – a chess-like board game with three pieces and no opening theory
```

**First comment** (post immediately after submitting)

```
Author here.

Raichu is an abstract strategy game — 8x8 board, three piece types, no luck and
no hidden information. What each piece can capture depends on its rank rather
than its movement, which turns out to change the game more than changing movement
would. Promotion happens by reaching the far edge.

The reason I built it: I like chess but bounced off opening theory. Everything
below master level felt like recall rather than thinking. So I kept the properties
I wanted — perfect information, no dice, losses that are traceable to a specific
mistake — and removed the memorisation.

On the technical side, the part I'd point at:

The rules engine and the AI are plain TypeScript with no DOM dependency, in their
own packages. The web app imports them directly, and the iOS app runs the exact
same code through JavaScriptCore via a bundled IIFE — so there is one
implementation of the rules, not two that drift. The AI is minimax with alpha-beta
and iterative deepening, running entirely client-side, so a bot game needs no
server at all.

Multiplayer is Postgres plus websockets for live board sync, and it's the only
thing that needs an account. Bot and local play work immediately.

Free, nothing to buy, no ads: https://raichu.live/play

Happy to go into the engine or the search if anyone's interested. The design
question I'm least confident about is whether the capture hierarchy stays balanced
at higher levels.
```

---

## What not to do

- **Don't post the same text everywhere on the same day.** Reddit's spam detection
  is cross-subreddit and it's the fastest way to lose an account.
- **Don't post to r/chess yet.** Rules explicitly disallow it without history.
- **Don't lead with the SEO pages.** Link the game. A blog post as a first
  impression converts far worse than something playable in one click.
- **Don't use alt accounts to upvote.** Vote manipulation is the one thing that
  gets a domain sitewide-banned, which would cost every future post.
- **Don't disappear after posting.** The comments are where people decide.

---

## Measuring what worked

The analytics on the site answer this directly — check rather than guessing from
upvotes.

| Question | Where to look |
|---|---|
| Which channel sent people | `referrer` on `page_view` events |
| Did they click through to play | `cta_click`, tagged by placement |
| Did they actually play | `game_started`, `game_summary` |
| Did they come back | `analytics_dau` |
| Where they gave up | `page_exit` time-on-page and scroll depth |

The number that matters is not visits but **visits that became a started game**. A
channel sending 30 people who play beats one sending 300 who bounce.
