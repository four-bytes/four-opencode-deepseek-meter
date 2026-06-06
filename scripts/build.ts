const server = await Bun.build({
  entrypoints: ["src/four-opencode-deepseek-meter.ts"],
  outdir: "dist",
  target: "bun",
  external: ["@opencode-ai/*"],
  minify: process.env.NODE_ENV === "production",
});

const tui = await Bun.build({
  entrypoints: ["src/tui.tsx"],
  outdir: "dist",
  target: "bun",
  naming: "four-opencode-deepseek-meter-tui.jsx",
  external: ["@opencode-ai/*", "@opentui/*", "solid-js"],
  minify: process.env.NODE_ENV === "production",
});

if (!server.success || !tui.success) {
  for (const log of [...server.logs, ...tui.logs]) console.error(log);
  process.exit(1);
}

for (const out of [...server.outputs, ...tui.outputs]) {
  console.log(`  ${out.path.padEnd(46)} ${(out.size / 1024).toFixed(2)} KB`);
}
console.log(`\n✅ Built 2 files`);
