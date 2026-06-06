import { describe, expect, test } from "bun:test";
import plugin from "./four-opencode-deepseek-meter.js";

describe("four-opencode-deepseek-meter", () => {
  test("exports id", () => {
    expect(plugin.id).toBe("four-opencode-deepseek-meter");
  });

  test("exports server function", () => {
    expect(typeof plugin.server).toBe("function");
  });

  test("server returns expected shape", async () => {
    const result = await (plugin.server as () => Promise<unknown>)();
    expect(result).toBeDefined();
  });
});
