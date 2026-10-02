/**
 * Caveman plugin entrypoint for the OpenCode v2 plugin API.
 *
 * OpenCode v2 expects a default export with an `id` and `setup(ctx)`. The
 * default (v1) entrypoint in `index.ts` is unchanged, so both APIs are served
 * from one package:
 *
 *   v1: caveman-opencode-plugin
 *   v2: caveman-opencode-plugin/v2
 */
export { cavemanV2Plugin as default } from './v2'
