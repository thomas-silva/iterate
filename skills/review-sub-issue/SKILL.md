---
name: review-sub-issue
description: Review one implemented Linear child issue for alignment, architecture, worthwhile simplification, and live-system acceptance. Fix in-scope findings, prefer simplification, commit and push, then comment the evidence and what remains on the issue. Use when the user runs /review-sub-issue, asks to review a Linear sub-issue or child issue, or to review-step a Linear issue.
---

# Review Sub-Issue

Review one implemented Linear child in code and on the running system. Fix in-scope findings, simplify where worthwhile, and comment the evidence and what remains. The parent issue is the feature goal; the child is the step.

## Resolve

- From the user's Linear URL or ID.
- Issue has a parent → that issue is the child; its parent is the feature.
- Issue has no parent → it is the feature. Target the incomplete child.
- Read parent, target child, siblings, and comments (`get_issue`, `list_issues` with `parentId`, `list_comments`).
- If there is no implementation to review, stop.

## Workflow

1. Identify the target child's implementation commits on the parent's git branch using its issue, evidence comments, and git history. Review the changes for that child, reading adjacent code as needed for context. If the child's changes cannot be identified reliably, report the ambiguity and stop.
2. Run the child's Acceptance `Proven by` rows on the running system. Unreachable live surfaces are findings.
3. Review alignment, architecture, simplification, and live evidence.
4. Output ranked findings. If none, skip to 7.
5. Fix all in-scope findings, including worthwhile simplifications, limited to the child and required adjacent code. First consider deletion, consolidation, or reuse; otherwise make the smallest correction that satisfies the intended behavior. Leave out-of-scope findings as comments.
6. Re-review the changes and re-run affected acceptance checks. If an in-scope finding cannot be resolved or acceptance remains unproven, save the evidence and blocker in a child comment, report it, and stop without marking the child Done.
7. Commit and push remaining changes on the parent branch. Do not open a PR.
8. `save_comment` on the child with the demonstrated outcome, acceptance evidence, lessons that affect the next slice, and remaining findings (or none). Follow [Persist evidence](../implement-sub-issue/SKILL.md#persist-evidence), using results from this review against the final tested commit. Save and verify this even when review finds no issues; only then set the child to Done. Reply with the child URL and branch. Do not edit the parent, or create a sibling.
9. Recap to the user.

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
- Look for worthwhile simplification even when behavior is correct; it is a core review criterion.
- Prefer deletion, consolidation, and reuse over added machinery.
- Reduce states, branches, indirection, and duplicated decisions.
- Prefer one simplification that resolves several findings.
- Preserve intended behavior and scope. Require a concrete reduction in complexity or maintenance burden; omit cosmetic rewrites and speculative abstractions.

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

Within findings, include actionable issues only. Omit praise and style nits.
