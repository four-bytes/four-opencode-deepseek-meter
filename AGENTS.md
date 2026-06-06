# four-opencode-deepseek-meter — AGENTS.md

Pointer to central standards: `~/.personal-config/ai-shared/AGENTS.md` and meta-repo `four-bytes/opencode-plugins` AGENTS.md.

## Convention
- Source file: `src/four-opencode-deepseek-meter.ts` (NOT `src/index.ts`)
- npm name: `@four-bytes/four-opencode-deepseek-meter`
- License: Apache-2.0
- ESM, Bun-targeted, strict TypeScript

## Build Discipline (MANDATORY)
- EVERY code change ends with: version bump in `package.json` + `bun run build && bun run build:tui`
- No merge without current `dist/`
- `dist/` is gitignored, freshly built on `npm publish`

## Standards
`~/.personal-config/ai-shared/AGENTS.md`

## This Plugin
- Plugin name: deepseek-meter
- Description: Shows DeepSeek API balance in the opencode TUI sidebar
- Status: Wave P13

## Workflow
Issues → Branch → PR → Merge (feature workflow)
