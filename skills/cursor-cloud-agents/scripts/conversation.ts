#!/usr/bin/env bun

import {
  apiJson,
  clip,
  parseArgs,
  type Conversation,
} from "./client.ts";

const { positional, flags } = parseArgs(Bun.argv.slice(2));
const agentId = positional[0];
if (!agentId) {
  console.error("usage: bun conversation.ts <bc-id> [--full]");
  process.exit(1);
}
const full = Boolean(flags.full);

const conv = await apiJson<Conversation>(
  `/v0/agents/${agentId}/conversation`,
);
const messages = conv.messages ?? [];

console.log(`agent ${conv.id} messages=${messages.length} fields=id,type,text`);
console.log("(no per-message timestamps; use stream-summary.ts for clocks)");

for (const [i, m] of messages.entries()) {
  const id = m.id ?? "";
  const step = id.match(/^turn-(\d+):step:(\d+):(.*)$/);
  let label: string;
  if (step) {
    label = `turn ${step[1]} step ${step[2].padStart(3)} ${step[3]}`;
  } else if (m.type === "user_message") {
    label = "USER";
  } else {
    label = m.type ?? "?";
  }
  const text = full ? (m.text ?? "").replace(/\n/g, " ") : clip(m.text, 220);
  console.log(`[${String(i + 1).padStart(2, "0")}] ${label.padEnd(28)} ${text}`);
}
