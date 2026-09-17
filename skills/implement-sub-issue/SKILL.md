---
name: implement-sub-issue
description: Implement an approved Linear child of a parent feature on the parent's branch, prove it works on the running system, and move it to In Review. Use when the user runs /implement-sub-issue, asks to implement a Linear sub-issue or child issue, or to execute a planned Linear child.
---

# Implement Sub-Issue

Build the parent's approved child (In Progress).

## Workflow

1. Read the parent, the child, and the child's comments. If given the parent, work on its open child.
2. Work on the parent's Linear git branch, created from the repo's base branch if it does not exist.
3. Build the child's Outcome and Scope. Don't expand it.
4. Commit and push as you go, with the child ID in each commit message. Don't open a PR.
5. Prove each Acceptance row (see [Proof](#proof)), save the evidence on the child, and move it to In Review.

If the child isn't approved yet, or you get stuck, stop and tell the user why.

## Proof

Proven means seen working on the running system. A Playwright run against the live app counts; unit tests alone don't.

Save a Linear comment mapping each Acceptance row to what you saw, with the commit SHA and screenshots or links that others can open.
