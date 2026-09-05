---
name: review-sub-issue
description: Review one implemented Linear child issue for alignment, architecture, worthwhile simplification, and live-system acceptance. Surface ranked findings before edits, apply safe child-local simplifications, squash this child's commits and push once, then comment what remains on the issue. Use when the user runs /review-sub-issue, asks to review a Linear sub-issue or child issue, or to review-step a Linear issue.
---

# Review Sub-Issue

Review one implemented Linear child in code and on the running system. Surface findings before edits, simplify safely, comment what remains. The parent issue is the feature goal; the child is the step.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → that issue is the child; its parent is the feature.
- Issue has no parent → it is the feature. Target the in-progress child, else the newest incomplete child.
- Read parent, target child, siblings, and comments (`get_issue`, `list_issues` with `parentId`, `list_comments`).
- If there is no implementation to review, stop.

## Workflow

1. Inspect uncommitted changes and the child's git branch if present.
2. Run the child's Acceptance `Proven by` rows on the running system. Unreachable live surfaces are findings.
3. Review alignment, architecture, simplification, and live evidence.
4. Output ranked findings to the user before any edits. If none, skip to squash.
5. For each finding, ask whether deletion, consolidation, reuse, fewer states, or less indirection can resolve it.
6. Apply safe, behavior-preserving simplifications limited to the child and required adjacent code.
7. Re-review the code and re-run live rows whose behavior may have changed.
8. Squash commits unique to this child's branch since its base into one commit. Push once (the branch should not exist on remote yet; not `--force`).
9. Set the child to Done and `save_comment` remaining findings. Reply with the child URL and branch. Do not edit the parent, or create a sibling.
10. Recap to the user.

## Review criteria

Alignment:
- Match the parent's outcome, boundaries, and evaluation intent.
- Match the child's intended outcome, scope, and guardrails.
- Flag omitted, extra, or conflicting behavior.

Architecture:
- Preserve clear ownership, boundaries, data flow, and sources of truth.
- Fit established project architecture unless the parent explicitly changes it.
- Flag duplicated ownership, parallel paths, boundary leaks, avoidable coupling, and unsupported abstractions.

Simplification:
- Prefer deletion, consolidation, and reuse over added machinery.
- Reduce states, branches, indirection, and duplicated decisions.
- Prefer one simplification that resolves several findings.
- Leave findings open when simplification cannot resolve them safely.

Live:
- The child's Acceptance rows must pass on the running system with playwright tests.
- Flag failed, skipped, or test-only Proven-by rows.

## Findings

Rank by consequence:

- `P1`: Blocks the expected outcome or contradicts the intended architecture.
- `P2`: Creates material architectural, compatibility, or maintenance risk.
- `P3`: Identifies worthwhile child-local simplification.

Shape:

```markdown
- P1 — `path:line` | `live:surface` — [Issue]. [Consequence]. Simplest correction: [Action].
```

Actionable findings only. Omit praise, summaries, and style nits.
