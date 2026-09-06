import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseline = "a".repeat(40);
const newerTip = "b".repeat(40);

function watch(options: {
  reviewOnly?: boolean;
  since?: string;
  tip?: string;
  ancestor?: boolean;
  disconnects?: number;
}) {
  const dir = mkdtempSync(join(tmpdir(), "watch-landed-test-"));
  try {
    const preload = join(dir, "mock.ts");
    writeFileSync(preload, `
      let attempts = 0;
      Bun.spawn = (args) => ({
        stdout: new Blob([${JSON.stringify(options.tip ?? baseline)} + "\\n"]).stream(),
        stderr: new Blob([""]).stream(),
        exited: Promise.resolve(args[1] === "merge-base" && ${options.ancestor === false} ? 1 : 0),
      });
      globalThis.fetch = async () => {
        if (++attempts <= ${options.disconnects ?? 0}) throw new TypeError("connection reset");
        return new Response(JSON.stringify({status: "FINISHED"}));
      };
    `);
    const result = Bun.spawnSync([
      process.execPath, "--preload", preload,
      join(import.meta.dir, "watch-landed.ts"), "bc-test", "run-test",
      "--ref", "feature/test", "--child", "SIG-2", "--poll-interval", "1",
      "--since", options.since ?? baseline,
      ...(options.reviewOnly ? ["--review-only"] : []),
    ], {
      env: { ...process.env, CURSOR_API_KEY: "test", GROK_HOME: dir },
    });
    return {
      code: result.exitCode,
      output: result.stdout.toString(),
      stderr: result.stderr.toString(),
      log: options.since === "invalid" ? "" : readFileSync(
        join(dir, "long-running-background-tasks/cursor-cloud-session_run-test_landed.log"), "utf8",
      ),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("implementation still requires new commits", () => {
  expect(watch({}).output).toContain("FAILED:");
  expect(watch({ tip: newerTip }).output).toContain("DONE:");
});

test("review can finish without edits when its implementation remains on remote", () => {
  const result = watch({ reviewOnly: true });
  expect(result.code).toBe(0);
  expect(result.output).toStartWith("DONE:");
  expect(watch({ reviewOnly: true, tip: newerTip }).output).toStartWith("DONE:");
});

test("review rejects a rewritten branch that lost the implementation", () => {
  expect(watch({ reviewOnly: true, tip: newerTip, ancestor: false }).output).toStartWith("FAILED:");
});

test("review requires an explicit valid baseline", () => {
  expect(watch({ reviewOnly: true, since: "invalid" }).output).toContain("requires --since");
});

test("temporary transport failures recover", () => {
  const result = watch({ tip: newerTip, disconnects: 2 });
  expect(result.code).toBe(0);
  expect(result.output).toStartWith("DONE:");
  expect(result.log).toContain("run_transport_error attempts=2");
});

test("persistent transport failures emit FAILED instead of throwing", () => {
  const result = watch({ tip: newerTip, disconnects: 10 });
  expect(result.code).toBe(1);
  expect(result.output).toStartWith("FAILED:");
  expect(result.output).toContain("after 5 attempts");
  expect(result.stderr).toBe("");
});
