import { rmSync } from "node:fs";

// Prune dist before building
rmSync("dist", { recursive: true, force: true });

// 1. TUI build: tsc strips types, preserves JSX → .jsx + .d.ts
//    (also compiles server.ts, but Bun.build overrides it below)
await Bun.$`bunx tsc`;

// 2. Server build: Bun bundler for optimized output
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

// Report outputs
for (const out of server.outputs) {
  console.log(`  ${out.path.padEnd(46)} ${(out.size / 1024).toFixed(2)} KB`);
}
for (const f of ["dist/tui.jsx", "dist/tui.d.ts", "dist/four-opencode-deepseek-meter.d.ts"]) {
  const file = Bun.file(f);
  if (await file.exists()) {
    const size = (await file.arrayBuffer()).byteLength;
    console.log(`  ${f.padEnd(46)} ${(size / 1024).toFixed(2)} KB`);
  }
}
console.log(`\n✅ Built (tsc TUI + Bun server)`);
