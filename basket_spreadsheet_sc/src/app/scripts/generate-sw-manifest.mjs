import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const DIST_DIR = 'build' // tu distDir
const STATIC_DIR = join(DIST_DIR, 'static')

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk(STATIC_DIR)
  .filter((f) => !f.endsWith('.map'))
  .map((f) => '/_next/static/' + relative(STATIC_DIR, f).split(sep).join('/'))

mkdirSync('public', { recursive: true })
writeFileSync('public/sw-assets.json', JSON.stringify(files))
console.log(`[sw] ${files.length} archivos listados en public/sw-assets.json`)