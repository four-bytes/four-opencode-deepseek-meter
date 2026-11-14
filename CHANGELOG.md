# Changelog

## 0.1.1 — 2026-11-14
- fix: read auth.json from the opencode data dir (`$XDG_DATA_HOME/opencode`, default `~/.local/share/opencode`) first; state dir is the fallback
- fix: unreadable key files show `KEY ERROR <code>` instead of `NO KEY`
- test: precedence covered with competing keys in every source
- docs: README describes the key lookup and status messages

## 0.1.0 — 2026-06-11
- Initial release: DeepSeek API balance meter in TUI sidebar
