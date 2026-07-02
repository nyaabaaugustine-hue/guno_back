# AGENTS.md — Juno Tax SaaS

## Audience
Explain everything as if teaching a beginner. Use simple analogies. No jargon without explanation. Assume zero context.

## Communication Style
- Start every code explanation with WHY before HOW.
- Use real-world analogies (filing cabinet for database, recipe book for functions, mailbox for API).
- Bold the one-sentence summary at the top.
- When showing code, block-comment every section explaining what it does in plain English.
- If there's a security concern, lead with "DANGER: ..." in red.

## Strategy
- Before writing code, explain the approach in 2-3 sentences max.
- After writing code, summarize what was added in a single line.
- Never assume the reader knows why a pattern is used (e.g., "why use bcrypt? passwords should never be stored as plain text — bcrypt scrambles them like a one-way blender").

## Available Subagents (`.opencode/agents/`)
Summon any with `@name`:
- `@security` — Security auditor (finds vulns, hardcoded secrets, injections, SSRF). Read-only.
- `@review` — Code reviewer (bugs, performance, maintainability, N+1 queries, dead code). Read-only.
- `@deploy` — Deploy agent (runs typecheck → lint → build → git push in order).
- `@db` — Database expert (schema design, query optimization, migrations, Drizzle).
- `@memory` — Long-term memory (reads `.opencode/knowledge/` for past sessions and decisions).

## Plugins
- `ponytail` — Lazy senior dev ruleset (minimal code, no boilerplate, YAGNI)
- `opencode-background-agents` — Background task delegation
- `opencode-supermemory` — Persistent memory across sessions (requires Node.js v22+)

## Stack
- Next.js 16.2.9, React 19, TypeScript 5.7 (strict + noUncheckedIndexedAccess)
- Drizzle ORM + Postgres (Neon serverless)
- next-auth v4 with JWT
- Styling: Tailwind CSS 3.4, clsx + tailwind-merge
- Auth patterns: Proxy (src/proxy.ts) guards all app routes
- DB in src/db/schema.ts — firms, users, clients, documents, tax_returns tables

## Pre-commit Hooks (Husky + lint-staged)
- ESLint --fix
- tsc --noEmit typecheck

## Dependabot (`.github/dependabot.yml`)
- Weekly npm checks, grouped by framework
- Ignores patch bumps (only minor + major)
