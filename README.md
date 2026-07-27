# Income & Expense Tracker

A small personal income/expense tracker built with Nuxt 3, Drizzle ORM, and SQLite. This repository exists to exercise the [AI Development Framework](https://github.com/prishanf/AI-Development-Framework) end to end, including its GitFlow branching model (`main` + `develop`, feature/release/hotfix branches) and its design/plan/spec approval gates.

Framework scaffolding (`commands/`, `standards/`, `templates/`, `schemas/`, `guide/`, `reference/`, the Claude adapter) lives at the repository root, copied from the framework at v3.0.0. See [AGENTS.md](AGENTS.md) for the process this project follows.

## Branching

This repository uses the framework's default GitFlow model — see `standards/branching.md`:

- `main` — production-ready history.
- `develop` — integration branch, continuously deployed to QA.
- `feat/<issue>-<slug>` / `fix/<issue>-<slug>` — branch from `develop`, merge back to `develop`.
- `release/<version>` — branches from `develop`, hardens in QA, merges to `main`.

Checked out as a bare repo with persistent worktrees for `main` and `develop`; see `standards/worktrees.md` for the layout and commands.

## Status

Framework bootstrap only at this point. The income/expense tracker feature itself is being built on `feat/1-income-expense-tracker` per an approved spec, design, and implementation plan — see `docs/specs/`, `docs/plans/`, and `docs/project-state.md`.
