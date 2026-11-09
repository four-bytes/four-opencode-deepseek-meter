import { readFileSync } from "node:fs";
import path from "node:path";

export interface DeepSeekKeySources {
  /** opencode state dir (api.state.path.state) — primary auth.json location */
  stateDir?: string;
  /** fallback dir containing auth.json (e.g. ~/.local/share/opencode) */
  opencodeDir?: string;
  /** dir containing the deepseek-key file (e.g. ~/.secrets) */
  secretsDir?: string;
  /** environment variables */
  env?: Record<string, string | undefined>;
}

function clean(key: unknown): string | undefined {
  if (typeof key !== "string") return undefined;
  const trimmed = key.trim();
  return trimmed ? trimmed : undefined;
}

export function parseAuthKey(json: string): string | undefined {
  try {
    const parsed = JSON.parse(json) as { deepseek?: { key?: unknown } };
    return clean(parsed?.deepseek?.key);
  } catch {
    return undefined;
  }
}

export function readAuthKey(stateDir: string): string | undefined {
  try {
    return parseAuthKey(readFileSync(path.join(stateDir, "auth.json"), "utf8"));
  } catch {
    return undefined;
  }
}

export function readSecretsKey(secretsDir: string): string | undefined {
  try {
    return clean(readFileSync(path.join(secretsDir, "deepseek-key"), "utf8"));
  } catch {
    return undefined;
  }
}

export function findDeepSeekKey(sources: DeepSeekKeySources): string | undefined {
  // 1. opencode auth.json (primär, konfigurationsfrei)
  if (sources.stateDir) {
    const key = readAuthKey(sources.stateDir);
    if (key) return key;
  }
  if (sources.opencodeDir) {
    const key = readAuthKey(sources.opencodeDir);
    if (key) return key;
  }

  // 2. ~/.secrets/deepseek-key
  if (sources.secretsDir) {
    const key = readSecretsKey(sources.secretsDir);
    if (key) return key;
  }

  // 3. Env DEEPSEEK_API_KEY
  const envKey = clean(sources.env?.DEEPSEEK_API_KEY);
  if (envKey) return envKey;

  return undefined;
}
