import { mkdir, readFile, writeFile } from 'fs/promises'
import { marked } from 'marked'

async function writeMixins(cemData) {
  // Find the mixins.  While CEM does find mixins and annotates them as such
  // in custom-elements.json, it does not include @cssproperty doctags.  The
  // workaround is to document the correspond ???MixinInterface class instead,
  // which is what get extracted and written here.
  const mixins = cemData.modules
      .flatMap(m =>
          m.declarations.filter(
              d => d.kind === 'class' && d.name.endsWith('MixinInterface')))

  // Save the output.
  await mkdir('./docs/_data', { recursive: true })
  await writeFile('./docs/_data/mixins.json', JSON.stringify(mixins, null, 2))
}

async function writeComponents(cemData) {
  // Only include modules that contain actually web components and that are
  // not internal.
  const modules = cemData.modules
      .filter(m => m.kind === 'javascript-module' && m.declarations &&
          !m.path.includes('internal'))

  // Only includes classes that are actully web components.
  const classes = modules
      .flatMap(m =>
          m.declarations.filter(d => d.kind === 'class' && d.customElement))

  // Save the output.
  await mkdir('./docs/_data', { recursive: true })
  await writeFile('./docs/_data/components.json',
      JSON.stringify(classes, null, 2))
}

async function main() {
  const cem = await readFile('./dist/custom-elements.json', 'utf-8')
  const cemData = JSON.parse(cem)

  await writeComponents(cemData)
  await writeMixins(cemData)
}
await main()
