import { Parser } from "htmlparser2"

export default function myPlugin() {
  return {
    name: 'wc-csspart',

    analyzePhase({ts, node, moduleDoc, context}) {
      const filename = node.getSourceFile()?.fileName

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          // A class declaration is expectde happen before an html
          // template string.
          const key = `${filename}:${node.name?.getText()}:parts`
          context.lastClassPartsKey = key
          break
        case ts.SyntaxKind.TaggedTemplateExpression:
          if (!context.lastClassPartsKey) {
            console.log(`${filename}: have html'' but no class?`)
            break
          }

          // If this is not an html template string, just ignore.
          if (node.tag?.getText() !== 'html') {
            break
          }

          // All the parts declared in the component accumulate here while
          // parsing.  Once the parsing is complete, the slots are transferred
          // to the context.
          let parts = []
          let comments = []

          const template = node.template?.getText().slice(1, -1)
                  .replaceAll('\n', ' ')
          if (!template) {
            break
          }
          const parser = new Parser({
            onopentag(tagName, attributes) {
              if (attributes.part) {
                const name = attributes.part
                parts.push({name, comments})
              }

              // Always clear the comments.  We are only looking for
              // comments that come right before the part.
              comments = []
            },
            oncomment(text) {
              comments.push(text)
            }
          })
          parser.write(template)
          parser.end()

          // Add the parts to the context.  At module link time, each class
          // will update it's module document with the correct part info.
          if (parts.length > 0) {
            const contextPartsRef = context[context.lastClassPartsKey] || []
            parts.forEach(value => {
              const description =
                  value.comments?.reduce((acc, c) => acc += c, '').trim()
              contextPartsRef.push({name: value.name, description})
              context[context.lastClassPartsKey] = contextPartsRef
            })
          }
          break
      }
    },

    moduleLinkPhase({moduleDoc, context}) {
      // For each class declaration in the module, update it's part info
      // as needed.
      moduleDoc.declarations
          .filter(decl => decl.kind === 'class')
          .map(decl => {
            const key = `${moduleDoc.path}:${decl.name}:parts`
            if (context[key]) {
              decl.cssParts = decl.cssParts || []
              decl.cssParts = decl.cssParts.concat(context[key])
            }
          })
    },

    initialize({ts, customElementsManifest, context}) {},
    collectPhase({ts, node, context}){},
    packageLinkPhase({customElementsManifest, context}){},
  }
}
