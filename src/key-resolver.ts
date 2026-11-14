// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Four Flames GmbH & Co. KG
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export interface DeepSeekKeySources {
  /** opencode data dir containing auth.json — primary location ($XDG_DATA_HOME/opencode) */
  dataDir?: string;
  /** opencode state dir (api.state.path.state) — fallback location for auth.json */
  stateDir?: string;
  /** dir containing the deepseek-key file (e.g. ~/.secrets) */
  secretsDir?: string;
  /** environment variables */
  env?: Record<string, string | undefined>;
}

/** opencode data dir: $XDG_DATA_HOME/opencode, default ~/.local/share/opencode */
export function opencodeDataDir(
  env: Record<string, string | undefined> = process.env,
  home: string = os.homedir(),
): string {
  const xdg = env.XDG_DATA_HOME?.trim();
  return path.join(xdg ? xdg : path.join(home, ".local", "share"), "opencode");
}

function clean(key: unknown): string | undefined {
  if (typeof key !== "string") return undefined;
  const trimmed = key.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Reads a file; a missing file yields undefined. Any other error (permissions,
 * a directory instead of a file, …) is rethrown so it is not reported as "no key".
 */
function readOptional(file: string): string | undefined {
  try {
    return readFileSync(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
}

export function parseAuthKey(json: string): string | undefined {
  try {
    const parsed = JSON.parse(json) as { deepseek?: { key?: unknown } };
    return clean(parsed?.deepseek?.key);
  } catch {
    return undefined;
  }
}

export function readAuthKey(dir: string): string | undefined {
  const content = readOptional(path.join(dir, "auth.json"));
  return content === undefined ? undefined : parseAuthKey(content);
}

export function readSecretsKey(secretsDir: string): string | undefined {
  return clean(readOptional(path.join(secretsDir, "deepseek-key")));
}

/**
 * Lookup order: auth.json in the data dir → auth.json in the state dir →
 * ~/.secrets/deepseek-key → DEEPSEEK_API_KEY. A malformed auth.json is skipped;
 * an unreadable file throws.
 */
export function findDeepSeekKey(sources: DeepSeekKeySources): string | undefined {
  for (const dir of [sources.dataDir, sources.stateDir]) {
    if (!dir) continue;
    const key = readAuthKey(dir);
    if (key) return key;
  }

  if (sources.secretsDir) {
    const key = readSecretsKey(sources.secretsDir);
    if (key) return key;
  }

  return clean(sources.env?.DEEPSEEK_API_KEY);
}
