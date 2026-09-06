---
name: iterate-parent
description: Run a Linear parent as serial child iterations. The main agent plans each child in-session, gets approval, then creates the Linear child and launches a Cursor Cloud implement+review session, waiting until new commits are on the parent branch. Use when the user runs /iterate-parent, asks to iterate a parent issue, or to loop plan-implement-review until the parent looks complete.
---

# Iterate Parent

Run the parent loop. You plan. You do not implement or review.

The parent is the feature. Each iteration is one child. Never a second in-flight child. Do not edit the parent. Do not mark the parent Done.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → iterate its parent unless the user named that child as the target.
- Issue has no parent → it is the parent.
- Read parent, children, and comments.
- Cap: 20 children this run unless the user named another cap.

## Skills

- Plan: follow `plan-sub-issue` in this session. That approval also starts the cloud session.
- Ship: follow `cursor-cloud-session` (Cloud runs `implement-review-sub-issue`).
- Inspect: `cursor-cloud-agents` on `FAILED` / `CANCELLED`.

## Done check (before every plan)

Re-read the parent Acceptance table and the running system. Linear child state is not enough.

Stop, and do not plan, when:

- Complete — every parent Acceptance row is proven live
- Unsliceable — parent has no observable outcome
- Stuck — remainder exists but is not a one-pass child
- Blocked — last review left a P1
- No progress — plan or the cloud session stopped without advancing a child
- Cap — named cap reached

Reply with the parent URL and the stop reason. Do not complete the parent.

Complete means ready to propose for review. The separate `propose-parent` skill creates the PR and moves the parent to In Review when invoked.

Otherwise a child is needed.

## Resume

If an incomplete child exists, do not start a second:

- In Review or In Progress → skip to cloud
- Todo → plan (revises that child)

Then continue the loop at that step.

## Loop

1. Done check. Stop if it says stop.
2. If resume skips plan, skip to cloud.
3. Follow `plan-sub-issue`. If it stops without a child, Stuck.
4. Follow `cursor-cloud-session` for that child.
5. After wakeup: re-read the Linear child. `FAILED`/`CANCELLED` or child not Done → stop No progress. Remaining P1 → stop Blocked. Else repeat from 1.
