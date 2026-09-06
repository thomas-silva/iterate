---
name: review-parent
description: Review a Linear parent's combined implementation before proposing it for review. Check the complete outcome, cross-child integration, architecture, simplification, and regressions. Save findings and evidence on the parent without opening a PR or changing its status. Use when the user runs /review-parent or asks to review a whole parent feature before proposing it.
---

# Review Parent

Review the feature as a whole after its children are implemented. Child reviews provide context and evidence; assess how their changes work together.

## Resolve

- Resolve the parent from the user's Linear URL or ID; if it names a child, use its parent.
- Read the parent, children, and their review comments.
- Identify the parent's Linear git branch and its complete diff against the intended PR base. Use the requested base, otherwise the repo's documented base or default branch. Record the reviewed head and base commits.
- If implementation is incomplete or the review boundary is unclear, report the gap and stop.

## Workflow

1. Read the combined diff, using adjacent code as context.
2. Confirm the running system contains the reviewed implementation.
3. Verify every parent Acceptance row end to end. Reuse child evidence where it still proves the final behavior; run fresh checks where integration or subsequent changes could invalidate it.
4. Review the criteria below. Report actionable findings ranked by concrete impact, with code locations or live reproduction evidence.
5. Fix findings within the parent's scope, preferring deletion, consolidation, or reuse where these simplify the correction. Record out-of-scope findings without expanding the feature.
6. Re-review fixes and run affected acceptance and regression checks. Commit and push review changes on the parent branch. Exclude unrelated local changes.
7. Save a review comment on the parent with the final reviewed head and base commits, tested environment, parent acceptance results and durable supporting evidence, findings resolved, remaining findings, meaningful limitations, and verdict: ready to propose, or blocked with the reason.
8. Read back the comment and verify evidence links are accessible. Reply with the parent URL and verdict.

Do not open a PR, change the parent's status, or mark it Done.

## Review criteria

Outcome:
- The complete feature satisfies the parent's intended outcome, Acceptance, boundaries, and guardrails.
- Individual child successes combine into a working end-to-end flow.

Integration:
- Children agree on interfaces, shared state, ownership, and assumptions.
- Relevant failure and recovery paths work across child boundaries.

Architecture and simplification:
- The combined implementation fits the project's architecture.
- Identify duplicated mechanisms, conflicting approaches, and obsolete intermediate code left across children.
- Require a concrete correctness or maintenance benefit; omit cosmetic rewrites and speculative abstractions.

Regressions:
- Check existing behavior materially affected by the combined diff.
- Choose focused checks based on the changes and their likely failures.

## Evidence and readiness

Persist evidence on the parent for both passing and blocked reviews. Map acceptance rows to observed results and supporting proof. Upload relevant screenshots or recordings; save test results or logs directly or link durable artifacts. Temporary workspace paths do not count. Media supplements behavioral checks.

Ready to propose requires proven parent acceptance, resolved in-scope findings, and accessible evidence. If checks or evidence persistence are blocked, record what remains on the parent if possible and report blocked.

The verdict applies to the recorded head and base commits. Before proposing, review any subsequent changes and rerun affected checks, then update the recorded verdict.
