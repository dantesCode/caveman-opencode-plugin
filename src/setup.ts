import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import * as readline from 'readline'

const configPath = join(cwd(), 'caveman.json')

if (existsSync(configPath)) {
  console.log('caveman.json already exists. Edit it manually to change features.')
  process.exit(0)
}

const features = {
  caveman: true,
  commit: true,
  review: true,
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const ask = (q: string): Promise<string> => new Promise(resolve => rl.question(q, resolve))

async function run() {
  console.log('🦴 Caveman Plugin Setup')
  console.log('Select features to enable (yes/no):\n')

  features.caveman = (await ask('Enable caveman communication mode? (yes): ')).toLowerCase() !== 'no'
  features.commit = (await ask('Enable /caveman-commit command? (yes): ')).toLowerCase() !== 'no'
  features.review = (await ask('Enable /caveman-review command? (yes): ')).toLowerCase() !== 'no'

  const defaultMode = features.caveman
    ? (await ask('Default mode (full/lite/ultra/wenyan-lite/wenyan-full/wenyan-ultra) [full]: ')) || 'full'
    : 'off'

  const config = {
    enabled: true,
    defaultMode,
    features,
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`\n✅ Created ${configPath}`)
  rl.close()
}

run()
