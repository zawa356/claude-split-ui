# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, etc.) working in this repository.

## Start of every session

1. Read [docs/AISTATE.md](docs/AISTATE.md) first. It is the AI-maintained state of the project (status, environment, gaps, next steps, log).
2. Run `git fetch` and check whether local `main` is behind `origin/main` (builds and releases happen in GitHub Actions; other sessions push there).
3. Then read [README.md](README.md), [docs/research/wxt-migration.md](docs/research/wxt-migration.md) and [docs/research/2026-10-09-feature-flag-analysis.md](docs/research/2026-10-09-feature-flag-analysis.md) as needed. `docs/handoff/*` is historical.

## AISTATE protocol

**Every time you do work in this repository (code, docs, config, investigation, test runs), update `docs/AISTATE.md` before finishing.**

- It is optimized for AI readers, not humans: dense, keyed, factual. Keep the existing section layout.
- Update `META.updated` and `META.head_at_update`.
- Update any affected section (`COMPONENT_STATUS`, `COMMANDS`, `GAPS / TECH_DEBT`, `NEXT`, `OPEN_QUESTIONS`, ...). Remove facts that are no longer true.
- Mark confidence: `V` = verified by running it yourself, `O` = observed in docs/reported by the user, `H` = hypothesis, `?` = unknown.
- Add one line at the top of `LOG`: `- YYYY-MM-DD | <model/agent> | <what was done; results; open items>`. Keep ~30 entries; fold older ones into `HISTORY`.
- Include the AISTATE update in the same commit as the work it describes.
- Never write secrets, tokens, account/org IDs, or response bodies into AISTATE.

## Hard rules (summary; details in AISTATE `CONSTRAINTS` and SECURITY.md)

- Never commit HAR captures, `app_start` responses, cookies, JWTs, or account-specific data.
- `poc/firefox-mv3/` is the verified regression baseline. Put new code in `packages/core/` and `apps/*`.
- Do not claim browser/runtime behavior as verified unless it was actually tested in a real browser.

## Commands

```sh
npm run check
npm test
npm run build:poc
```

Node.js 22+. On this Windows machine Node is not on Git Bash's PATH: `export PATH="/c/Program Files/nodejs:$PATH"`.
