# Contributing to four-opencode-deepseek-meter

## Workflow

Every change follows: **Issue → Branch → Commit → PR → Review → Merge → Cleanup**

1. **Create an issue** — describe the bug, feature, or refactor
2. **Branch** — `feat/<issue>-short-desc` | `fix/<issue>-short-desc` | `refactor/<issue>-short-desc`
3. **Implement** — follow conventions in GUIDELINES.md
4. **Commit** — conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
5. **PR** — fill template, reference issue with `Closes #N`
6. **Review** — architect reviews, CI passes
7. **Merge** — squash merge, delete branch
8. **Cleanup** — `git checkout main && git pull --ff-only && git branch -D <branch>`

## Conventions

### Code
- **Source file:** `src/four-opencode-deepseek-meter.ts` (not `src/index.ts`)
- **npm name:** `@four-bytes/four-opencode-deepseek-meter`
- **Language:** TypeScript, strict mode, ESM
- **Target:** Bun
- **Format:** Prettier (single quotes, 100 width, 2 tab, semicolons)

### Commits
```
feat: short description #42
fix: short description #42
docs: short description #50
```

Always reference the issue number.

### Build
```bash
bun run build    # Bun.build to dist/
bun run test     # bun test
bun run typecheck # tsc --noEmit
```

Every code change must end with a successful build. Dist is gitignored.

## Architecture

Plugin shows DeepSeek API balance in the opencode TUI sidebar:
- **Server** — fetches balance from DeepSeek API, exposes via plugin API
- **TUI** — SolidJS sidebar component rendering balance widget

See `ROADMAP.md` for the evolution plan.

## License

By contributing, you agree that your contributions will be licensed under Apache-2.0.
