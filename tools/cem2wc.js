import { mkdir, readFile, writeFile } from 'fs/promises'

async function main() {
  const cem = await readFile('./custom-elements.json', 'utf-8')
  const cemData = JSON.parse(cem)
  const modules = cemData.modules
      .filter(m => m.kind === 'javascript-module' && m.declarations)
  const classes = modules
      .flatMap(m =>
          m.declarations.filter(d => d.kind === 'class' && d.customElement))

  await mkdir('./docs/_data', { recursive: true })
  await writeFile('./docs/_data/web-components.json', JSON.stringify(classes, null, 2))
}

await main()
