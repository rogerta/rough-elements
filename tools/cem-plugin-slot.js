import { Parser } from "htmlparser2"

export default function myPlugin() {
  return {
    name: 'wc-slot',

    analyzePhase({ts, node, moduleDoc, context}) {
      const filename = node.getSourceFile()?.fileName

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          // console.log(`rogerta ${filename}: ${node.name?.getText()}`)
          break
        case ts.SyntaxKind.TaggedTemplateExpression:
          let comments = []
          let slots = []

          if (node.tag?.getText() === 'html') {
            const template =
                node.template?.getText().slice(1, -1)
                    .replaceAll('\n', ' ') ?? '<no-template>'
            //console.log(`rogerta ${filename}: template==>${template.replaceAll('\n', ' ')}<==`)

            const parser = new Parser({
              onopentag(tagName, attributes) {
                if (tagName === 'slot') {
                  const name = attributes.name ?? '[default]'
                  slots.push({name, comments})
                }

                // Always clear the comments.  We are only looking for
                // comments that come right before the <slot>.
                comments = []
              },
              oncomment(text) {
                comments.push(text)
              }
            })
            parser.write(template)
            parser.end()

            if (slots.length > 0) {
              slots.forEach(value => {
                console.log(`rogerta ${filename}: Found slot named ${value.name}:`)
                value.comments?.forEach( c => console.log(`rogerta ${filename}:     ${c}`))
              })
            }
          }
          break
      }
    },

    initialize({ts, customElementsManifest, context}) {},
    collectPhase({ts, node, context}){},
    moduleLinkPhase({moduleDoc, context}){},
    packageLinkPhase({customElementsManifest, context}){},
  }
}
