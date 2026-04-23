import { $ } from 'bun'

await $`rm -rf dist`

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  minify: false,
})
