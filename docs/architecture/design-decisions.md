# Architecture design decisions

**Status:** Canonical decision summary. Each entry records the present decision, why it exists, and when to revisit it.

## ADR-001: One deterministic TypeScript rules engine

**Decision:** Legal moves, capture hierarchy, promotion, board transformation, and base terminal status live in `@raichu/game-engine`.

**Why:** Browser, API, tests, and iOS must not independently reinterpret rules.

**Trade-offs:** iOS needs a build bridge rather than native compile-time linkage. A TypeScript bug propagates consistently to every platform.

**Revisit when:** the bridge becomes a measurable reliability/performance constraint or a formally verified/native engine is justified.

## ADR-002: Generate-and-match server move validation

**Decision:** The API regenerates all legal moves and accepts a submitted origin/destination only when it matches one.

**Why:** This is simpler and safer than duplicating geometric checks in request handlers.

**Trade-offs:** Validation is linear in the number of legal moves and the current matcher does not compare every metadata field.

**Revisit when:** profiling shows move generation is a bottleneck or idempotent command design requires a canonical move identifier.

## ADR-003: Compact row-major board strings

**Decision:** Persist and transmit a board as 64 characters.

**Why:** It is compact, human-readable in fixtures, portable, and trivial to encode/decode.

**Trade-offs:** The string carries no schema/rules version and weak decoders can accept malformed lengths unless callers validate.

**Revisit when:** rules introduce additional per-square state or historical migrations require versioned encoding.

## ADR-004: Client-side bot search in a Web Worker

**Decision:** Browser bot games run `@raichu/ai-engine` in a dedicated module worker.

**Why:** It avoids network latency and server cost while protecting the rendering thread from synchronous minimax.

**Trade-offs:** Search strength depends on device performance, browser bundles are larger, and tests/server environments need a synchronous fallback.

**Revisit when:** competitive bot consistency, anti-tampering, or much stronger models require server compute.

## ADR-005: API authority for online games

**Decision:** Online clients send commands; the Express API loads state, checks identity/turn, validates the move, and writes results using the Supabase service role.

**Why:** Client-side validation alone is not a trust boundary.

**Trade-offs:** Online availability depends on the API, and service-role access makes application authorization critical.

**Revisit when:** game commands move to transactional database functions, edge functions, or another authoritative service.

## ADR-006: Realtime notification plus polling recovery

**Decision:** Subscribe to database changes for low latency and poll every three seconds as a convergence path.

**Why:** WebSocket delivery can be delayed or missed across reconnects and background tabs.

**Trade-offs:** Polling adds read load and Realtime health inference is imperfect.

**Revisit when:** active-game scale makes polling material or the transport supports reliable cursor-based replay.

## ADR-007: In-process matchmaking worker

**Decision:** The API process scans the queue every five seconds and expands ELO tolerance with wait time.

**Why:** It is operationally cheap for the current scale and easy to reason about in one process.

**Trade-offs:** Multiple replicas can race, failures pause matching, and pairing is not transactional.

**Revisit when:** the API runs multiple replicas, queue depth grows, or matching policies become more complex.

## ADR-008: Supabase for Auth, PostgreSQL, and Realtime

**Decision:** Use one managed platform for identity, persistence, and database-change publication.

**Why:** It reduces operational surface while retaining PostgreSQL and RLS.

**Trade-offs:** Availability and SDK behavior are coupled to Supabase; service-role use can bypass RLS safeguards.

**Revisit when:** scale, compliance, latency, or vendor concentration justifies separate services.

## ADR-009: Zustand stores for web orchestration

**Decision:** Keep local game, online game, authentication, matchmaking, and UI state in separate flat Zustand stores.

**Why:** Stores are lightweight and usable outside React event handlers, which suits engine and subscription callbacks.

**Trade-offs:** Cross-store invariants are conventional rather than enforced by a single state machine.

**Revisit when:** orchestration bugs indicate a need for explicit statecharts or server-state tooling.

## ADR-010: Native SwiftUI with JavaScriptCore reuse

**Decision:** Build a native iOS 17+ UI and call the bundled TypeScript engine from `JSContext`.

**Why:** It preserves native interaction, accessibility, and platform design while keeping one rules implementation.

**Trade-offs:** Runtime string-based calls are less type-safe, bundle generation is a separate CI step, and failures need bridge diagnostics.

**Revisit when:** native engine parity is complete or cross-platform requirements change.

## ADR-011: History-aware draws above the core engine

**Decision:** Repetition and no-progress counters live in platform stores rather than the pure board engine.

**Why:** They require history beyond a single board, while the core engine API is position-oriented.

**Trade-offs:** Different runtimes can diverge, and online persistence currently cannot represent draw.

**Revisit when:** online rules are unified. At that point, introduce a shared game-session reducer or explicit history state used by API and clients.

## ADR-012: Forward-only SQL migrations and secured analytics views

**Decision:** Evolve Supabase through ordered SQL migrations; analytics views must be security-invoker and inaccessible to client roles.

**Why:** Schema history remains reviewable, and service-role dashboards can query aggregates without exposing behavioral data.

**Trade-offs:** Every new view needs explicit security statements and deployment-order thinking for expand/contract changes.

**Revisit when:** a migration platform or separate analytics warehouse provides stronger automated controls.

## Decision review checklist

Before replacing a decision:

1. Identify the quality attribute that is no longer met.
2. Measure the problem rather than assuming scale.
3. Document data and backward-compatibility impact.
4. Include web, API, iOS, CI, and migration consequences.
5. Add the replacement decision and mark the old one superseded; do not silently rewrite history.
