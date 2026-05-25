import { Parser } from "htmlparser2"

export default function myPlugin() {
  return {
    name: 'wc-slot',

    analyzePhase({ts, node, moduleDoc, context}) {
      const filename = node.getSourceFile()?.fileName

      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          //  console.log(`rogerta ${filename}: ${node.name?.getText()}`)
           const key = `${filename}:${node.name?.getText()}:slots`
          context.lastClassSlotsKey = key
          break
        case ts.SyntaxKind.TaggedTemplateExpression:
          if (!context.lastClassSlotsKey) {
            console.log(`rogerta ${filename}: have html'' but no class?`)
            break
          }

          let comments = []
          let slots = []

          if (node.tag?.getText() === 'html') {
            const template =
                node.template?.getText().slice(1, -1)
                    .replaceAll('\n', ' ') ?? '<no-template>'
            const parser = new Parser({
              onopentag(tagName, attributes) {
                if (tagName === 'slot') {
                  const name = attributes.name ?? ''
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

            // Add the slots to the current class declaration.
            if (slots.length > 0) {
              const contextSlotsRef = context[context.lastClassSlotsKey] || []
              slots.forEach(value => {
                const description =
                    value.comments?.reduce((acc, c) => acc += c, '').trim()
                contextSlotsRef.push({name: value.name, description})
                context[context.lastClassSlotsKey] = contextSlotsRef
              })
            }
          }
          break
      }
    },

    moduleLinkPhase({moduleDoc, context}) {
      const keys = moduleDoc.declarations
          .filter(decl => decl.kind === 'class')
          .map(decl => {
            const key = `${moduleDoc.path}:${decl.name}:slots`
            // console.log(`rogerta context[${key}] orig slots = ${decl.slots}`)
            // console.log(`rogerta context[${key}] = ${JSON.stringify(context[key])}`)
            if (context[key]) {
              decl.slots = decl.slots || []
              decl.slots = decl.slots.concat(context[key])
            }
          })
    },

    initialize({ts, customElementsManifest, context}) {},
    collectPhase({ts, node, context}){},
    packageLinkPhase({customElementsManifest, context}){},
  }
}
