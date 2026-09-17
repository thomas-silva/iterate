---
name: finish-parent
description: Finish a Linear parent feature whose children are all Done. Review the combined implementation end to end, fix in-scope findings, prove parent Acceptance, then open or update one PR and move the parent to In Review. Use when the user runs /finish-parent, or asks to review a whole parent feature, prepare it for PR review, or propose it.
---

# Finish Parent

Review the whole feature, then propose it as one PR. Individual children were already reviewed; this checks that they work together.

## Resolve

- From the user's Linear URL or ID. If it names a child, use its parent.
- Read the parent, its children, and their comments.
- Any open child (not Done or Canceled) → stop; the feature is not finished.
- Use the parent's Linear git branch. PR base: the base the user named, else the repo's documented base, else the default branch. Read the repo's PR guidance and any open PR for the branch.

## Workflow

1. Read the combined diff against the base, with nearby code for context.
2. Prove every parent Acceptance row as described in [Proof](../implement-sub-issue/SKILL.md#proof). Reuse child evidence where it still holds; re-check where later changes could have broken it.
3. Review against the criteria below. Fix in-scope findings, preferring deletion, consolidation, or reuse. Commit and push with the parent ID in the message, then re-check affected rows.
4. Save one comment on the parent: tested commit, Acceptance proof, findings fixed, and findings remaining.
5. Unproven rows, or a remaining finding that breaks the parent outcome or intended architecture → post `Blocked:` with the reason on the parent and stop without a PR.
6. If the user asked for a review only, stop here and report.
7. Write the PR from the template, adapted to the repo's PR guidance. Create it, or update the open PR for the branch. Read it back and check the base, head, and that every link and image opens.
8. Comment the PR link on the parent and move the parent to In Review, whatever open status it had. Do not merge or mark it Done.
9. Reply with the PR URL, parent URL, and the parent's actual status. Never claim a step that failed.

## Criteria

- **Outcome**: the combined feature delivers the parent's outcome and Acceptance end to end.
- **Integration**: children agree on interfaces, shared state, and assumptions; failure paths work across them.
- **Simplification**: no duplicate mechanisms, conflicting approaches, or leftover intermediate code between children. Only changes with a concrete benefit.
- **Regressions**: existing behavior touched by the diff still works; choose focused checks.

## PR template

Lead with what users can now do. Omit empty sections and work history.

```markdown
## Outcome
[What users can now do; a before/after example when useful.]

## Implementation
[Main design choices and tradeoffs, from the final diff.]

## Evidence
Tested commit: [SHA]. Environment: [running system and fixture].

| Parent acceptance | Result | Proof |
|---|---|---|
| [Criterion] | [What was observed] | [Link] |

[A few screenshots or recordings, each with a caption saying what it shows.]

## Limitations
[Known constraints or deferred work; omit when none.]

Parent: [link]
Children: [links]
```
