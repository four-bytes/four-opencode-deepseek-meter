import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { findDeepSeekKey, parseAuthKey } from "./key-resolver.js";

const dirs: string[] = [];

function tmpDir(): string {
  const d = mkdtempSync(path.join(os.tmpdir(), "dsm-"));
  dirs.push(d);
  return d;
}

afterAll(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
});

function writeAuth(dir: string, key: string | undefined) {
  const auth = key === undefined ? {} : { deepseek: { key } };
  writeFileSync(path.join(dir, "auth.json"), JSON.stringify(auth));
}

function writeSecret(dir: string, key: string) {
  writeFileSync(path.join(dir, "deepseek-key"), key);
}

describe("parseAuthKey", () => {
  test("extracts deepseek key", () => {
    expect(parseAuthKey(JSON.stringify({ deepseek: { key: "sk-x" } }))).toBe("sk-x");
  });

  test("trims surrounding whitespace", () => {
    expect(parseAuthKey(JSON.stringify({ deepseek: { key: "  sk-x  " } }))).toBe("sk-x");
  });

  test("broken JSON → undefined", () => {
    expect(parseAuthKey("{")).toBeUndefined();
  });

  test("missing deepseek → undefined", () => {
    expect(parseAuthKey(JSON.stringify({ anthropic: { key: "sk-y" } }))).toBeUndefined();
  });

  test("whitespace-only key → undefined", () => {
    expect(parseAuthKey(JSON.stringify({ deepseek: { key: "   " } }))).toBeUndefined();
  });

  test("non-string key → undefined", () => {
    expect(parseAuthKey(JSON.stringify({ deepseek: { key: 42 } }))).toBeUndefined();
  });
});

describe("findDeepSeekKey", () => {
  test("auth.json (stateDir) primär", () => {
    const d = tmpDir();
    writeAuth(d, "sk-state");
    expect(findDeepSeekKey({ stateDir: d })).toBe("sk-state");
  });

  test("stateDir gewinnt über alle anderen Quellen", () => {
    const d = tmpDir();
    writeAuth(d, "sk-state");
    expect(
      findDeepSeekKey({ stateDir: d, secretsDir: tmpDir(), env: { DEEPSEEK_API_KEY: "sk-env" } }),
    ).toBe("sk-state");
  });

  test("fallback auf opencodeDir", () => {
    const d = tmpDir();
    writeAuth(d, "sk-open");
    expect(findDeepSeekKey({ opencodeDir: d })).toBe("sk-open");
  });

  test("kaputtes auth.json wird übersprungen", () => {
    const d = tmpDir();
    writeFileSync(path.join(d, "auth.json"), "{not json");
    expect(findDeepSeekKey({ stateDir: d, env: { DEEPSEEK_API_KEY: "sk-env" } })).toBe("sk-env");
  });

  test("fallback auf secrets", () => {
    const d = tmpDir();
    writeSecret(d, "sk-secret");
    expect(findDeepSeekKey({ secretsDir: d })).toBe("sk-secret");
  });

  test("fallback auf env", () => {
    expect(findDeepSeekKey({ env: { DEEPSEEK_API_KEY: "sk-env" } })).toBe("sk-env");
  });

  test("env-whitespace wird übersprungen", () => {
    expect(findDeepSeekKey({ env: { DEEPSEEK_API_KEY: "   " } })).toBeUndefined();
  });

  test("alles leer → undefined", () => {
    expect(findDeepSeekKey({})).toBeUndefined();
  });
});
