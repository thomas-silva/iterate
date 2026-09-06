#!/usr/bin/env bun

import {
  apiGet,
  apiJson,
  clip,
  parseArgs,
  parseSse,
  type RunList,
} from "./client.ts";

const EDIT_TOOLS = new Set(["edit_file", "write", "apply_patch", "search_replace"]);
const TASK_TOOLS = new Set(["task", "Task"]);
const SCREEN_TOOLS = new Set(["record_screen", "computerUse", "computer_use"]);
const SHELL_TOOLS = new Set(["run_terminal_cmd", "Shell"]);
const NOTABLE_SHELL = /git |npm |pnpm |make |docker |vitest|jest |pytest|curl |psql|commit|test /i;

function tsFromEventId(id?: string): Date | undefined {
  if (!id) return;
  const head = id.split("-")[0];
  if (!/^\d{12,}$/.test(head)) return;
  const ms = Number(head);
  if (ms < 1_577_836_800_000 || ms > 2_082_758_400_000) return;
  return new Date(ms);
}

function parseIso(s: string | boolean | undefined): Date | undefined {
  if (typeof s !== "string" || !s) return;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function inWindow(t: Date | undefined, from?: Date, to?: Date): boolean {
  if (!t) return !from && !to;
  if (from && t < from) return false;
  if (to && t >= to) return false;
  return true;
}

const { positional, flags } = parseArgs(Bun.argv.slice(2));
const agentId = positional[0];
let runId = positional[1];
if (!agentId) {
  console.error(
    "usage: bun stream-summary.ts <bc-id> [run-id] [--from ISO] [--to ISO]",
  );
  process.exit(1);
}
const from = parseIso(flags.from);
const to = parseIso(flags.to);

if (!runId) {
  const runs = await apiJson<RunList>(`/v1/agents/${agentId}/runs?limit=1`);
  runId = runs.items?.[0]?.id;
  if (!runId) {
    console.error(`no runs for ${agentId}`);
    process.exit(1);
  }
}

const { status, headers, text } = await apiGet(
  `/v1/agents/${agentId}/runs/${runId}/stream`,
  "text/event-stream",
);
const retention =
  headers.get("x-cursor-stream-retention-seconds") ??
  headers.get("X-Cursor-Stream-Retention-Seconds") ??
  "?";

if (status === 410) {
  console.error(
    `stream expired for ${runId} (http 410, retention=${retention}s). Use conversation.ts + run clocks + gh commits.`,
  );
  console.error(text.slice(0, 400));
  process.exit(2);
}
if (status >= 400) {
  console.error(`GET stream -> ${status}\n${text.slice(0, 800)}`);
  process.exit(1);
}

const events = parseSse(text);
const toolCounts: Record<string, number> = {};
const eventCounts: Record<string, number> = {};
const edits: string[] = [];
const tasks: string[] = [];
const screens: string[] = [];
const shells: string[] = [];
const steps: string[] = [];
let firstTs: Date | undefined;
let lastTs: Date | undefined;

for (const ev of events) {
  eventCounts[ev.event ?? "?"] = (eventCounts[ev.event ?? "?"] ?? 0) + 1;
  const t = tsFromEventId(ev.id);
  if (t) {
    if (!firstTs || t < firstTs) firstTs = t;
    if (!lastTs || t > lastTs) lastTs = t;
  }
  if (!inWindow(t, from, to)) continue;
  const tstr = t ? t.toISOString().slice(11, 19) : "       ";

  if (ev.event === "interaction_update") {
    try {
      const d = JSON.parse(ev.data) as {
        type?: string;
        stepId?: number;
        stepDurationMs?: number;
      };
      if (d.type === "step-completed") {
        steps.push(
          `${tstr} step ${d.stepId ?? "?"} dur=${d.stepDurationMs ?? "?"}ms`,
        );
      } else if (d.type === "turn-ended") {
        steps.push(`${tstr} TURN-ENDED`);
      } else if (d.type === "user-message-appended") {
        steps.push(`${tstr} USER`);
      }
    } catch {
      /* ignore malformed */
    }
    continue;
  }

  if (ev.event !== "tool_call") continue;
  let d: {
    name?: string;
    status?: string;
    args?: Record<string, unknown>;
  };
  try {
    d = JSON.parse(ev.data) as typeof d;
  } catch {
    continue;
  }
  if (d.status !== "completed") continue;
  const name = d.name ?? "?";
  toolCounts[name] = (toolCounts[name] ?? 0) + 1;
  const args = d.args ?? {};
  if (EDIT_TOOLS.has(name)) {
    const path = String(
      args.path ?? args.target_file ?? args.file_path ?? "",
    );
    edits.push(`${tstr} ${name} ${path}`);
  } else if (TASK_TOOLS.has(name)) {
    const desc = clip(
      String(args.description ?? args.prompt ?? args.subagent_type ?? ""),
      200,
    );
    tasks.push(`${tstr} ${desc}`);
  } else if (SCREEN_TOOLS.has(name)) {
    screens.push(`${tstr} ${name} ${clip(JSON.stringify(args), 120)}`);
  } else if (SHELL_TOOLS.has(name)) {
    const cmd = String(args.command ?? "").replace(/\n/g, " ");
    if (NOTABLE_SHELL.test(cmd)) {
      shells.push(`${tstr} ${clip(cmd, 180)}`);
    }
  }
}

console.log(
  `agent ${agentId} run ${runId} bytes=${text.length} events=${events.length} retention=${retention}s`,
);
console.log(
  `stamped ${firstTs?.toISOString() ?? "?"} -> ${lastTs?.toISOString() ?? "?"}`,
);
if (from || to) {
  console.log(
    `window ${from?.toISOString() ?? "…"} -> ${to?.toISOString() ?? "…"}`,
  );
}
console.log("event types", JSON.stringify(eventCounts));
console.log("tool counts (completed, in window)", JSON.stringify(toolCounts));

const dump = (title: string, rows: string[], cap = 80) => {
  console.log(`\n${title} (${rows.length})`);
  for (const row of rows.slice(0, cap)) console.log(`  ${row}`);
  if (rows.length > cap) console.log(`  … ${rows.length - cap} more`);
};

dump("edits", edits);
dump("tasks", tasks);
dump("record/computer", screens);
dump("notable shells", shells);
dump("steps", steps, 40);
