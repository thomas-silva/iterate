---
name: implement-review-sub-issue
description: Implement one Linear child from its existing plan, then review it with a subagent. Use when the user runs /implement-review-sub-issue, asks to implement and review a Linear child, or a Cursor Cloud session should ship one child.
---

# Implement then Review

One Linear child: implement, then review as a subagent. You implement. You do not plan a sibling.

Follow the sibling skills next to this file (`../implement-sub-issue/SKILL.md`, `../review-sub-issue/SKILL.md`).

## Workflow

1. Follow `implement-sub-issue`. If it stops because the child is already In Review, continue.
2. Spawn a subagent: Linear URL, parent branch, follow `review-sub-issue`. Return: child URL, branch, remaining P1s.
3. Reply with that return.
