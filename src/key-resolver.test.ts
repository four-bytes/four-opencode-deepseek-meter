// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Four Flames GmbH & Co. KG
import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { findDeepSeekKey, opencodeDataDir, parseAuthKey } from "./key-resolver.js";

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
  /** Every source holds a different key, so each precedence step is observable. */
  function allSources() {
    const dataDir = tmpDir();
    const stateDir = tmpDir();
    const secretsDir = tmpDir();
    writeAuth(dataDir, "sk-data");
    writeAuth(stateDir, "sk-state");
    writeSecret(secretsDir, "sk-secret");
    return { dataDir, stateDir, secretsDir, env: { DEEPSEEK_API_KEY: "sk-env" } };
  }

  test("dataDir gewinnt über alle anderen Quellen", () => {
    expect(findDeepSeekKey(allSources())).toBe("sk-data");
  });

  test("stateDir vor secrets und env", () => {
    const s = allSources();
    expect(findDeepSeekKey({ ...s, dataDir: undefined })).toBe("sk-state");
  });

  test("secrets vor env", () => {
    const s = allSources();
    expect(findDeepSeekKey({ ...s, dataDir: undefined, stateDir: undefined })).toBe("sk-secret");
  });

  test("auth.json ohne deepseek-Key fällt auf die nächste Quelle zurück", () => {
    const s = allSources();
    writeAuth(s.dataDir, undefined);
    expect(findDeepSeekKey(s)).toBe("sk-state");
  });

  test("kaputtes auth.json wird übersprungen", () => {
    const d = tmpDir();
    writeFileSync(path.join(d, "auth.json"), "{not json");
    expect(findDeepSeekKey({ dataDir: d, env: { DEEPSEEK_API_KEY: "sk-env" } })).toBe("sk-env");
  });

  test("nicht lesbares auth.json wirft statt 'kein Key'", () => {
    const d = tmpDir();
    mkdirSync(path.join(d, "auth.json"));
    expect(() => findDeepSeekKey({ dataDir: d, env: { DEEPSEEK_API_KEY: "sk-env" } })).toThrow();
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

describe("opencodeDataDir", () => {
  test("nutzt XDG_DATA_HOME", () => {
    expect(opencodeDataDir({ XDG_DATA_HOME: "/xdg/data" }, "/home/u")).toBe(path.join("/xdg/data", "opencode"));
  });

  test("Default ~/.local/share/opencode", () => {
    expect(opencodeDataDir({}, "/home/u")).toBe(path.join("/home/u", ".local", "share", "opencode"));
  });

  test("leeres XDG_DATA_HOME → Default", () => {
    expect(opencodeDataDir({ XDG_DATA_HOME: "  " }, "/home/u")).toBe(path.join("/home/u", ".local", "share", "opencode"));
  });
});
