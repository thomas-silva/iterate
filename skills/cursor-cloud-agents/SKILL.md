---
name: cursor-cloud-agents
description: Inspect existing Cursor Cloud Agents over REST (list sessions, turn traces, run timelines, live-capture vs coding). Use when the user asks to list, inspect, trace, or summarize Cursor cloud agents or `bc-` sessions; mentions Cloud Agents API, `/v1/agents`, live capture, or “what did the cloud agent do”; or runs /cursor-cloud-agents. Do not use for writing `@cursor/sdk` integrations — that is cursor-sdk.
---

# Cursor Cloud Agents (inspect)

Read-only operator playbook. Use the Bun scripts in this skill. Do not install `@cursor/sdk`. Do not use Python.

Docs: https://cursor.com/docs/cloud-agent/api/endpoints  
Conversation (legacy): https://cursor.com/docs/cloud-agent/api/v0

Skill dir: resolve next to this file (`scripts/*.ts`).

## Auth

```bash
export CURSOR_API_KEY
```

`CURSOR_API_KEY` is often a shell variable and **not** exported — child processes will not see it until `export`. Confirm with `GET /v1/me` (the list script prints this first). Basic auth: `-u "$CURSOR_API_KEY:"` against `https://api.cursor.com`.

## Scripts

Run with Bun. Never rewrite these as Python.

```bash
bun <skill>/scripts/list.ts [--limit 20] [--include-archived] [--json]
bun <skill>/scripts/conversation.ts <bc-id>
bun <skill>/scripts/stream-summary.ts <bc-id> [run-id] [--from ISO] [--to ISO]
```

- **list** — agents ranked by latest **run** `updatedAt`, not `agent.updatedAt`.
- **conversation** — v0 messages grouped by `turn-N` / `step-M`. No per-message clocks.
- **stream-summary** — filtered tool timeline. Exit 2 on `410 stream_expired` (24h retention). Optional `--from`/`--to` UTC.

## Endpoint map

| Need | Where |
|---|---|
| list/get agent, list/get run, usage, artifacts | **v1** `/v1/agents…` |
| conversation text | **v0** `GET /v0/agents/{id}/conversation` (`id`, `type`, `text` only) |
| per-tool timestamps | **v1** `GET /v1/agents/{id}/runs/{runId}/stream` |

Do not probe `/v1/.../conversation`, `/messages`, or `/transcript` — they 404.

IDs: `bc-<uuid>` is an agent. `run-<uuid>` is a run. Do not pass one where the other is required.

## Clocks

- Real activity: `run.createdAt`, `run.updatedAt`, `durationMs`.
- `agent.updatedAt` can move without a new run. Do not sort by it.
- Conversation ids look like `turn-0:step:15:assistant` and have **no** timestamps.
- Stream event `id` looks like `{unix_ms}-{seq}`. Use the ms prefix as a UTC clock. Header `X-Cursor-Stream-Retention-Seconds` (86400). After that: `410 stream_expired`.

On 410: conversation + run clocks + GitHub commits if `git.branches[].prUrl` is set. `gh api repos/<owner>/<repo>/pulls/<n>/commits` is the ground truth for “code vs tests vs live capture”.

## How to inspect

1. `list.ts` for the session (or match name / Linear SIG).
2. `conversation.ts` for user prompts and assistant narrations (turn 0 = first run, turn 1 = follow-up).
3. If the latest run is < 24h old, `stream-summary.ts` (window it when the user names a phase).
4. If a PR exists, list commits before claiming a phase was implementation.

Do not dump raw SSE into the chat. The stream script already filters: `edit_file` / `write`, `task`, `record_screen`, notable shells, `step-completed`.

## Out of scope

Launch is cursor-cloud-session. Cancel, archive, delete, private workers, pools, wrapping OpenAPI, MCP server.
