
// Copied from @custom-elements-manifest/analyzer/src/utils/index.js
function resolveModuleOrPackageSpecifier(moduleDoc, context, name) {
  const foundImport = context?.imports?.find(_import => _import.name === name);

  /* item is imported from another file */
  if(foundImport) {
    if(foundImport.isBareModuleSpecifier) {
      /* import is from 3rd party package */
      return { package: foundImport.importPath }
    } else {
      /* import is imported from a local module */
      return { module: new URL(foundImport.importPath, `file:///${moduleDoc.path}`).pathname }
    }
  } else {
    /* item is in current module */
    return { module: moduleDoc.path }
  }
}

function resolve(moduleDoc, context, name) {
  return {
    name,
    ...resolveModuleOrPackageSpecifier(moduleDoc, context, name),
  }
}

export default function isolatedMixinsPlugin() {
  const files = {};
  let manifest = null;

  return {
    name: 'cem-plugin-isolated-mixins',

    initialize({ ts, customElementsManifest, context }) {
      manifest = customElementsManifest;
    },

    collectPhase({ ts, node, context }) {
      // // Look for variable statements that define mixins of the form:
      // // `const Mixin = (superClass) => ...` where the typeParameter of the
      // // arrow function is a type reference to a class.

      // if (!ts.isVariableStatement(node)) {
      //   return
      // }

      // node.declarationList.declarations.forEach(declaration => {
      //   const name = declaration.name.getText()
      //   let baseClassName = null

      //   const initializer = declaration.initializer
      //   if (initializer && ts.isArrowFunction(initializer) &&
      //       initializer.typeParameters?.length === 1) {
      //     let typeParameter = initializer.typeParameters[0]
      //     while (typeParameter) {
      //       if (ts.isTypeReferenceNode(typeParameter)) {
      //         typeParameter =
      //             ts.getEffectiveConstraintOfTypeParameter(typeParameter)
      //       } else if (ts.isIdentifier(typeParameter)) {
      //         baseClassName = typeParameter.getText()
      //         break
      //       } else {
      //         break
      //       }
      //     }
      //   }
      // })
    },

    analyzePhase({ ts, node, moduleDoc, context }) {
      // Look for variable statements that are a chain of function calls ending
      // in an identifier, like `const Class = mixin1(mixin2(BaseClass))`.
      // If such a variable statement is found, mark it as a possible class
      // derived from mixins, and store the chain of identifiers in the context.
      // This will be used in the moduleLinkPhase to determine if this is
      // really a class.

      if (!ts.isVariableStatement(node)) {
        return
      }

      const path = moduleDoc.path
      node.declarationList.declarations.forEach(declaration => {
        const name = declaration.name.getText()

        const chain = []
        let initializer = declaration.initializer
        while (initializer) {
          if (ts.isCallExpression(initializer) && initializer.arguments.length === 1) {
            chain.push(initializer.expression.getText())
            initializer = initializer.arguments[0]
          } else if (ts.isIdentifier(initializer)) {
            chain.push(initializer.getText())
            break
          } else {
            break
          }
        }
        if (chain.length > 1) {
          const item = {
            name: resolve(moduleDoc, context, name),
            chain: chain.map(name => resolve(moduleDoc, context, name)),
          }

          // console.log('isolated-mixins: possible base class', item.name.name)
          context.isolatedMixins = context.isolatedMixins || []
          context.isolatedMixins.push(item)
        }
      })
    },

    moduleLinkPhase({ moduleDoc, context }) {
      // For each possible class, see if the first identifier in the chain is a
      // mixin.  If so, create a class entry in the moduleDoc with the given
      // name diriving from the identifier chain.  For example, an entry in
      // `context.isolatedMixins` of the form
      // ```
      // {
      //   path: ...,
      //    name: 'MyClass',
      //    identifiers: ['mixin1', 'mixin2', 'BaseClass']
      // }
      // ```
      // would result in a class entry in the moduleDoc of the form:
      // ```
      // {
      //   kind: 'class',
      //   name: 'MyClass',
      //   superClass: {
      //     name: 'BaseClass',
      //     module: <module-path-for-BaseClass>,
      //   },
      //   mixins: [{
      //     name: 'mixin1',
      //     module: <module-path-for-mixin1>
      //   }, {
      //     name: 'mixin2',
      //     module: <module-path-for-mixin2>
      //   }],
      //   description: '',
      //   cssProperties: [],
      //   cssParts: [],
      //   slots: [],
      //   members: [],
      //   events: [],
      //   attributes: [],
      //   cssStates: [],
      // }
      // ```

      // Save the mapping of module paths to their imports for later use in
      // resolving mixin and base class modules.
      files[moduleDoc.path] = context.imports || [];

      // console.log('isolated-mixins: moduleLinkPhase files', moduleDoc.path)

      // Get list of all known mixins.
      const mixins = manifest.modules.flatMap(module =>
        module.declarations.filter(d => d.kind === 'mixin')
        .map(d => { return { path: module.path, name: d.name }})
      )
      // console.log('isolated-mixins:     known mixins', mixins)

      const toDel = []
      context.isolatedMixins?.forEach(({ name, chain }, index) => {
        // console.log('isolated-mixins:     checking for ', name)
        // Make sure that all items in the chain can be resolved to a module or
        // package specifier.  If not, try again after the next moddule.
        const allResolved = chain.every(item => {
          if (item.package) {
            return true
          } else if (item.module) {
            // Remove leading '/' added by URL().pathname in
            // resolveModuleOrPackageSpecifier().
            const path = item.module.substring(1)
            const imports = files[path]
            // console.log('isolated-mixins:         imports for', item.module, path, !!imports)
            return !!imports
          } else {
            // console.log('isolated-mixins:         ***BUG***')
            // Error, should have either package or module.
            return false
          }
        })
        if (!allResolved) {
          // console.log('isolated-mixins:         skipping unresolved class', name.name)
          return
        }

        // When reaching this point, the item is either a base class or not.
        // In either case it should no longer be processed.
        toDel.push(index)

        // If the first item in the chain is not a mixin, then this is not a
        // class derived from mixins.
        const first = chain[0]
        const isMixin = mixins.some(i => i.name === first.name)
        if (!isMixin) {
          // console.log('isolated-mixins:         ignoring non-class', name.name, first.name)
          return
        }

        const classTemplate = {
          kind: 'class',
          name: name.name,
          description: '',
          cssProperties: [],
          cssParts: [],
          slots: [],
          members: [],
          events: [],
          attributes: [],
          cssStates: [],
        }

        classTemplate.mixins = chain.slice(0, -1)
        classTemplate.superclass = chain[chain.length - 1]

        if(classTemplate.superclass.name === 'HTMLElement') {
          delete classTemplate.superclass.module
        }

        console.log('cem-plugin-isolated-mixins:adding class', name.module, classTemplate)

        const modDoc = manifest.modules.find(m => m.path === name.module)
        if (!modDoc) {
          if (context.dev) {
            console.log('cem-plugin-isolated-mixins: module not found', name.module)
          }
          return
        }
        modDoc.declarations.push(classTemplate)
      })

      toDel.reverse().forEach(i => context.isolatedMixins.splice(i, 1))
    },

    packageLinkPhase({ customElementsManifest, context }) {
      // Anything left in context.isolatedMixins after the moduleLinkPhase is a
      // class that could not be resolved to a module or package specifier.
      // This could be a bug in the web component.
      context.isolatedMixins?.forEach(({ name }) => {
        if (context.dev) {
          console.log('isolated-mixins: unresolved class', name.name)
        }
      })
    },
  }
}
