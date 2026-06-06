# @four-bytes/four-opencode-deepseek-meter

opencode Plugin: shows DeepSeek API balance in the TUI sidebar.

## Installation

```bash
bun install @four-bytes/four-opencode-deepseek-meter
```

## Configuration

Reads the DeepSeek API key from the opencode provider configuration — no `DEEPSEEK_API_KEY` env var needed.

Load in opencode via directory path (dual server + tui plugin):

```json
{
  "plugin": [
    "/path/to/four-opencode-deepseek-meter"
  ]
}
```

## Usage

Start opencode with a DeepSeek provider configured. You'll see `DEEPSEEK` in the right-hand sidebar showing your current balance. Polls every 60 seconds.

## Build

```bash
bun run build
```

## License

Apache-2.0
