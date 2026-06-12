# @four-bytes/four-opencode-deepseek-meter

> DeepSeek API balance meter in opencode TUI sidebar — real-time usage with color-coded warnings.

[![npm](https://img.shields.io/npm/v/@four-bytes/four-opencode-deepseek-meter)](https://www.npmjs.com/package/@four-bytes/four-opencode-deepseek-meter)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![bun](https://img.shields.io/badge/runtime-bun-orange)](https://bun.sh)

## Why?

DeepSeek API has usage-based billing. This TUI sidebar shows your balance in real-time so you never hit zero unexpectedly. Auto-detects DeepSeek provider from opencode config. Color-coded warnings when balance drops below thresholds.

## Quickstart

```bash
opencode plugin @four-bytes/four-opencode-deepseek-meter -g
```

Or manually:

```json
// ~/.config/opencode/tui.json
{ "plugin": ["/home/user/four-opencode-deepseek-meter"] }
```

Restart opencode.

## TUI Sidebar

```
┌─ DEEPSEEK ──────────┐
│ USD 12.45            │  ← green (>$3)
│                      │  ← yellow (<$3)
│                      │  ← red (error)
└──────────────────────┘
```

Auto-refreshes after each assistant message (min 10s interval). Shows "no key" if DeepSeek provider not configured.

## Configuration

No config file needed — reads API key from opencode provider config. Ensure DeepSeek is configured in opencode's model providers.

## Contributing

PRs welcome!

```bash
bun install
bun run build
bun test
```

## License

Apache-2.0 — see [LICENSE](LICENSE)

---

> If this plugin helps you track costs, consider leaving a ⭐ on [GitHub](https://github.com/four-bytes/four-opencode-deepseek-meter).
