---
name: plan-sub-issue
description: Create or revise the next Linear child issue as the next one-agent-pass advancing task under a parent Linear issue treated as the feature goal. Use when the user runs /plan-sub-issue, asks for the next Linear sub-issue or child issue, or to break a Linear issue into the next advancing task.
---

# Plan Sub-Issue

Create or revise one Linear child issue. NO code. The parent issue is the feature goal; the child is the next advancing task.

## Guidelines

- Resolve the parent from the user's Linear URL or ID. If that issue already has a parent, the parent is the feature unless the user named the child to revise.
- Read the parent (`get_issue`, include relations). Read its comments. List children (`list_issues` with `parentId`).
- Read the latest child's review comments and relevant sibling comments (`list_comments`). Use demonstrated outcomes, evidence, lessons, and remaining findings to choose the next slice.
- Inspect the repo only enough to name live eval surfaces. Use `./fixtures/` when present; do not invent fixtures.
- An incomplete child exists → revise it. All children completed/canceled, or none → create the next. Never a second in-flight child.
- Inherit team, project, and priority from the parent. Do not edit the parent.
- Reference the parent; do not repeat its stories, acceptance, or out-of-scope.
- No implementation details, file inventories, or code-level prescriptions.
- Write only the Linear child, and only after the user approves the draft.

## Sub-issue standard

Each child must:

- Cover a subset of unmet parent Acceptance, or a Risk whose answer would change what to build.
- Not contradict parent boundaries or Out of Scope, or repeat/expand the parent.
- Produce an outcome another agent can evaluate end to end on a running system (not tests alone). Define in/out without prescribing code.
- Stay feasible in one agent pass.

## Scoping rubric

One dominant theme, bounded blast radius, compatibility/reversibility only when step-specific. A material uncertainty (its answer would change what to build) → Risk; else Coverage. Not this slice: unmet parent acceptance → Deferred; another issue → omit; never this feature → parent Out of Scope (do not edit the parent).

## Workflow

1. Load parent, comments, and children.
2. If the parent has no observable outcome, stop. The parent needs that first.
3. Choose Risk or Coverage from remaining parent acceptance vs children vs what the product actually does.
4. Title is the observable delta. Not "Implement…", not "Phase N".
5. Present the draft (title + description). Stop. Do not `save_issue` until the user approves.
6. On approval, `save_issue`: create with `parentId`, `team`, `project`, and `priority` from the parent, `state` In Progress; or update the in-flight child. Description uses the template.
7. Reply with the child URL and one sentence on why this slice is next.

## Template

Child issue description:

```markdown
## Why this step
Mode: Risk | Coverage

[1–2 sentences: current uncertainty or coverage gap, why it is next, what later decision its evidence unlocks.]

## Intended outcome
[1–2 sentences: observable end-to-end delta in one agent pass. No proof mechanics.]

## Step-specific approach
[Only when needed. Choice plus rationale not already on the parent. 0–2 bullets.]

## Scope
Included:
- [Semantic deliverable or behavior.]
- [2–4 bullets total.]

Deferred:
- [Unmet parent acceptance this slice does not cover, only if a reader would expect it in this pass.]
- [Omit the heading when none.]

Guardrails:
- [Only step-specific compatibility or reversibility not already on the parent.]

## Acceptance
[Optional: one `diagram-dataflow` per distinct live evaluation flow when the table cannot show the relationship.]

| Done when | Proven by |
|---|---|
| [Binary observable criterion] | [Live surface, fixture, expected evidence] |

[3–5 rows. At least one row exercises the running system end to end.]
```
