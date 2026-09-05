# iterate

Agent skills for one Linear child at a time, plus a parent loop that runs them.

A **parent issue** is the feature. A **child issue** is the next slice one agent can finish.

`/iterate-parent` is the loop (main agent). The other three are the stages it delegates:

1. **Plan** the next child
2. **Implement** it and prove it on the running system (local commits, no push)
3. **Review** it, simplify, squash, push once, mark the child done

Each child gets its own branch stacked on the last Done child's branch. First child stacks on the repo default branch. No PRs.

The loop checks whether the parent is already done **before** it plans the next child, and gates the child plan against the parent. It does not mark the parent Done.

## Skills

| Skill | What it does |
|---|---|
| [`iterate-parent`](skills/iterate-parent/SKILL.md) | Main-agent loop: done check, plan gate, then plan → implement → review. Cap 20. |
| [`plan-sub-issue`](skills/plan-sub-issue/SKILL.md) | Writes the next Linear child. No code. |
| [`implement-sub-issue`](skills/implement-sub-issue/SKILL.md) | Builds that child from the stack tip, proves frontend rows with Playwright, commits locally, sets the child In Review. |
| [`review-sub-issue`](skills/review-sub-issue/SKILL.md) | Reviews the running system, applies safe simplifications, squashes and pushes once, comments what remains, marks the child Done. |

Slash commands: `/iterate-parent`, `/plan-sub-issue`, `/implement-sub-issue`, `/review-sub-issue`.

Canonical files live in `skills/`. Cursor Cloud (and other agents that only scan the repo) load them from `.cursor/skills/`, which points at the same folders.

## You need

- [Linear](https://linear.app) with MCP connected in the agent
- A parent issue that already names an observable outcome
- Playwright, if the child has frontend acceptance rows

## Install

```bash
npx skills add thomas-silva/iterate
```

All agents on this machine:

```bash
npx skills add thomas-silva/iterate -g -y
```
