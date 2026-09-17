---
name: iterate-parent
description: Run a Linear parent as a loop of child issues, one at a time. Read the open child's status, run the skill for that status (plan, implement, or review), and check that the status moved. Stops when parent Acceptance is proven, when the user is needed, or at the cap. Use when the user runs /iterate-parent, asks to iterate a parent issue, or to loop plan-implement-review until the parent looks complete.
---

# Iterate Parent

Run the loop for one parent. The parent is the feature; each child is the next piece of it. Linear status is the only state, so re-running this skill after a crash resumes where it left off.

## Child status

At most one child is **open** (not Done or Canceled). Each skill moves the open child forward one status:

| Status | Meaning | Next skill | Moves it to |
|---|---|---|---|
| Todo | Draft waiting for the user's approval | `plan-sub-issue` (revise, ask again) | In Progress, only on the user's approval |
| In Progress | Approved; being built | `implement-sub-issue` | In Review |
| In Review | Built; being reviewed | `review-sub-issue` | Done |
| Done | Reviewed, proven, no P1 left | — | — |

A skill that cannot move the child leaves its status unchanged and posts a comment starting `Blocked:` with the reason.

## Resolve

- From the user's Linear URL or ID. If it names a child, use its parent.
- Read the parent, its children, and their comments.
- Cap: 20 children created this run, unless the user named another cap.

## Loop

1. **Open child exists** → run the skill for its status. Run implement and review as subagents when available (pass the child URL and parent branch); otherwise run them in this session. Run planning in this session.
2. Re-read the child. Status moved → repeat from 1. Status did not move → stop **Needs you** with the `Blocked:` comment, or "waiting for approval" for a Todo child.
3. **No open child** → check the parent: every parent Acceptance row is proven by Done children's evidence, and a spot-check of the running system agrees → stop **Complete**.
4. Otherwise, cap reached → stop **Cap**. Else run `plan-sub-issue` to draft the next child → repeat from 1. If planning saved no child → stop **Needs you** with its reason.

Never run two skills at once, and run nothing while waiting for the user. Do not edit the parent or change its status.

## Stop

Reply with the parent URL and one reason:

- **Complete**: parent Acceptance is proven. Next: `/finish-parent`.
- **Needs you**: the reason, and what the user can do (approve or revise the draft, or resolve the blocker).
- **Cap**: the cap was reached.
