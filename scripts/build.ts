await Bun.write("dist/four-opencode-deepseek-meter.js", Bun.file("src/four-opencode-deepseek-meter.ts"));
await Bun.write("dist/tui.tsx", Bun.file("src/tui.tsx"));

console.log(`✅ Copied 2 files`);
