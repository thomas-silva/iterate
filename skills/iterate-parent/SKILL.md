---
name: iterate-parent
description: Run a Linear parent as serial child iterations. The main agent checks parent done before each plan, gates the child plan against the parent, and delegates plan, implement, and review to subagents. Use when the user runs /iterate-parent, asks to iterate a parent issue, or to loop plan-implement-review until the parent looks complete.
---

# Iterate Parent

Run the parent loop. You are the main agent. Do not plan, implement, or review yourself.

The parent is the feature. Each iteration is one child. Never a second in-flight child. Do not edit the parent. Do not mark the parent Done.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → iterate its parent unless the user named that child as the target.
- Issue has no parent → it is the parent.
- Read parent, children, and comments.
- Cap: 20 children this run unless the user named another cap.

## Subagents

Sequential, same checkout, not isolated VMs. Prompt: Linear URL, stack base branch, plus "follow skill X". Return: child URL, branch, stop reason.

- `plan-sub-issue`
- `implement-sub-issue`
- `review-sub-issue`

## Done check (before every plan)

Re-read the parent Acceptance table and the running system. Linear child state is not enough.

Stop, and do not plan, when:

- Complete — every parent Acceptance row is proven live
- Unsliceable — parent has no observable outcome
- Stuck — remainder exists but is not a one-pass child
- Blocked — last review left a P1
- No progress — plan, implement, or review stopped without advancing a child
- Cap — named cap reached

Reply with the parent URL and the stop reason. Do not complete the parent.

Otherwise a child is needed.

## Resume

If an incomplete child exists, do not start a second:

- In Review → review
- In Progress → implement
- Todo → plan (revises that child)

Then continue the loop at the next step.

## Loop

1. Done check. Stop if it says stop.
2. If resume skips plan, skip to that stage.
3. Else plan subagent.
4. Plan gate. Fail → plan again with the fail reason (max 2 gate retries), then Stuck.
5. Implement subagent. Stack base = latest Done sibling branch, else default branch.
6. Review subagent. P1 → stop Blocked.
7. Repeat from 1.

## Stack

Each child branch is created from the last Done child's branch. First child from the repo default branch. Implement commits locally and does not push. Review squashes this child's commits and pushes once.

## Plan gate

Read the child just planned. Pass only if all of:

- Intended outcome is a subset of unmet parent Acceptance, or a Risk whose answer would change what to build.
- Does not contradict parent boundaries or Out of Scope.
- Does not repeat the parent or expand into extra feature work.
- One agent pass, with a live e2e Acceptance row.

Fail is a reason. Do not edit the Linear child.
