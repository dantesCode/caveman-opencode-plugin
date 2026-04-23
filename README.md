# caveman-opencode-plugin

Caveman communication mode plugin for [opencode](https://opencode.ai). Adapts [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) into hook-based plugin.

## Installation

```bash
npm install caveman-opencode-plugin
```

Add to `opencode.json`:

```json
{
  "plugins": ["caveman-opencode-plugin"]
}
```

## Setup

Run interactive setup:

```bash
bun run setup
```

Or create `caveman.json` manually.

## Configuration

`caveman.json` example:

```json
{
  "enabled": true,
  "defaultMode": "full",
  "features": {
    "caveman": true,
    "commit": true,
    "review": true
  }
}
```

- `enabled` — master switch
- `defaultMode` — mode on session start (`lite`, `full`, `ultra`, `wenyan-lite`, `wenyan-full`, `wenyan-ultra`, `off`)
- `features` — toggle individual features

## Commands

| Command | Description |
|---------|-------------|
| `/caveman <mode>` | Switch caveman mode |
| `/caveman-commit <diff>` | Generate conventional commit message |
| `/caveman-review <code>` | One-line code review |

## Modes

| Mode | Description |
|------|-------------|
| `lite` | Light compression, keep some filler |
| `full` | Full caveman rules (default) |
| `ultra` | Maximum brevity |
| `wenyan-lite` | Lite in classical Chinese style |
| `wenyan-full` | Full classical Chinese style |
| `wenyan-ultra` | Ultra classical Chinese style |
| `off` / `normal` | Disable caveman |

## Companion Plugin

For context compression, pair with [@tarquinen/opencode-dcp](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning).

## License

MIT
