# four-opencode-deepseek-meter — AGENTS.md

Pointer to central standards: `~/ai-shared-rules/AGENTS.md` and meta-repo `four-bytes/opencode-plugins` AGENTS.md.

## Convention
- Source file: `src/four-opencode-deepseek-meter.ts` (NOT `src/index.ts`)
- npm name: `@four-bytes/four-opencode-deepseek-meter`
- License: Apache-2.0
- ESM, Bun-targeted, strict TypeScript

## Build Discipline (MANDATORY)
- ONE build step: `bun run build` produces both `dist/four-opencode-deepseek-meter.js` (server) + `dist/four-opencode-deepseek-meter-tui.jsx` (TUI)
- Build script: `scripts/build.ts` uses `Bun.build()` with both entrypoints
- No merge without current `dist/`
- `dist/` is gitignored, freshly built on `npm publish`

## Standards
`~/ai-shared-rules/AGENTS.md`

## This Plugin
- Plugin name: deepseek-meter
- Description: Shows DeepSeek API balance in the opencode TUI sidebar
- Status: Wave P13

## Workflow
Issues → Branch → PR → Merge (feature workflow)

- **Console logging:** Plugins MUST use `_client?.app?.log()` for all logging in plugin mode — `console.log` / `console.warn` / `console.error` is ONLY permitted for the initial startup `"init"` message. Console output in plugin mode breaks the terminal UI.
