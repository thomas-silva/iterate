# iterate

Agent skills for one Linear child at a time.

A **parent issue** is the feature. A **child issue** is the next slice one agent can finish. The loop is:

1. **Plan** the next child
2. **Implement** it and prove it on the running system
3. **Review** it, simplify what is safe, then mark the child done

Repeat until the parent is done.

## Skills

| Skill | What it does |
|---|---|
| [`plan-sub-issue`](skills/plan-sub-issue/SKILL.md) | Writes the next Linear child. No code. |
| [`implement-sub-issue`](skills/implement-sub-issue/SKILL.md) | Builds that child, proves frontend rows with Playwright, pushes a branch, sets the child In Review. |
| [`review-sub-issue`](skills/review-sub-issue/SKILL.md) | Reviews the running system, applies safe simplifications, comments what remains, marks the child Done. |

Slash commands: `/plan-sub-issue`, `/implement-sub-issue`, `/review-sub-issue`.

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
