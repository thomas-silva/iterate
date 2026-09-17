---
name: finish-parent
description: Finish a Linear parent feature once its children are done. Review the combined implementation end to end, fix what belongs to the feature, prove the parent's Acceptance, open or update one PR, and move the parent to In Review. Use when the user runs /finish-parent, or asks to review a whole parent feature or prepare it for PR review.
---

# Finish Parent

Check that the children work together as one feature, then propose it as one PR.

## Workflow

1. Read the parent, its children, and their comments. If given a child, use its parent.
2. Review the parent branch's combined diff against the repo's base branch.
3. Prove each parent Acceptance row (see [Proof](../implement-sub-issue/SKILL.md#proof)), reusing child evidence where it still holds.
4. Fix what belongs to the feature, simplifying where it helps. Commit and push with the parent ID. Comment the results on the parent.
5. If something can't be fixed here, stop and tell the user why. It can become the next child.
6. Open or update the PR using the template and the repo's PR guidance. Check that its links and images open.
7. Link the PR on the parent and move the parent to In Review. Don't merge or mark it Done.

## What to look for

- The feature delivers the parent's outcome end to end.
- Children agree on interfaces and shared state.
- No duplicate mechanisms or leftover intermediate code between children.
- Existing behavior touched by the diff still works.

## PR template

```markdown
## Outcome
[What users can now do.]

## Implementation
[Main design choices and tradeoffs.]

## Evidence
Tested commit: [SHA].

| Parent acceptance | Result | Proof |
|---|---|---|
| [Criterion] | [What was seen] | [Link] |

## Limitations
[Omit when none.]

Parent: [link] · Children: [links]
```
