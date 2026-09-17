---
name: plan-sub-issue
description: Draft the next Linear child issue under a parent feature, save it as Todo, and get the user's approval before it moves to In Progress. No code. Use when the user runs /plan-sub-issue, asks for the next Linear sub-issue or child issue, or to break a Linear issue into the next piece of work.
---

# Plan Sub-Issue

Draft one Linear child: the next piece of the parent feature, small enough for one agent to finish in one session. No code.

**Only the user can approve a child.** Ask them in the best way your platform allows: in the conversation, with a question or notification tool, or on the child in Linear. Never approve on their behalf or treat silence as approval. Approval means the user says so explicitly, or moves the child to In Progress themselves.

## Resolve

- From the user's Linear URL or ID. If it names a child, use its parent.
- Read the parent, its children, and their comments. Use Done children's evidence, lessons, and remaining findings to choose what comes next.
- Open child (not Done or Canceled) in Todo → revise it. Open child in any other status → stop; it is already approved.
- Parent has no observable outcome, or the remaining work cannot fit one child → post `Blocked:` with the reason on the parent and stop.
- Every parent Acceptance row already proven → stop; nothing left to plan.

## A good child

- Covers some unmet parent Acceptance, or answers an open question whose answer would change what to build.
- Stays inside the parent's scope; does not repeat or expand it.
- Has one theme and an outcome someone can check on the running system.
- Describes behavior, not code: no file lists or implementation steps.

## Workflow

1. Draft the title and description from the template. The title is the observable change, not "Implement…" or "Phase N".
2. `save_issue`: create with `parentId` and the parent's `team`, `project`, and `priority`, `state` Todo; or update the open Todo child.
3. Ask the user to approve, showing the draft and child URL. Revise on feedback and ask again.
4. On explicit approval, set the child to In Progress. Without it, leave it in Todo.
5. Reply with the child URL, its status, and one sentence on why this child is next.

## Template

```markdown
## Why this child
[1–2 sentences: which unmet parent Acceptance or open question this covers, and why it is next.]

## Outcome
[1–2 sentences: what will visibly work afterward.]

## Scope
Included:
- [2–4 behaviors or deliverables.]

Not included:
- [Parent Acceptance a reader might expect here but a later child covers. Omit when none.]

## Acceptance
| Done when | Proven by |
|---|---|
| [Yes/no observable criterion] | [Where to check it on the running system, and what evidence to save] |

[3–5 rows. At least one checks the running system end to end.]
```
