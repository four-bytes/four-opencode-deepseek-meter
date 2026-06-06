const server = await Bun.build({
  entrypoints: ["src/four-opencode-deepseek-meter.ts"],
  outdir: "dist",
  target: "bun",
  external: ["@opencode-ai/*"],
  minify: process.env.NODE_ENV === "production",
});

if (!server.success) {
  for (const log of server.logs) console.error(log);
  process.exit(1);
}

// TUI: raw copy — opencode loads TSX with @opentui/solid pragma at runtime
await Bun.write("dist/four-opencode-deepseek-meter-tui.jsx", Bun.file("src/tui.tsx"));

for (const out of server.outputs) {
  console.log(`  ${out.path.padEnd(46)} ${(out.size / 1024).toFixed(2)} KB`);
}
console.log(`  ${"dist/four-opencode-deepseek-meter-tui.jsx".padEnd(46)} ${(Bun.file("dist/four-opencode-deepseek-meter-tui.jsx").size / 1024).toFixed(2)} KB`);
console.log(`\n✅ Built 2 files`);
