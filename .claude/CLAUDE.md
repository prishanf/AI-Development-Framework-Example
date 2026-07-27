# Claude adapter

Follow the adapter-neutral rules in [AGENTS.md](../AGENTS.md). The command contracts live in [commands/](../commands/); read the one matching the role you are performing and follow it as written.

Slash commands `/spec`, `/plan`, `/build`, `/validate`, `/preview`, `/review`, `/ship` are wired in `.claude/commands/` — each points at its contract file.

Do not add Claude-specific lifecycle rules here.
