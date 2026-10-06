/**
 * npm run optimize — compresse les GLB de public/models/ (sources : *.src.glb ou *.glb).
 * Pipeline gltf-transform : dedup → instance → prune → weld → textures WebP ≤ 2048 → Meshopt.
 * Les noms de nœuds (ids de parts.json) sont conservés. Échoue si un modèle dépasse 8 Mo.
 *
 * Usage : npm run optimize [-- fichier.glb ...]
 */
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, instance, meshopt, prune, textureCompress, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'public/models'
const LIMIT = 8 * 1024 * 1024
const args = process.argv.slice(2)
const inputs = args.length
  ? args
  : fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => f.endsWith('.src.glb') || (f.endsWith('.glb') && !fs.existsSync(path.join(DIR, f.replace('.glb', '.src.glb'))))).map((f) => path.join(DIR, f))
    : []

if (!inputs.length) {
  console.log(`Aucun GLB dans ${DIR}/ — lancez d'abord \`npm run export:glb\` ou déposez un modèle.`)
  process.exit(0)
}

await MeshoptDecoder.ready
await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
})

let failed = false
for (const input of inputs) {
  const out = input.replace(/\.src\.glb$/, '.glb')
  const before = fs.statSync(input).size
  const doc = await io.read(input)
  await doc.transform(
    dedup(),
    instance({ min: 3 }),
    prune({ keepLeaves: false, keepAttributes: false }),
    weld(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], quality: 85 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  )
  await io.write(out, doc)
  const after = fs.statSync(out).size
  const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' Mo'
  const ok = after <= LIMIT
  if (!ok) failed = true
  console.log(`${ok ? '✓' : '✗'} ${path.basename(input)} ${mb(before)} → ${path.basename(out)} ${mb(after)}${ok ? '' : ' (> 8 Mo !)'}`)
}
process.exit(failed ? 1 : 0)
