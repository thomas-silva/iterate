#!/usr/bin/env bun

import { mkdirSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  apiGet,
  clip,
  parseArgs,
  type Run,
} from "../../cursor-cloud-agents/scripts/client.ts";

const USAGE =
  "usage: bun watch-landed.ts <bc-id> <run-id> --ref <parent-branch> --child <id-or-url> [--since <sha>] [--review-only]";
const FAIL = new Set(["ERROR", "EXPIRED"]);
const POLL_MS_DEFAULT = 30_000;
const GRACE_POLLS_AFTER_FINISHED = 10;
const MAX_TRANSPORT_FAILURES = 5;

function grokHome(): string {
  return process.env.GROK_HOME?.trim() || join(homedir(), ".grok");
}

function logLine(path: string, line: string): void {
  appendFileSync(path, line.endsWith("\n") ? line : `${line}\n`);
}

function flagString(
  flags: Record<string, string | boolean>,
  key: string,
): string | undefined {
  const v = flags[key];
  return typeof v === "string" && v ? v : undefined;
}

function linearId(s: string): string {
  const m = s.match(/\b([A-Z][A-Z0-9]+-\d+)\b/i);
  return m ? m[1].toUpperCase() : s.slice(0, 80).toUpperCase();
}

function sameSha(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x === y) return true;
  const n = Math.min(x.length, y.length);
  return n >= 7 && x.slice(0, n) === y.slice(0, n);
}

function emit(
  kind: "DONE" | "FAILED" | "CANCELLED",
  extra: string,
  exitCode: number,
): never {
  console.log(`${kind}: ${extra}`.trimEnd());
  process.exit(exitCode);
}

async function git(
  args: string[],
  cwd: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code: code ?? 1, stdout, stderr };
}

async function fetchRun(
  agentId: string,
  runId: string,
): Promise<{ status: number; run?: Run; text: string }> {
  const { status, text } = await apiGet(`/v1/agents/${agentId}/runs/${runId}`);
  if (status >= 400) return { status, text };
  try {
    return { status, run: JSON.parse(text) as Run, text };
  } catch {
    return { status, text };
  }
}

const { positional, flags } = parseArgs(Bun.argv.slice(2));
const agentId = positional[0];
const runId = positional[1];
const ref = flagString(flags, "ref")?.trim();
const childRaw = flagString(flags, "child")?.trim();
if (!agentId || !runId || !ref || !childRaw) {
  console.log(`FAILED: missing args. ${USAGE}`);
  process.exit(1);
}

const childId = linearId(childRaw);
const remote = flagString(flags, "remote")?.trim() || "origin";
const cwd = flagString(flags, "dir")?.trim() || process.cwd();
const pollMs = Number(flagString(flags, "poll-interval") ?? POLL_MS_DEFAULT);
const pollEvery = Number.isFinite(pollMs) && pollMs > 0 ? pollMs : POLL_MS_DEFAULT;

if (!process.env.CURSOR_API_KEY?.trim()) {
  console.log(
    "FAILED: Missing CURSOR_API_KEY (often set but not exported). Run: export CURSOR_API_KEY",
  );
  process.exit(1);
}

const url = `https://cursor.com/agents/${agentId}`;
const logDir = join(grokHome(), "long-running-background-tasks");
mkdirSync(logDir, { recursive: true });
const logPath = join(logDir, `cursor-cloud-session_${runId}_landed.log`);

const repoCheck = await git(["rev-parse", "--is-inside-work-tree"], cwd);
if (repoCheck.code !== 0) {
  emit("FAILED", `${agentId} ${runId} not a git repo: ${cwd}`, 1);
}

const sinceArg = flagString(flags, "since")?.trim();
let baseline = sinceArg && /^[0-9a-f]{7,40}$/i.test(sinceArg) ? sinceArg : null;
const reviewOnly = flags["review-only"] === true;
if (reviewOnly && !baseline) {
  emit("FAILED", "--review-only requires --since with the verified implementation SHA", 1);
}
let graceLeft: number | null = null;
let transportFailures = 0;

while (true) {
  const tracking = `${remote}/${ref}`;
  const fetched = await git(
    ["fetch", "--quiet", remote, `+refs/heads/${ref}:refs/remotes/${tracking}`],
    cwd,
  );
  const authFail =
    fetched.code !== 0 &&
    /authentication failed|could not read username|permission denied|403 forbidden|access denied/i.test(
      fetched.stderr,
    );
  if (authFail) {
    emit(
      "FAILED",
      `${agentId} ${runId} ${childId} git fetch auth ${clip(fetched.stderr, 120)}`,
      1,
    );
  }

  const parsed =
    fetched.code === 0
      ? await git(["rev-parse", "--verify", tracking], cwd)
      : { code: 1, stdout: "", stderr: fetched.stderr };
  const tip = parsed.code === 0 ? parsed.stdout.trim() : "";
  if (tip && !baseline) baseline = tip;
  const landed = Boolean(tip && baseline && !sameSha(tip, baseline));

  logLine(
    logPath,
    `${new Date().toISOString()} fetch_code=${fetched.code} tip=${tip || "-"} baseline=${baseline ?? "-"} landed=${landed}`,
  );
  if (fetched.code !== 0) {
    logLine(logPath, `${new Date().toISOString()} fetch_err ${clip(fetched.stderr, 200)}`);
  }
  if (parsed.code !== 0 && fetched.code === 0) {
    logLine(logPath, `${new Date().toISOString()} rev-parse_err ${clip(parsed.stderr, 200)}`);
  }

  let got: Awaited<ReturnType<typeof fetchRun>>;
  try {
    got = await fetchRun(agentId, runId);
    transportFailures = 0;
  } catch (err) {
    transportFailures += 1;
    const detail = clip(String(err), 200);
    logLine(logPath, `${new Date().toISOString()} run_transport_error attempts=${transportFailures} ${detail}`);
    if (transportFailures >= MAX_TRANSPORT_FAILURES) {
      emit("FAILED", `${agentId} ${runId} transport failed after ${transportFailures} attempts: ${detail} ${url}`, 1);
    }
    await Bun.sleep(Math.min(pollEvery * 2 ** (transportFailures - 1), 30_000));
    continue;
  }
  if (got.status === 401 || got.status === 403) {
    emit("FAILED", `${agentId} ${runId} http ${got.status} ${url}`, 1);
  }
  if (got.status === 404) {
    emit("FAILED", `${agentId} ${runId} http 404 ${clip(got.text, 120)} ${url}`, 1);
  }

  const runStatus = (got.run?.status ?? "").toUpperCase();
  logLine(
    logPath,
    `${new Date().toISOString()} run_http=${got.status} run=${runStatus || "-"}`,
  );

  if (runStatus === "CANCELLED") {
    emit("CANCELLED", `${agentId} ${runId} ${childId} ${url}`, 0);
  }
  if (FAIL.has(runStatus)) {
    emit(
      "FAILED",
      `${agentId} ${runId} ${childId} run=${runStatus} ${url}`,
      1,
    );
  }

  let commitsPresent = landed;
  if (reviewOnly && tip && baseline && runStatus === "FINISHED") {
    const ancestor = await git(["merge-base", "--is-ancestor", baseline, tip], cwd);
    commitsPresent = ancestor.code === 0;
  }

  if (commitsPresent && runStatus === "FINISHED") {
    emit("DONE", `${agentId} ${runId} ${childId} ${remote}/${ref} ${url}`, 0);
  }

  if (runStatus === "FINISHED" && !commitsPresent) {
    if (graceLeft === null) graceLeft = GRACE_POLLS_AFTER_FINISHED;
    graceLeft -= 1;
    logLine(logPath, `${new Date().toISOString()} finished_without_commit grace=${graceLeft}`);
    if (graceLeft < 0) {
      emit(
        "FAILED",
        `${agentId} ${runId} ${childId} finished without new commits on ${remote}/${ref} ${url}`,
        1,
      );
    }
  }

  await Bun.sleep(pollEvery);
}
