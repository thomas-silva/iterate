# iterate

Agent skills for building a Linear feature one child issue at a time.

A **parent issue** is the feature. A **child issue** is the next piece, small enough for one agent to finish in one session.

```mermaid
flowchart LR
    Draft["Draft child"] --> Approve{"You approve"}
    Approve --> Implement["Implement"]
    Implement --> Review["Review"]
    Review -->|Parent not covered yet| Draft
    Review -->|Parent covered| Finish{"You approve finishing"}
    Finish --> PR["Finish: one PR"]
```

`/iterate-parent` runs this whole loop. It looks at the parent and does the next thing, pausing whenever it needs you. It keeps a few rules:

- **One child at a time.**
- **You approve each child** before work starts, and **you decide when to finish**.
- **Linear status shows where things stand** (Todo → In Progress → In Review → Done), so you can re-run after any interruption.
- **All children share the parent's branch.** Commits name their issue.
- **Proven means seen working** on the running system, with evidence saved in Linear.
- **If something is unclear or stuck, the agent stops and tells you why.**

## Skills

| Skill | What it does |
|---|---|
| [`iterate-parent`](skills/iterate-parent/SKILL.md) | Runs the loop and drafts each child with you. |
| [`implement-sub-issue`](skills/implement-sub-issue/SKILL.md) | Builds the child and proves it works. |
| [`review-sub-issue`](skills/review-sub-issue/SKILL.md) | Reviews and simplifies the child, then marks it Done. |
| [`finish-parent`](skills/finish-parent/SKILL.md) | Reviews the whole feature, opens the PR, moves the parent to In Review. |

Implement and review run as subagents when the agent supports them. Each skill also works on its own. Canonical files live in `skills/`; `.cursor/skills/` links to them.

## You need

- [Linear](https://linear.app) connected to the agent
- A parent issue with an outcome and Acceptance criteria
- A way to see the running system; Playwright helps for UI checks

## Install

From a clone, symlink `skills/` into each agent's user directory. Re-run to update; it also removes links to deleted skills.

```bash
./scripts/install-user-skills.sh
```

Targets: Grok (`~/.grok/skills`), Cursor (`~/.cursor/skills`), Claude Code (`~/.claude/skills`), Codex (`~/.codex/skills`).

From GitHub:

```bash
npx skills add thomas-silva/iterate -g -y
```
