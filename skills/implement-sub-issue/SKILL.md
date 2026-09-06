---
name: implement-sub-issue
description: Implement one Linear child issue from its existing plan. Prove FE acceptance with Playwright, commit and push on the parent's branch without opening a PR, then mark the child In Review. Use when the user runs /implement-sub-issue, asks to implement a Linear sub-issue or child issue, or to execute a planned Linear child.
---

# Implement Sub-Issue

Implement one Linear child from its existing plan. The parent is the feature; the child is the step.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → that issue is the child; its parent is the feature.
- Issue has no parent → it is the feature. Target the incomplete child.
- Read parent, target child, and siblings (`get_issue`, `list_issues` with `parentId`).
- If there is no planned child, stop.

## Constraints

- Implement the child's Intended outcome, Scope, and Acceptance. Do not expand scope, edit the parent, or create a sibling.
- Prove FE Acceptance rows with Playwright tests only. Do not complete the child.

## Workflow

1. Resolve the child. If it is already In Review, completed, or canceled, stop.
2. Check out the parent's Linear git branch (`get_issue` on the parent), creating it from the repo default branch if it does not exist.
3. Set the child to In Progress if it is not already.
4. Implement included scope.
5. Prove FE rows with Playwright; prove any non-FE rows as the child's Proven by states.
6. Commit and push. Do not open a PR. Repeat 4–6 until Acceptance passes.
7. Set the child to In Review. Reply with the child URL and branch.
