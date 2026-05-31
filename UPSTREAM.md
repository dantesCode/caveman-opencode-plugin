# Upstream Parity

**Upstream repo:** [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)
**Type:** OpenCode plugin — hooks-based, not CLI installer

## Mirrored Methodology

| Skill | Source |
|-------|--------|
| Core caveman behavioral rules | `skills/caveman/SKILL.md` |
| Commit message formatting | `skills/caveman-commit/SKILL.md` |
| Review comment format/severity | `skills/caveman-review/SKILL.md` |

The prompt strings in `src/skills/*.ts` carry upstream's behavioral rules, intensity levels, examples, auto-clarity exceptions, and boundaries.

## Intentional Differences

| Area | This Plugin | Upstream |
|------|-------------|----------|
| **Install** | OpenCode plugin via `opencode.json` + `caveman.json` config | CLI installer, flag files, multi-platform hooks |
| **caveman-stats** | Not included — OpenCode handles token counts natively | Included |
| **caveman-compress** | Not included — pair with [opencode-dcp](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning) | Included |
| **caveman-help** | Not included — OpenCode has `/help` built-in | Included |
| **caveman-shrink / cavecrew** | Not included — MCP middleware, OpenCode not affected | Included |
| **Auto-activation** | Via hook `experimental.chat.system.transform` with session state | Via flag file, env vars, `CAVEMAN_DEFAULT_MODE` |
| **Mode persistence** | Per-session in-memory (via `state.ts`) | File-based flag files |
| **Multi-agent support** | No — OpenCode single-agent | 30+ agents |
| **Config** | `caveman.json` (project or global) | `~/.config/caveman/config.json` + env vars |

## Update Process

To refresh prompts against upstream:

1. Fetch upstream SKILL.md files (URLs above)
2. Compare rules, examples, auto-clarity, boundaries in `src/skills/*.ts`
3. Update TypeScript prompt strings to reflect upstream changes
4. Only adopt behavioral rules — skip installer, stats, compress, help features
5. Run `bun test` to verify
