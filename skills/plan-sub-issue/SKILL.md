---
name: plan-sub-issue
description: Draft the next Linear child issue under a parent feature and get the user's approval before work starts. No code. Use when the user runs /plan-sub-issue, asks for the next Linear sub-issue or child issue, or to break a Linear issue into the next piece of work.
---

# Plan Sub-Issue

Draft the next child: the most useful next piece of the parent, small enough for one agent to finish in one session. No code.

**Only the user approves a child.** Ask in whatever way your platform allows. Approval is the user saying so, or moving the child to In Progress themselves. Never assume it.

## Workflow

1. Read the parent, its children, and all comments, including review findings and lessons. If the parent names a child, use its parent.
2. Choose what comes next: the most valuable unmet part of the parent, or an open question whose answer changes what to build. If there is already a Todo child, revise that instead of creating another.
3. Save the child in Linear under the parent (same team, project, and priority) with status Todo, using the template.
4. Ask the user to approve. Revise on feedback. On approval, move it to In Progress.
5. Reply with the child's link, its status, and why it comes next.

If there is nothing sensible to plan, stop and tell the user why.

## A good child

- Moves the parent toward its outcome without expanding it.
- Has one theme and a result someone can check on the running system.
- Describes behavior, not code.
- Titled by what changes, not "Implement…" or "Phase N".

## Template

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
