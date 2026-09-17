---
name: iterate-parent
description: Build a Linear parent feature one child issue at a time. Plan the next child with the user, implement it, review it, and repeat until the parent's outcome works. Use when the user runs /iterate-parent, asks to iterate a parent issue, or to loop plan-implement-review until the parent is complete.
---

# Iterate Parent

For a parent issue: plan the next child with the user → implement it → review it → repeat until the parent's outcome works.

## Rules

- **One child at a time.** Work only on the parent's open child (not Done or Canceled).
- **Only the user approves a child** before work starts.
- **Linear status shows where things stand**, so a re-run picks up where it left off:
  - Todo: waiting for approval → `plan-sub-issue`
  - In Progress: approved → `implement-sub-issue`
  - In Review: built → `review-sub-issue`
  - Done: reviewed and proven
- **If something is unclear or stuck, stop and tell the user why.**

## Loop

1. Read the parent, its children, and their comments.
2. If there is an open child, run the skill for its status. Run implement and review as subagents if you can; otherwise run them here.
3. If there is no open child and the parent's outcome works on the running system, stop: ready for `/finish-parent`.
4. Otherwise run `plan-sub-issue` to draft the next child.
5. If the child advanced (approved, built, or reviewed), go back to 1. If it is still waiting for approval or stuck, stop and tell the user why.

Do not edit the parent.
