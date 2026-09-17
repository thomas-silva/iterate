---
name: iterate-parent
description: Build a Linear parent feature one child issue at a time. Draft the next child and get the user's approval, implement it, review it, and repeat until the parent's Acceptance is covered, then finish with one PR. Use when the user runs /iterate-parent, asks to iterate a parent issue, plan the next Linear sub-issue or child issue, or loop plan-implement-review until the parent is complete.
---

# Iterate Parent

Build a parent feature one child at a time, until its outcome works.

## Rules

- **One child at a time.** Work only on the parent's open child (not Done or Canceled).
- **Only the user approves a child** before work starts, and **only the user decides to finish**. Ask in whatever way your platform allows; never assume a yes.
- **Linear status shows where things stand**, so running this again picks up where it left off.
- **If something is unclear or stuck, stop and tell the user why.**

## Do the next thing

Read the parent (if given a child, use its parent), its children, and all comments. Then do the next thing, and keep going until you need the user:

- **No open child, parent Acceptance not yet covered** → draft the next child (below), save it as Todo, show the user its link and why it comes next, and ask for approval.
- **Todo** → revise on the user's feedback. On approval, move it to In Progress.
- **In Progress** → run `implement-sub-issue` for it, as a subagent if you can.
- **In Review** → run `review-sub-issue` for it, as a subagent if you can.
- **Every parent Acceptance row covered by Done children** → ask the user whether to finish. On yes, run `finish-parent`.

Do not edit the parent.

## Drafting a child

The next child is the most valuable unmet part of the parent, or an open question whose answer changes what to build. Use earlier review findings and lessons.

A good child:
- Moves the parent toward its outcome without expanding it.
- Is small enough for one agent to finish in one session.
- Has one theme and a result someone can check on the running system.
- Describes behavior, not code, and is titled by what changes (not "Implement…" or "Phase N").

Save it in Linear under the parent (same team, project, and priority), using this description:

```markdown
## Why this child
[1–2 sentences: what it covers and why it is next.]

## Outcome
[1–2 sentences: what will visibly work afterward.]

## Scope
Included:
- [2–4 behaviors.]

Not included:
- [Anything a reader might expect here that a later child covers. Omit when none.]

## Acceptance
| Done when | Proven by |
|---|---|
| [Yes/no observable result] | [Where to see it on the running system] |
```
