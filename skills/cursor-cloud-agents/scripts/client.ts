#!/usr/bin/env bun

export const API_BASE = "https://api.cursor.com";

export function apiKey(): string {
  const key = process.env.CURSOR_API_KEY?.trim();
  if (!key) {
    console.error(
      "Missing CURSOR_API_KEY (often set but not exported). Run: export CURSOR_API_KEY\nMint: https://cursor.com/dashboard/api",
    );
    process.exit(1);
  }
  return key;
}

export function authHeaders(accept = "application/json"): HeadersInit {
  return {
    Authorization: `Basic ${btoa(`${apiKey()}:`)}`,
    Accept: accept,
  };
}

export type ApiResponse = {
  status: number;
  headers: Headers;
  text: string;
};

export async function apiGet(
  path: string,
  accept = "application/json",
): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(accept),
  });
  return {
    status: res.status,
    headers: res.headers,
    text: await res.text(),
  };
}

export async function apiJson<T>(path: string): Promise<T> {
  const { status, text } = await apiGet(path);
  if (status >= 400) {
    console.error(`GET ${path} -> ${status}\n${text.slice(0, 800)}`);
    process.exit(1);
  }
  return JSON.parse(text) as T;
}

export async function apiPost(
  path: string,
  body: unknown,
): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return {
    status: res.status,
    headers: res.headers,
    text: await res.text(),
  };
}

export type SseEvent = { id?: string; event?: string; data: string };

export function parseSse(text: string): SseEvent[] {
  const events: SseEvent[] = [];
  let cur: SseEvent = { data: "" };
  const dataLines: string[] = [];
  const flush = () => {
    if (cur.id || cur.event || dataLines.length) {
      events.push({ ...cur, data: dataLines.join("\n") });
    }
    cur = { data: "" };
    dataLines.length = 0;
  };
  for (const line of text.split(/\r?\n/)) {
    if (line === "") {
      flush();
      continue;
    }
    if (line.startsWith(":")) continue;
    if (line.startsWith("id:")) cur.id = line.slice(3).trim();
    else if (line.startsWith("event:")) cur.event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  flush();
  return events;
}

export async function openSse(
  path: string,
  lastEventId?: string,
): Promise<{
  status: number;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  text: string;
}> {
  const headers: Record<string, string> = {
    ...(authHeaders("text/event-stream") as Record<string, string>),
  };
  if (lastEventId) headers["Last-Event-ID"] = lastEventId;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    return {
      status: res.status,
      headers: res.headers,
      body: null,
      text: await res.text(),
    };
  }
  return {
    status: res.status,
    headers: res.headers,
    body: res.body,
    text: "",
  };
}

export async function* readSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    for (;;) {
      const m = buf.match(/\r?\n\r?\n/);
      if (!m || m.index === undefined) break;
      const block = buf.slice(0, m.index);
      buf = buf.slice(m.index + m[0].length);
      for (const ev of parseSse(block)) yield ev;
    }
  }
  buf += decoder.decode();
  if (buf.trim()) {
    for (const ev of parseSse(buf)) yield ev;
  }
}

export type Me = {
  apiKeyName?: string;
  userEmail?: string;
  userId?: number;
};

export type AgentRepo = {
  url: string;
  startingRef?: string;
};

export type Agent = {
  id: string;
  name: string;
  status: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  latestRunId?: string;
  repos?: AgentRepo[];
  env?: { type?: string; name?: string };
};

export type AgentListItem = {
  id: string;
  name: string;
  status: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  latestRunId?: string;
  env?: { type?: string; name?: string };
};

export type AgentList = {
  items: AgentListItem[];
  nextCursor?: string;
};

export type RunGit = {
  branches?: Array<{ repoUrl?: string; branch?: string; prUrl?: string }>;
};

export type Run = {
  id: string;
  agentId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  durationMs?: number;
  result?: string;
  git?: RunGit;
};

export type RunList = { items: Run[]; nextCursor?: string };

export type CreateAgentResponse = {
  agent: Agent;
  run: Run;
};

export type ConversationMessage = {
  id: string;
  type: string;
  text: string;
};

export type Conversation = {
  id: string;
  messages: ConversationMessage[];
};

export function clip(s: string | undefined, n: number): string {
  const t = (s ?? "").replace(/\n/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

export function fmtDur(ms: number | undefined): string {
  if (typeof ms !== "number") return "?";
  if (ms < 60_000) return `${(ms / 1000).toFixed(0)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

export function parseArgs(argv: string[]): {
  positional: string[];
  flags: Record<string, string | boolean>;
} {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") {
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}
