#!/usr/bin/env bun

import { mkdirSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  apiGet,
  clip,
  fmtDur,
  openSse,
  parseArgs,
  readSse,
  type Run,
  type RunGit,
  type SseEvent,
} from "../../cursor-cloud-agents/scripts/client.ts";

const USAGE = "usage: bun watch.ts <bc-id> <run-id>";
const TERMINAL = new Set(["FINISHED", "ERROR", "CANCELLED", "EXPIRED"]);
const FAIL = new Set(["ERROR", "EXPIRED"]);
const MAX_CONNECT_FAILS = 20;

function grokHome(): string {
  return process.env.GROK_HOME?.trim() || join(homedir(), ".grok");
}

function logLine(path: string, line: string): void {
  appendFileSync(path, line.endsWith("\n") ? line : `${line}\n`);
}

function branchOf(git?: RunGit): string {
  return git?.branches?.[0]?.branch ?? "-";
}

function extraOf(opts: {
  durationMs?: number;
  git?: RunGit;
  url: string;
  detail?: string;
}): string {
  const parts = [
    `duration=${fmtDur(opts.durationMs)}`,
    `branch=${branchOf(opts.git)}`,
    opts.url,
  ];
  if (opts.detail) parts.push(clip(opts.detail, 160));
  return parts.join(" ");
}

function emit(
  kind: "DONE" | "FAILED" | "CANCELLED",
  agentId: string,
  runId: string,
  extra: string,
  exitCode: number,
): never {
  console.log(`${kind}: ${agentId} ${runId} ${extra}`.trimEnd());
  process.exit(exitCode);
}

function emitFromStatus(
  status: string,
  agentId: string,
  runId: string,
  extra: string,
): void {
  const s = status.toUpperCase();
  if (s === "FINISHED") emit("DONE", agentId, runId, extra, 0);
  if (s === "CANCELLED") emit("CANCELLED", agentId, runId, extra, 0);
  if (FAIL.has(s)) emit("FAILED", agentId, runId, extra, 1);
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

const { positional } = parseArgs(Bun.argv.slice(2));
const agentId = positional[0];
const runId = positional[1];
if (!agentId || !runId) {
  console.log(`FAILED: missing ids. ${USAGE}`);
  process.exit(1);
}

if (!process.env.CURSOR_API_KEY?.trim()) {
  console.log(
    "FAILED: Missing CURSOR_API_KEY (often set but not exported). Run: export CURSOR_API_KEY",
  );
  process.exit(1);
}

const url = `https://cursor.com/agents/${agentId}`;
const logDir = join(grokHome(), "long-running-background-tasks");
mkdirSync(logDir, { recursive: true });
const logPath = join(logDir, `cursor-cloud-session_${runId}.log`);
const streamPath = `/v1/agents/${agentId}/runs/${runId}/stream`;

let lastEventId: string | undefined;
let backoffMs = 1000;
let connectFails = 0;

function record(ev: SseEvent): void {
  if (ev.id) lastEventId = ev.id;
  logLine(
    logPath,
    `${new Date().toISOString()} event=${ev.event ?? "-"} id=${ev.id ?? "-"} ${ev.data}`,
  );
}

async function fromRun(reason: string): Promise<"running" | never> {
  const got = await fetchRun(agentId, runId);
  if (got.status === 404) {
    emit("FAILED", agentId, runId, `${reason} http 404 ${clip(got.text, 120)}`, 1);
  }
  if (got.status === 401 || got.status === 403) {
    emit("FAILED", agentId, runId, `${reason} http ${got.status}`, 1);
  }
  const run = got.run;
  if (!run) {
    logLine(
      logPath,
      `${new Date().toISOString()} fallback ${reason} fetch_http=${got.status}`,
    );
    return "running";
  }
  const extra = extraOf({
    durationMs: run.durationMs,
    git: run.git,
    url,
    detail: run.result,
  });
  logLine(
    logPath,
    `${new Date().toISOString()} fallback ${reason} status=${run.status}`,
  );
  if (TERMINAL.has((run.status ?? "").toUpperCase())) {
    emitFromStatus(run.status, agentId, runId, extra);
    emit("FAILED", agentId, runId, `${reason} run=${run.status} ${extra}`, 1);
  }
  return "running";
}

async function failConnect(reason: string): Promise<void> {
  connectFails += 1;
  logLine(logPath, `${new Date().toISOString()} ${reason} fails=${connectFails}`);
  if (connectFails >= MAX_CONNECT_FAILS) {
    emit("FAILED", agentId, runId, `${reason} after ${connectFails} attempts`, 1);
  }
  await Bun.sleep(backoffMs);
  backoffMs = Math.min(backoffMs * 2, 30_000);
}

while (true) {
  let conn: Awaited<ReturnType<typeof openSse>>;
  try {
    conn = await openSse(streamPath, lastEventId);
  } catch (err) {
    await failConnect(`connect_error ${String(err)}`);
    continue;
  }

  if (conn.status === 410) {
    await fromRun("stream_expired");
    emit("FAILED", agentId, runId, "stream_expired (run still active)", 1);
  }

  if (conn.status === 404) {
    emit("FAILED", agentId, runId, `http 404 ${clip(conn.text, 120)}`, 1);
  }

  if (conn.status === 401 || conn.status === 403) {
    emit(
      "FAILED",
      agentId,
      runId,
      `http ${conn.status} ${clip(conn.text, 120)}`,
      1,
    );
  }

  if (conn.status >= 400 || !conn.body) {
    await failConnect(`http ${conn.status} ${clip(conn.text, 400)}`);
    continue;
  }

  connectFails = 0;
  backoffMs = 1000;
  try {
    for await (const ev of readSse(conn.body)) {
      record(ev);
      const name = ev.event ?? "";
      if (
        name === "heartbeat" ||
        name === "assistant" ||
        name === "thinking" ||
        name === "tool_call" ||
        name === "interaction_update"
      ) {
        continue;
      }

      let data: {
        status?: string;
        text?: string;
        message?: string;
        code?: string;
        durationMs?: number;
        git?: RunGit;
      } = {};
      if (ev.data) {
        try {
          data = JSON.parse(ev.data) as typeof data;
        } catch {
          data = {};
        }
      }

      if (name === "status") {
        const s = (data.status ?? "").toUpperCase();
        if (s === "FINISHED") {
          await fromRun("status_finished");
          emit("DONE", agentId, runId, extraOf({ url, detail: "status FINISHED" }), 0);
        }
        if (s === "ERROR" || s === "EXPIRED") {
          emit("FAILED", agentId, runId, extraOf({ url, detail: s }), 1);
        }
        if (s === "CANCELLED") {
          emit("CANCELLED", agentId, runId, extraOf({ url }), 0);
        }
        continue;
      }

      if (name === "error") {
        emit(
          "FAILED",
          agentId,
          runId,
          extraOf({
            url,
            detail: data.message ?? data.code ?? ev.data,
          }),
          1,
        );
      }

      if (name === "result") {
        const extra = extraOf({
          durationMs: data.durationMs,
          git: data.git,
          url,
          detail: data.text,
        });
        emitFromStatus(data.status ?? "", agentId, runId, extra);
        emit("FAILED", agentId, runId, `result status=${data.status ?? "?"} ${extra}`, 1);
      }

      if (name === "done") {
        await fromRun("stream_done");
        emit("FAILED", agentId, runId, extraOf({ url, detail: "done without result" }), 1);
      }
    }
  } catch (err) {
    logLine(logPath, `${new Date().toISOString()} stream_error ${String(err)}`);
  }

  await fromRun("stream_eof");
  logLine(logPath, `${new Date().toISOString()} reconnect lastEventId=${lastEventId ?? "-"}`);
  await Bun.sleep(backoffMs);
  backoffMs = Math.min(backoffMs * 2, 30_000);
}
