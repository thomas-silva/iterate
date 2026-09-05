---
name: implement-sub-issue
description: Implement one Linear child issue from its existing plan. Prove FE acceptance with Playwright, commit locally on a stacked branch without pushing or opening a PR, then mark the child In Review. Use when the user runs /implement-sub-issue, asks to implement a Linear sub-issue or child issue, or to execute a planned Linear child.
---

# Implement Sub-Issue

Implement one Linear child from its existing plan. The parent is the feature; the child is the step.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → that issue is the child; its parent is the feature.
- Issue has no parent → it is the feature. Target the in-progress child, else the oldest incomplete child.
- Read parent, target child, and siblings (`get_issue`, `list_issues` with `parentId`).
- If there is no planned child, stop.

## Constraints

- Implement the child's Intended outcome, Scope, and Acceptance. Do not expand scope, edit the parent, or create a sibling.
- Prove FE Acceptance rows with Playwright tests only.
- Base = latest Done sibling's branch, else the repo default branch. Create or check out the Linear git branch (`get_issue`) from that base.
- Commit locally as you go. Do not push. Do not open a PR.
- When every Acceptance row passes, `save_issue` the child `state` to In Review. Do not complete it.

## Workflow

1. Resolve the child. If it is already In Review, completed, or canceled, stop.
2. Create or check out the child's Linear git branch from the stack base.
3. Implement included scope.
4. Prove FE rows with Playwright; prove any non-FE rows as the child's Proven by states.
5. Commit locally. Repeat 3–5 until Acceptance passes.
6. Set the child to In Review. Reply with the child URL and branch.
