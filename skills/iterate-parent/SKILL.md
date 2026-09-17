---
name: iterate-parent
description: Run a Linear parent as serial child iterations. The main agent plans each child in-session, gets the user's approval on every child draft, then runs implement and review as separate subagents. Use when the user runs /iterate-parent, asks to iterate a parent issue, or to loop plan-implement-review until the parent looks complete.
---

# Iterate Parent

**Every child draft needs the real user's approval before anything proceeds.** Reach the user in the best way your platform allows: ask in the conversation, use a question or notification tool, or leave a comment where they will see it. Only the user can approve. Never approve on their behalf, treat silence as approval, or let a subagent approve. Run nothing while waiting. If you cannot reach the user, stop with Awaiting approval and include the draft in your reply.

Run the parent loop. You plan. Subagents implement and review.

The parent is the feature. Work one child at a time; never a second in-flight child. Do not edit the parent. Do not mark the parent Done.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → iterate its parent unless the user named that child as the target.
- Issue has no parent → it is the parent.
- Read parent, children, and comments.
- Cap: 20 children this run unless the user named another cap.

## Next step

Linear and the parent branch are the only state. Choose the next step from the latest child:

| Latest child | Next |
|---|---|
| None, or all Done or Canceled | Stop check, then plan |
| Todo | Plan (revise that child) |
| In Progress | Implement |
| In Review | Review |

After a crash or interruption, run `/iterate-parent` again. It resumes from this table.

## Loop

Enter at the step from Next step.

1. **Stop check.** Stop if it says stop.
2. **Plan.** Follow `plan-sub-issue` in this session, including user approval. If it ends without a saved child, stop Stuck.
3. **Implement.** Spawn a subagent with the child URL and parent branch: follow `implement-sub-issue`; return child URL, branch, and status. Wait for it.
4. Re-read the child. Not In Review → stop No progress.
5. **Review.** Spawn a separate subagent with the same inputs: follow `review-sub-issue`; return child URL, branch, status, and remaining P1s. Wait for it.
6. Re-read the child and its review comment. Not Done, or evidence missing or inaccessible → stop No progress. Remaining P1 → stop Blocked.
7. Repeat from 1.

Run subagents in the foreground, one at a time, and never while waiting on the user. If a subagent errors or returns nothing, re-read Linear and decide from its state alone.

## Stop check

Re-read the parent Acceptance table and child evidence, and spot-check the running system. Linear child state is not enough.

Stop reasons:

- Complete — every parent Acceptance row is proven on the running system
- Unsliceable — parent has no observable outcome
- Stuck — remainder exists but does not fit one child
- Blocked — last review left a P1
- No progress — a step ended without advancing its child
- Awaiting approval — the user has not approved the child draft
- Cap — named cap reached

Reply with the parent URL and the stop reason. Complete means ready for `review-parent`; do not complete the parent.
