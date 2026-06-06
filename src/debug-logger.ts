import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface DebugEvent {
  ts: number;
  type: string;
  [key: string]: unknown;
}

const CACHE_DIR = join(homedir(), ".cache", "opencode", "four-opencode-deepseek-meter");

let dirReady = false;
function ensureDir(): boolean {
  if (dirReady) return true;
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    dirReady = true;
    return true;
  } catch (err) {
    console.error("[deepseek-meter] cannot create log dir:", CACHE_DIR, err);
    return false;
  }
}

function getLogPath(): string {
  const date = new Date().toISOString().split("T")[0];
  return join(CACHE_DIR, `debug-${date}.jsonl`);
}

/**
 * Writes a JSON debug event to a daily JSONL file.
 * Always active (tiny output). Errors surface to stderr.
 */
export function logDebugEvent(
  type: string,
  payload: Record<string, unknown>,
): void {
  if (!ensureDir()) return;

  try {
    const event: DebugEvent = { ts: Date.now(), type, ...payload };
    const line = JSON.stringify(event) + "\n";
    appendFileSync(getLogPath(), line, "utf-8");
  } catch (err) {
    console.error("[deepseek-meter] log write failed:", err);
  }
}
