# @four-bytes/four-opencode-deepseek-meter

opencode Plugin: shows DeepSeek API balance in the TUI sidebar.

## Status

Wave P13, Beta.

## Installation

```bash
bun install @four-bytes/four-opencode-deepseek-meter
```

## Configuration

Requires `DEEPSEEK_API_KEY` environment variable.

Load in opencode via directory path (dual server + tui plugin):

```json
{
  "plugin": [
    "/path/to/four-opencode-deepseek-meter"
  ]
}
```

## Usage

Start opencode and you'll see `DEEPSEEK` in the right-hand sidebar showing your current balance. Polls every 60 seconds.

## Build

```bash
bun run build       # server plugin
bun run build:tui   # TUI sidebar component
```

## License

Apache-2.0 — see [LICENSE](../LICENSE)
