---
name: implement-sub-issue
description: Implement the approved (In Progress) Linear child of a parent feature. Commit and push on the parent's branch, prove acceptance on the running system, save evidence, then move the child to In Review. Use when the user runs /implement-sub-issue, asks to implement a Linear sub-issue or child issue, or to execute a planned Linear child.
---

# Implement Sub-Issue

Build one approved Linear child. The parent is the feature; the child is the next piece of it.

## Resolve

- From the user's Linear URL or ID. If it names the parent, use its open child (not Done or Canceled).
- Read the parent, the child, and the child's comments, including earlier `Blocked:` notes.
- Child must be In Progress. Todo means not yet approved; stop and say so. Any other status: stop and report it.

## Workflow

1. Check out the parent's Linear git branch, creating it from the repo default branch if needed. Continue from any commits already there for this child.
2. Build the child's Outcome, Scope, and Acceptance. Do not expand scope, edit the parent, or create another child.
3. Commit and push after each working part. Put the child ID in every commit message. Do not open a PR.
4. Prove every Acceptance row as described in [Proof](#proof).
5. Save the evidence comment on the child, then move it to In Review. Reply with the child URL, branch, and status.

If you cannot finish or prove the child, push what works, post `Blocked:` with the reason on the child, leave it In Progress, and stop.

## Proof

Shared by every skill in this repo.

An Acceptance row is proven when it is seen working on the running system. A Playwright run against the live app counts; unit tests or mocks alone do not.

Save one Linear comment on the issue being worked on that maps each row to its result and proof, with the tested commit SHA and environment. Attach screenshots or link durable logs and recordings; local file paths do not count. Read the comment back and check its links open.
