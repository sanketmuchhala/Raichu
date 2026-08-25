# GitHub Repository Setup

This document describes the GitHub configuration for the Raichu repository: CI, Dependabot, code ownership, and what still needs manual setup.

---

## What exists today

### CI Workflow (`.github/workflows/ci.yml`)

A single workflow called **CI** runs on every push to `main` and on all pull requests.

**Steps:**
1. Checkout code
2. Install pnpm 9.15.0
3. Setup Node.js 22 with dependency caching
4. `pnpm install --frozen-lockfile`
5. `pnpm build` — Turborepo builds all packages in dependency order
6. `pnpm test` — runs workspace test tasks
7. `pnpm build:ios` — builds the JavaScriptCore engine bundle outside Turbo
8. Upload `raichu-engine.js` as artifact `raichu-engine-js`

**Not yet active:**
- Lint step is commented out. No package defines a `lint` script yet. Uncomment the step in `ci.yml` once ESLint is configured.

**Concurrency:** Redundant runs on the same branch are automatically cancelled.

### Dependabot (`.github/dependabot.yml`)

Dependabot opens PRs weekly for dependency updates in 6 directories:

| Ecosystem | Directory | What it covers |
|-----------|-----------|----------------|
| `github-actions` | `/` | CI action versions (checkout, setup-node, pnpm) |
| `npm` | `/` | Root workspace (turbo, typescript) |
| `npm` | `/apps/api` | Express, cors, zod, tsx, vitest |
| `npm` | `/apps/web` | Next.js, React, Zustand, Framer Motion, Tailwind |
| `npm` | `/packages/game-engine` | TypeScript, vitest |
| `npm` | `/packages/ai-engine` | TypeScript, vitest |

Minor and patch updates are grouped into single PRs to reduce noise.

**Security updates** are also enabled. Dependabot will auto-create PRs for known CVEs in addition to the weekly version bumps.

### CODEOWNERS (`.github/CODEOWNERS`)

All paths are owned by `@sanketmuchhala`. When collaborators are added, split ownership by area:

| Path | Current owner |
|------|---------------|
| `*` (catch-all) | @sanketmuchhala |
| `/apps/web/` | @sanketmuchhala |
| `/apps/api/` | @sanketmuchhala |
| `/apps/ios/` | @sanketmuchhala |
| `/packages/*` | @sanketmuchhala |
| `/.github/` | @sanketmuchhala |
| `/docs/` | @sanketmuchhala |

CODEOWNERS only enforces required reviews if branch protection is enabled (see checklist below).

The active native project is `/apps/Ios-app/`, while the current explicit
CODEOWNERS entry names `/apps/ios/`. The catch-all still assigns ownership, but
add an explicit `/apps/Ios-app/` rule when CODEOWNERS is next updated.

### PR Template (`.github/pull_request_template.md`)

Every new PR auto-populates with sections for: Summary, What changed, Linked issue, Testing, Screenshots, and a Checklist.

---

## What still needs manual configuration

Go to **Settings > Branches** and **Settings > Code security** in the GitHub UI.

### Branch protection checklist

- [ ] **Add branch protection rule for `main`**
  - [ ] Require pull request before merging
  - [ ] Require at least 1 approval
  - [ ] Require review from Code Owners
  - [ ] Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - [ ] Do not allow bypassing the above settings (even for admins)

### Required status checks

- [ ] Add **`Build & Test`** as a required check (this is the job name from `ci.yml`)

### Repository secrets

- [ ] None required today — CI uses no secrets
- [ ] If you add deployment (Vercel, AWS, etc.), add tokens under **Settings > Secrets and variables > Actions**

### Environments

- [ ] None configured — add `staging` / `production` environments when deployment workflows are added

### Review ownership

| Area | Reviewer | Notes |
|------|----------|-------|
| Frontend (`/apps/web/`) | @sanketmuchhala | Update CODEOWNERS when adding collaborators |
| Backend (`/apps/api/`) | @sanketmuchhala | |
| Game engine (`/packages/game-engine/`) | @sanketmuchhala | Core logic — extra care on rule changes |
| AI engine (`/packages/ai-engine/`) | @sanketmuchhala | |
| CI/CD (`/.github/`) | @sanketmuchhala | Changes here affect all PRs |
| Docs (`/docs/`) | @sanketmuchhala | |

---

## File inventory

```
.github/
├── workflows/
│   └── ci.yml                    # CI pipeline
├── dependabot.yml                # Dependency update config
├── CODEOWNERS                    # PR review assignment
└── pull_request_template.md      # PR template
```
