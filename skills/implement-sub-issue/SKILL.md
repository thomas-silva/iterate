---
name: implement-sub-issue
description: Implement one Linear child issue from its existing plan. Prove acceptance on the running system, commit and push on the parent's branch without opening a PR, then mark the child In Review. Use when the user runs /implement-sub-issue, asks to implement a Linear sub-issue or child issue, or to execute a planned Linear child.
---

# Implement Sub-Issue

Implement one Linear child from its existing plan. The parent is the feature; the child is the next piece of it.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → that issue is the child; its parent is the feature.
- Issue has no parent → it is the feature. Target the incomplete child.
- Read parent, target child, and siblings (`get_issue`, `list_issues` with `parentId`).
- If there is no planned child, stop.

## Constraints

- Implement the child's Intended outcome, Scope, and Acceptance. Do not expand scope, edit the parent, or create a sibling.
- Do not mark the child Done.

## Workflow

1. Resolve the child. If it is In Review, Done, or Canceled, stop and report its status.
2. Check out the parent's Linear git branch (`get_issue` on the parent), creating it from the repo default branch if it does not exist. If the child is already In Progress with commits on that branch, continue from them.
3. Set the child to In Progress if it is not already.
4. Implement the next part of included scope.
5. Prove the affected Acceptance rows as described in [Proof and evidence](#proof-and-evidence).
6. Commit and push after each passing part. Do not open a PR. Repeat 4–6 until every Acceptance row passes.
7. Persist evidence on the child, then set it to In Review. Reply with the child URL, branch, and status.

## Proof and evidence

The shared rule for every skill in this repo.

**Proof:** every Acceptance row is proven on the running system. A Playwright run against the live app counts for UI rows. Unit tests or mocks alone do not.

**Evidence:** before advancing an issue, `save_comment` on it mapping each Acceptance row to its result and supporting proof. Include the tested commit and environment. Upload screenshots for visible UI outcomes; save test results or relevant logs in the comment or link durable artifacts. Screenshots supplement behavioral checks. Temporary workspace paths do not count.

Read back the comment and verify its attachments and links are accessible. If evidence cannot be saved or accessed, record the blocker on the issue if possible, report it, and stop without advancing its status.
