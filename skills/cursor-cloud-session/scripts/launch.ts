#!/usr/bin/env bun

import {
  apiPost,
  parseArgs,
  type AgentRepo,
  type CreateAgentResponse,
} from "../../cursor-cloud-agents/scripts/client.ts";

const ITERATE_REPO = "https://github.com/thomas-silva/iterate";
const ITERATE_REF = "main";

const USAGE = `usage: bun launch.ts --parent <url> --child <url> --product-repo <https-github-url> --product-ref <branch> [--allow-default-ref] [--dry-run]`;
const DEFAULT_REFS = new Set(["main", "master"]);

function flagString(
  flags: Record<string, string | boolean>,
  key: string,
): string | undefined {
  const v = flags[key];
  return typeof v === "string" && v ? v : undefined;
}

function githubHttps(raw: string): string {
  let s = raw.trim();
  const ssh = s.match(/^git@([^:]+):(.+)$/);
  if (ssh) s = `https://${ssh[1]}/${ssh[2]}`;
  const sshUrl = s.match(/^ssh:\/\/git@([^/]+)\/(.+)$/);
  if (sshUrl) s = `https://${sshUrl[1]}/${sshUrl[2]}`;
  s = s.replace(/\.git$/, "");
  return s.replace(/\/+$/, "");
}

function repoKey(url: string): string {
  try {
    const u = new URL(githubHttps(url));
    return u.pathname.replace(/^\//, "").toLowerCase();
  } catch {
    return githubHttps(url).toLowerCase();
  }
}

function linearId(s: string): string {
  const m = s.match(/\b([A-Z][A-Z0-9]+-\d+)\b/i);
  return m ? m[1].toUpperCase() : s.slice(0, 80);
}

function promptText(opts: {
  parent: string;
  child: string;
  product: string;
  includeIterate: boolean;
  iterate: string;
}): string {
  const skill = opts.includeIterate
    ? "iterate/.cursor/skills/implement-review-sub-issue/SKILL.md (fallback iterate/skills/implement-review-sub-issue/SKILL.md)"
    : ".cursor/skills/implement-review-sub-issue/SKILL.md (fallback skills/implement-review-sub-issue/SKILL.md)";
  const repos = opts.includeIterate
    ? `Product repository: ${opts.product} (primary; implement here)\nIterate repository: ${opts.iterate} (skill source only — do not modify)`
    : `This repository is both the product and iterate: ${opts.product}`;
  return `Read and follow ${skill}.

${repos}

Parent Linear issue: ${opts.parent}
Child Linear issue: ${opts.child}

Implement the child, then spawn a subagent to review it. Follow that skill. Do not edit the parent, create a sibling, expand scope, or open a PR.`;
}

type McpServer = {
  name: string;
  type: string;
  url: string;
  headers: Record<string, string>;
};

function linearMcp(redact: boolean): McpServer | undefined {
  const key = process.env.LINEAR_API_KEY?.trim();
  if (!key) return;
  return {
    name: "linear",
    type: "http",
    url: "https://mcp.linear.app/sse",
    headers: { Authorization: `Bearer ${redact ? "***" : key}` },
  };
}

const { flags } = parseArgs(Bun.argv.slice(2));
const parent = flagString(flags, "parent");
const child = flagString(flags, "child");
const productRepoRaw = flagString(flags, "product-repo");
if (!parent || !child || !productRepoRaw) {
  console.error(USAGE);
  process.exit(1);
}

const productRepo = githubHttps(productRepoRaw);
const productRef = flagString(flags, "product-ref")?.trim();
if (!productRef || productRef.toUpperCase() === "HEAD") {
  console.error(
    "error: --product-ref is required (parent Linear git branch). Do not pass HEAD or omit it.",
  );
  console.error(USAGE);
  process.exit(1);
}
if (
  DEFAULT_REFS.has(productRef.toLowerCase()) &&
  !flags["allow-default-ref"]
) {
  console.error(
    `error: --product-ref ${productRef} is a default branch; pass --allow-default-ref to push onto it.`,
  );
  process.exit(1);
}
const iterateRepo = githubHttps(
  flagString(flags, "iterate-repo") ?? ITERATE_REPO,
);
const iterateRef = flagString(flags, "iterate-ref") ?? ITERATE_REF;
const dryRun = Boolean(flags["dry-run"]);
const includeIterate = repoKey(productRepo) !== repoKey(iterateRepo);

const repos: AgentRepo[] = [
  { url: productRepo, startingRef: productRef },
];
if (includeIterate) {
  repos.push({ url: iterateRepo, startingRef: iterateRef });
}

const mcp = linearMcp(dryRun);
const body: {
  prompt: { text: string };
  name: string;
  repos: AgentRepo[];
  autoCreatePR: false;
  workOnCurrentBranch: true;
  mcpServers?: McpServer[];
} = {
  prompt: {
    text: promptText({
      parent,
      child,
      product: productRepo,
      includeIterate,
      iterate: iterateRepo,
    }),
  },
  name: linearId(child),
  repos,
  autoCreatePR: false,
  workOnCurrentBranch: true,
};
if (mcp) body.mcpServers = [mcp];

if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const { status, text } = await apiPost("/v1/agents", body);
if (status >= 400) {
  console.error(`POST /v1/agents -> ${status}\n${text.slice(0, 800)}`);
  process.exit(1);
}

const created = JSON.parse(text) as CreateAgentResponse;
console.log(
  JSON.stringify({
    agentId: created.agent.id,
    runId: created.run.id,
    url: created.agent.url,
    repos: created.agent.repos ?? repos,
  }),
);
