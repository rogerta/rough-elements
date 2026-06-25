import { mkdir, readFile, writeFile } from 'fs/promises'
import { marked } from 'marked'

async function main() {
  const cem = await readFile('./dist/custom-elements.json', 'utf-8')
  const cemData = JSON.parse(cem)

  // Only include modules that contain actual web components and that are
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
  await writeFile('./docs/_data/components.json', JSON.stringify(classes, null, 2))
}

await main()
