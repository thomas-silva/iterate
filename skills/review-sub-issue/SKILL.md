---
name: review-sub-issue
description: Review the In Review Linear child of a parent feature in code and on the running system. Fix in-scope findings with simplification as a core criterion, save evidence, and move the child to Done only when acceptance is proven and no P1 remains. Use when the user runs /review-sub-issue, asks to review a Linear sub-issue or child issue, or to review a Linear child's implementation.
---

# Review Sub-Issue

Review one built Linear child, fix what is in scope, and decide whether it is Done. The parent is the feature; the child is the next piece of it.

## Resolve

- From the user's Linear URL or ID. If it names the parent, use its open child (not Done or Canceled).
- Read the parent, the child, and the child's comments.
- Child must be In Review. Otherwise stop and report its status.

## Workflow

1. Find the child's commits on the parent branch (`git log --grep <child ID>`). Review them, reading nearby code as needed.
2. Check every Acceptance row as described in [Proof](../implement-sub-issue/SKILL.md#proof). A row you cannot check is a finding.
3. Review against the criteria below and rank findings.
4. Fix in-scope findings, preferring deletion, consolidation, or reuse; otherwise the smallest correct change. Commit and push with the child ID in the message. Re-check affected rows.
5. Save one comment on the child: outcome, proof, lessons for the next child, and remaining findings with their P labels (or "none").
6. No P1 left and every row proven → move the child to Done. Otherwise post `Blocked:` naming each open P1 or unproven row, leave the child In Review, and stop. The user can resolve it, or accept it by moving the child to Done.
7. Reply with the child URL, branch, and status.

Do not edit the parent or create another child. Do not open a PR.

## Criteria

Alignment:
- Matches the parent's outcome and boundaries, and the child's Outcome and Scope.
- Flag missing, extra, or conflicting behavior.

Architecture:
- Clear ownership, boundaries, data flow, and single sources of truth; fits the project's existing architecture.
- Flag duplicated ownership, parallel paths, leaky boundaries, needless coupling, and unneeded abstractions.

Simplification (core, even when behavior is correct):
- Prefer deletion, consolidation, and reuse over new machinery.
- Fewer states, branches, and indirection; one change that fixes several findings.
- Only for a concrete reduction in complexity; skip cosmetic rewrites.

## Findings

- **P1**: blocks the child's outcome or breaks the intended architecture. The child cannot be Done.
- **P2**: real architecture, compatibility, or maintenance risk.
- **P3**: worthwhile simplification.

```markdown
- P1 — `path:line` or `live:<surface>` — [Issue]. [Consequence]. Fix: [simplest correction].
```

Actionable issues only; no praise or style nits.
