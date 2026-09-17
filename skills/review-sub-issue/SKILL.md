---
name: review-sub-issue
description: Review an implemented Linear child of a parent feature in code and on the running system, fix and simplify what belongs to it, and move it to Done when proven. Use when the user runs /review-sub-issue, asks to review a Linear sub-issue or child issue, or to review a Linear child's implementation.
---

# Review Sub-Issue

Review the parent's built child (In Review) with fresh eyes, and fix what belongs to it.

## Workflow

1. Read the parent, the child, and the child's comments. If given the parent, work on its open child.
2. Review the child's commits (`git log --grep <child ID>`) and check each Acceptance row on the running system (see [Proof](../implement-sub-issue/SKILL.md#proof)).
3. Fix what belongs to this child, simplifying where it helps. Commit and push with the child ID.
4. Comment on the child: what works, the proof, lessons for the next child, and anything left for later.
5. Proven, with no P1 left → move it to Done. Otherwise stop and tell the user why.

## What to look for

- **Fit**: does what the child and parent intend; nothing missing, extra, or conflicting.
- **Architecture**: clear ownership and data flow; fits the project; no duplicate paths or needless abstractions.
- **Simplification**, even when it works: prefer deleting, merging, or reusing over adding. Skip cosmetic rewrites.

Rank findings: **P1** breaks the outcome or the architecture; **P2** real maintenance risk; **P3** worthwhile simplification. Actionable issues only.
