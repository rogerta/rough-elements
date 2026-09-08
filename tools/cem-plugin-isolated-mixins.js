// Creates class declarations from variable declations that are classes defined
// as mixins of other classes.
//
// When building component that use mixins, the typical syntax is as follows
// (example code based on Lit):
// ```
// import { Mixin } from './mixin.ts'
//
// @customElement('my-component')
// export class MyComponent extends Mixin(LitElement) { ... }
// ```
//
// With the introduction of the `isolatedDeclarations` Typescript compiler
// option (becoming more popular due to large build speedup gains, cleaner API
// design, compatibility with more tooling, and faster IDE workflows) this code
// no longer compiles.  The fix is to introduce a properly typed intermediate
// base class:
// ```
// import { Mixin, MixinInterface } from './mixin.ts'
//
// export const BaseClass:
//   (new(...args: any[]) => MixinInterface) & typeof LitElement
//   = Mixin(LitElement)
//
// @customElement('my-component')
// export class MyComponent extends BaseClass { ... }
// ```
// See (Lit)[https://lit.dev/docs/composition/mixins/#mixins-in-typescript]
// documentaton for more details of using mixins with web components.
//
// This CEM plugin finds variable declations of the form shown above and adds
// the corresponding class declaration to the module document of the generated
// custom element manifest file.
//
// Requirements and Caveats
// - The base class variable must be exported.
// - Mutiple mixins are supported, for example:
// ```
// import { Mixin1, Mixin1Interface } from './mixin1.ts'
// import { Mixin2, Mixin2Interface } from './mixin2.ts'
// import { Mixin3, Mixin3Interface } from './mixin3.ts'
//
// export const BaseClass:
//   (new(...args: any[]) => Mixin1Interface) &
//   (new(...args: any[]) => Mixin2Interface) &
//   (new(...args: any[]) => Mixin3Interface) &
//   typeof LitElement
//   = Mixin1(Mixin2(Mixin3(LitElement)))
// ```
// - Mixins are expected to be functions with exactly one argument.


// Copied from @custom-elements-manifest/analyzer/src/utils/index.js
function resolveModuleOrPackageSpecifier(moduleDoc, context, name) {
  const foundImport = context?.imports?.find(_import => _import.name === name)

  /* item is imported from another file */
  if(foundImport) {
    if(foundImport.isBareModuleSpecifier) {
      /* import is from 3rd party package */
      return { package: foundImport.importPath }
    } else {
      /* import is imported from a local module */
      return {
        module: new URL(foundImport.importPath,
          `file:///${moduleDoc.path}`).pathname
}
    }
  } else {
    /* item is in current module */
    return { module: moduleDoc.path }
  }
}

/**
 * Resolves declaration `name` found within the module `moduleDoc.path` into
 * an object that uniquely identify the declaration within that module.
 *
 * @param {*} moduleDoc The module that contains the `name` declaration.
 * @param {*} context Context passed to CEM callbacks.
 * @param {*} name The name of the declaration.
 * @returns
 */
function resolve(moduleDoc, context, name) {
  return {
    name,
    ...resolveModuleOrPackageSpecifier(moduleDoc, context, name),
  }
}

/**
 * Returns the CEM plugin that creates class declarations from variable
 * declations that are classes defined as mixins of other classes.
 * @returns The CEM plugin.
 */
export default function isolatedMixinsPlugin() {
  const files = {}
  let manifest = null

  return {
    name: 'cem-plugin-isolated-mixins',

    initialize({ ts, customElementsManifest, context }) {
      manifest = customElementsManifest;
    },

    collectPhase({ ts, node, context }) {},

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
          if (ts.isCallExpression(initializer) &&
              initializer.arguments.length === 1) {
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

          context.isolatedMixins = context.isolatedMixins || []
          context.isolatedMixins.push(item)
        }
      })
    },

    moduleLinkPhase({ moduleDoc, context }) {
      // For each possible class, see if the first identifier in the chain is a
      // mixin.  If so, create a class entry in the appropriate moduleDoc with
      // the given name diriving from the identifier chain.
      //
      // For example, an entry in `context.isolatedMixins` of the form:
      // ```
      // {
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
      files[moduleDoc.path] = context.imports || []

      // Get list of all known mixins.
      const mixins = manifest.modules.flatMap(
        module => module.declarations
          .filter(d => d.kind === 'mixin')
          .map(d => { return { path: module.path, name: d.name }})
      )

      // Acculmulates the indices of items in `context.isolatedMixins`
      // that have been processed and should be removed from future
      // consideration in subsequent modules.
      const toDel = []

      context.isolatedMixins?.forEach(({ name, chain }, index) => {
        // Make sure that all items in the chain can be resolved to a module or
        // package specifier.  If not, try again with the next module.
        const allResolved = chain.every(item => {
          if (item.package) {
            return true
          } else if (item.module) {
            // Remove leading '/' added by URL().pathname in
            // resolveModuleOrPackageSpecifier().
            const path = item.module.substring(1)
            return !!files[path]
          } else {
            // Error, should have either package or module.
            return false
          }
        })
        if (!allResolved) {
          return
        }

        // When reaching this point, the item is either a base class or not.
        // In either case it should no longer be processed.
        toDel.push(index)

        // If the first item in the chain is not a mixin, then this variable is
        // not a class derived from mixins.
        const first = chain[0]
        const isMixin = mixins.some(i => i.name === first.name)
        if (!isMixin) {
          return
        }

        // Build a class template for the class.  This code is bassed on
        // @custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createClass.js.

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

        // Add the class template to the module doc of the module where the
        // variable was declared, which is not necessarily the current module.
        const modDoc = manifest.modules.find(m => m.path === name.module)
        if (!modDoc) {
          if (context.dev) {
            console.log('cem-plugin-isolated-mixins: expected module not found',
                name.module)
          }
          return
        }

        // Remove the variable statement from the moduleDoc, since it is now
        // represented as a class.
        modDoc.declarations =
            modDoc.declarations.filter(d => d.name !== name.name)

        modDoc.declarations.push(classTemplate)
      })

      toDel.reverse().forEach(i => context.isolatedMixins.splice(i, 1))
    },

    packageLinkPhase({ context }) {
      // Anything left in `context.isolatedMixins` at this stage is a
      // variable declaration that could not be resolved to a class of mixins.
      //
      // This could be a bug in the web component, but not necessarily.  For
      // example, the following code would leave something in isolatedMixins
      // and is not a bug: `const MAX = caculateMax(MAX_ENVVAR_NAME)`.

      context.isolatedMixins?.forEach(({ name }) => {
        if (context.dev) {
          console.log('cem-plugin-isolated-mixins: unresolved variable',
              name.name)
        }
      })
    },
  }
}
