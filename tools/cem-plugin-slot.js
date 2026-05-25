import { Parser } from "htmlparser2"

export default function myPlugin() {
  return {
    name: 'wc-slot',

    analyzePhase({ts, node, moduleDoc, context}) {
      // if(context.dev) {
      // }

      const filename = node.getSourceFile()?.fileName

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          // console.log(`rogerta ${filename}: ${node.name?.getText()}`)
          break
        case ts.SyntaxKind.TaggedTemplateExpression:
          if (node.tag?.getText() === 'html') {
            const template = node.template?.getText().slice(1, -1).replaceAll('\n', ' ') ?? '<no-template>'
            //console.log(`rogerta ${filename}: template==>${template.replaceAll('\n', ' ')}<==`)
            const parser = new Parser({
              onopentag(name, attributes) {
                // console.log(`rogerta ${filename}: opentag name=${name}`)
                if (name !== 'slot') {
                  return
                }

                console.log(`rogerta ${filename}: found slot name=${attributes.name}`)
              },
              oncomment(text) {
                // console.log(`rogerta ${filename}: oncomment=${text}`)
              }
            })
            parser.write(template)
            parser.end()
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
