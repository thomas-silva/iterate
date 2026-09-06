#!/usr/bin/env bun

import {
  apiJson,
  clip,
  fmtDur,
  parseArgs,
  type AgentList,
  type AgentListItem,
  type Me,
  type Run,
  type RunList,
} from "./client.ts";

const CONCURRENCY = 8;

async function listAgents(includeArchived: boolean): Promise<AgentListItem[]> {
  const items: AgentListItem[] = [];
  let cursor: string | undefined;
  do {
    const qs = new URLSearchParams({
      limit: "100",
      includeArchived: includeArchived ? "true" : "false",
    });
    if (cursor) qs.set("cursor", cursor);
    const page = await apiJson<AgentList>(`/v1/agents?${qs}`);
    items.push(...(page.items ?? []));
    cursor = page.nextCursor;
  } while (cursor);
  return items;
}

async function latestRun(agentId: string): Promise<Run | undefined> {
  const page = await apiJson<RunList>(
    `/v1/agents/${agentId}/runs?limit=1`,
  );
  return page.items?.[0];
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return out;
}

const { flags } = parseArgs(Bun.argv.slice(2));
const limit = Number(flags.limit ?? 20);
const includeArchived = Boolean(flags["include-archived"]);
const asJson = Boolean(flags.json);

const me = await apiJson<Me>("/v1/me");
const agents = await listAgents(includeArchived);
const rows = await mapPool(agents, CONCURRENCY, async (ag) => {
  const run = await latestRun(ag.id);
  return { agent: ag, run };
});

rows.sort((a, b) =>
  (b.run?.updatedAt ?? "").localeCompare(a.run?.updatedAt ?? ""),
);
const shown = rows.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 20);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        me: { apiKeyName: me.apiKeyName, userEmail: me.userEmail },
        total: rows.length,
        items: shown.map(({ agent, run }) => ({
          name: agent.name,
          agentId: agent.id,
          agentStatus: agent.status,
          url: agent.url,
          runId: run?.id,
          runStatus: run?.status,
          runCreatedAt: run?.createdAt,
          runUpdatedAt: run?.updatedAt,
          durationMs: run?.durationMs,
          prUrl: run?.git?.branches?.[0]?.prUrl,
          branch: run?.git?.branches?.[0]?.branch,
        })),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

console.log(
  `me ${me.userEmail ?? "?"} key=${me.apiKeyName ?? "?"} agents=${rows.length} showing=${shown.length}`,
);
console.log(
  `${"run_updated".padEnd(20)} ${"dur".padStart(6)} ${"status".padEnd(9)} name  agent_id  run_id  pr`,
);
for (const { agent, run } of shown) {
  const ru = (run?.updatedAt ?? "").replace("T", " ").slice(0, 19);
  const pr = run?.git?.branches?.[0]?.prUrl ?? "";
  console.log(
    `${ru.padEnd(20)} ${fmtDur(run?.durationMs).padStart(6)} ${(run?.status ?? "?").padEnd(9)} ${clip(agent.name, 42)}  ${agent.id}  ${run?.id ?? "-"}  ${pr}`,
  );
}
