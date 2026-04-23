# caveman-opencode-plugin

Caveman communication mode plugin for [opencode](https://opencode.ai). Adapts [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) into hook-based plugin.

## Installation

```bash
# Global install
opencode plugin caveman-opencode-plugin@latest --global

# Or local install
opencode plugin caveman-opencode-plugin@latest
```

**NPM:** https://www.npmjs.com/package/caveman-opencode-plugin

Add to `opencode.json`:

```json
{
  "plugin": ["caveman-opencode-plugin"]
}
```

## Setup

Run the interactive setup script:

```bash
# Download and run
curl -fsSL https://raw.githubusercontent.com/dantesCode/caveman-opencode-plugin/main/setup.sh | bash

# Or clone and run locally
curl -O https://raw.githubusercontent.com/dantesCode/caveman-opencode-plugin/main/setup.sh
bash setup.sh
```

Or create `caveman.json` manually:

```bash
# Project-level config (recommended)
echo '{"enabled":true,"defaultMode":"full","features":{"caveman":true,"commit":true,"review":true}}' > caveman.json

# Or global config in ~/.config/opencode/
mkdir -p ~/.config/opencode
echo '{"enabled":true,"defaultMode":"full","features":{"caveman":true,"commit":true,"review":true}}' > ~/.config/opencode/caveman.json
```

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
- `features` — toggle individual features:
  - `caveman` — enable caveman communication mode
  - `commit` — enable `/caveman-commit` command
  - `review` — enable `/caveman-review` command

### Config file locations

Plugin looks for `caveman.json` in this order:

1. `./caveman.json` (project root)
2. `~/.config/opencode/caveman.json` (global)

Project config takes precedence over global.

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
