---
name: cursor-cloud-session
description: Launch a Cursor Cloud agent on the current product repo plus iterate to implement then review one Linear child, then watch until new commits are on the parent branch so Grok is not awake for a 30–60 minute run. Use when the user runs /cursor-cloud-session, asks to start a Cursor cloud session for a Linear sub-issue, or to implement a child in Cursor Cloud.
---

# Cursor Cloud Session

Launch a Cursor Cloud agent to implement then review one Linear child. Repos: current product + iterate (for implement-review-sub-issue). Grok stays off the wait until new commits land on the parent branch or the run crashes.

Skill dir: resolve next to this file (`scripts/*.ts`). Auth: `export CURSOR_API_KEY`. Inspect after wakeup: sibling `cursor-cloud-agents`.

## Resolve

From the Linear URL or ID, same parent/child as implement-sub-issue. Stop if there is no planned child, or the child is completed or canceled. In Review is allowed (sequence starts at review).

Product repo = `git remote` as `https://github.com/owner/repo`. Product ref = parent's Linear git branch (`get_issue` on the parent). `--product-ref` is required; do not pass cwd HEAD. Run launch and watch from the product checkout.

If `origin/<parent-branch>` is missing, create it from the product default branch, push it, then launch. If that parent branch *is* the repo default, pass `--allow-default-ref`.

## Preview

```bash
bun <skill>/scripts/launch.ts \
  --parent <parent-url> \
  --child <child-url> \
  --product-repo <https-github-url> \
  --product-ref <parent-linear-git-branch> \
  --dry-run
```

`--dry-run` prints the JSON and exits. Otherwise POST. `launch.ts` omits the iterate clone when the product repo is iterate.

## Launch

Same command without `--dry-run`. Stdout is one JSON line (`agentId`, `runId`, `url`, `repos`).

If `LINEAR_API_KEY` is exported, launch attaches Linear MCP; otherwise the cloud agent uses dashboard Linear.

## Monitor

Record the parent-branch tip, then launch, then watch. `DONE` when `origin/<parent-branch>` has moved since that SHA and the cloud run has finished. `FINISHED` with no new commits is `FAILED`. Crash/cancel fail-fast.

For a child already In Review, first fetch the parent branch and verify that it contains the child's implementation. Pass `--review-only` to the watcher with that verified tip as `--since`. This allows review to finish without another commit; the watcher still requires that implementation SHA to remain on the remote branch.

```bash
since=$(git rev-parse origin/<parent-branch>)
```

```
monitor(
  command='bun <skill>/scripts/watch-landed.ts <agentId> <runId> --ref <parent-branch> --child <child-id> --since <since>',
  description='Watch landed commits <child-id>'
)
```

Do not poll, stream, or `get_command_or_subagent_output` the wait. `watch-landed.ts` prints one line then exits: `DONE`, `FAILED`, or `CANCELLED`. Full log is in `~/.grok/long-running-background-tasks/cursor-cloud-session_<runId>_landed.log`. Raw SSE (debug): `watch.ts`.

## After wakeup

- `DONE`: re-read the Linear child and review comments. If it is not Done, report No progress; if review left a P1, report Blocked. Verify the review comment maps every Acceptance row to results and durable proof, identifies the tested commit and environment, and its attachments and links are accessible. Missing or inaccessible evidence → report No progress and stop. Otherwise report child URL, branch, agent URL. Do not dump SSE.
- `FAILED` / `CANCELLED`: inspect with `cursor-cloud-agents` (`conversation.ts`), report, do not relaunch.
