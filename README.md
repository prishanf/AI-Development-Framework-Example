# Income & Expense Tracker

A small personal income/expense tracker built with Nuxt 3, Drizzle ORM, and SQLite. This repository exists to exercise the [AI Development Framework](https://github.com/prishanf/AI-Development-Framework) end to end, including its GitFlow branching model (`main` + `develop`, feature/release/hotfix branches) and its design/plan/spec approval gates.

## Repository layout

The root mixes two things on purpose, kept visually distinct by name:

- **Framework reference** (vendored as-is from AIDF, never edited here): `commands/`, `standards/`, `templates/`, `schemas/`, `guide/`, `reference/`, `.claude/`, `AGENTS.md`, `project.yaml`. These cross-reference each other by root-relative path, so they stay flat at the repository root to match the framework's own internal links — see [AGENTS.md](AGENTS.md) for the process this project follows.
- **This app**: `app/`, `server/`, `shared/`, `tests/`, `drizzle/`, and the usual Nuxt/TypeScript config files.
- **Project documents** (per `project.yaml`'s `documents:` map, one folder per artifact type, namespaced by feature slug): `docs/specs`, `docs/design` (including `docs/design/mockups/<slug>/` for throwaway clickable mockups), `docs/plans`, `docs/pull-requests`, `docs/reviews`, `docs/qa`, `docs/evidence`, `docs/migrations`, `docs/api`, `docs/architecture`, plus `docs/project-state.md` and `docs/conventions.md`.

## Setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Branching

This repository uses the framework's default GitFlow model — see `standards/branching.md`:

- `main` — production-ready history.
- `develop` — integration branch, continuously deployed to QA.
- `feat/<issue>-<slug>` / `fix/<issue>-<slug>` — branch from `develop`, merge back to `develop`.
- `release/<version>` — branches from `develop`, hardens in QA, merges to `main`.

Checked out as a bare repo with persistent worktrees for `main` and `develop`; see `standards/worktrees.md` for the layout and commands.

## Status

First feature vertical slice (categories/items, monthly bulk entry, yearly pivot views) is built, tested, and reviewed on `feat/1-income-expense-tracker` — see [PR #1](https://github.com/prishanf/AI-Development-Framework-Example/pull/1) and `docs/project-state.md` for current status, evidence, and next steps.
