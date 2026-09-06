---
name: propose-parent
description: Propose a Linear parent for review after its done check passes. Create or update a PR with a concise outcome and implementation debrief plus curated media evidence, then move the parent from In Progress to In Review. Use when the user runs /propose-parent or asks to prepare a completed parent implementation for PR review.
---

# Propose Parent

A passing done check means ready to propose for review. Create the PR and move the Linear parent to In Review. Do not merge or mark the parent Done.

## Resolve

- Resolve the parent from the user's Linear URL or ID; if it names a child, use its parent.
- Read the parent, children, and review comments (`get_issue`, `list_issues` with `parentId`, `list_comments`). Use the parent's Linear git branch.
- Inspect the repo's PR guidance, branch diff, and existing PR for that branch. Use the requested base, otherwise the repo's documented base or default branch. Update an existing open PR rather than create a duplicate.

## Workflow

1. Confirm the [iterate-parent done check](../iterate-parent/SKILL.md#done-check-before-every-plan) passes against the current parent branch: every parent Acceptance row is proven on the running system. Child states alone are insufficient. Resolve stale or missing proof with focused live checks. If acceptance is unproven or a blocking finding remains, report the gap and stop without advancing the parent.
2. Read the final diff and synthesize the parent outcome and implementation. Explain resulting behavior, consequential design choices, tradeoffs, and meaningful limitations. Organize by outcome, not child chronology; link children for detail.
3. Curate the strongest relevant media from child evidence. Prefer a few screenshots or recordings that demonstrate the parent outcome. Verify they represent the final implementation; capture fresh evidence where needed. Map every parent Acceptance row to its demonstrated result and supporting proof. Media supplements behavioral tests; it does not replace them.
4. Prepare the PR title and description using the structure below, adapted to the repo template. Identify the tested commit and environment. Embed useful screenshots, attach or link playable recordings with captions explaining what each proves, and link durable test results or logs. Verify reviewers can access the media and links; temporary workspace paths do not count. If evidence cannot be preserved or accessed, report the blocker and stop without advancing the parent.
5. Ensure the reviewed parent-branch commits are pushed, then create or update the PR. Do not include unrelated local changes. Read back the PR and verify its base, head, description, and evidence. If publishing fails, report the failure and leave the parent's status unchanged.
6. Save a parent comment linking the PR with a brief outcome and evidence summary. Then move the parent from In Progress to In Review (`save_issue`); if already In Review, leave that state. For any other state, report the mismatch without changing it. Preserve the parent description and child states. Report the PR URL, parent URL, and actual status; never claim a failed update succeeded.

## PR debrief

Lead with the concrete user outcome. Keep only details a reviewer needs to assess the change; omit empty sections and routine work history.

```markdown
## Outcome
[What users can now do; a concrete before/after example when useful.]

## Implementation
[Major design choices and meaningful tradeoffs, grounded in the final diff.]

## Evidence
Tested commit: [SHA]. Environment: [running system and relevant fixture].

| Parent acceptance | Demonstrated result | Proof |
|---|---|---|
| [Criterion] | [Observed outcome] | [Durable evidence link] |

[Embed selected media with short captions explaining what each demonstrates.]

## Remaining limitations
[Known constraints or deferred work that affect use or review; omit when none.]

Parent: [issue link]
Supporting children: [relevant issue links]
```
