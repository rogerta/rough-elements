import process from 'node:process'

import { HtmlBasePlugin } from '@11ty/eleventy'
import { marked } from 'marked'

// TODO: the side effect of importing the custom-elements.json here is that
// any change to the class hierarchy will not be picked up by `11ty --serve`
//  until the process is restarted.  This is done as an optimization to prevent
// recalculating the `classes` global each time `findSuperclass()` (or
// `findMixinsOfClass()`) is called.  These methods are called at least once per
// component (~27 as of this writing).
import data from './dist/custom-elements.json' with { type: 'json' }

const modules = data.modules
  .filter(m => m.kind === 'javascript-module' && m.declarations)
const classes = modules
  .flatMap(m => m.declarations.filter(d => d.kind === 'class'))

function findSuperclass(clazz) {
  if (!clazz?.superclass?.name) {
    return undefined
  }

  return classes.find(c => c.name === clazz.superclass.name)
}

function findMixinsOfClass(clazz) {
  // Find mixins from superclasses as well.
  const mixins = new Set()
  for (let c = clazz; c; c = findSuperclass(c)) {
    c.mixins?.forEach(m => mixins.add(m))
  }

  // console.log(`class=${clazz.name} mixins=${JSON.stringify([...mixins])}`)
  return mixins.keys()
}

/** @param {import("@11ty/eleventy/UserConfig")} config */
export default function(config) {
  config.addPlugin(HtmlBasePlugin)

  // Batch rapid file changes into a single rebuild execution (in msec).
  config.setWatchThrottleWaitTime(300)
  config.setChokidarConfig({
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  })

  config.setInputDirectory('./docs')
  config.setOutputDirectory('./dist/docs')

  // Copy folders to output.  Note: the input directory prefix
  // is stripped from the file name before being copied to
  // the output.
  config.addPassthroughCopy('./docs/img')
  config.addPassthroughCopy('./docs/css')

  // Don't process files in the `internal` folder.  This folder cotains
  // base templates and inlude templates.
  config.ignores.add('./docs/internal/**')

  config.setQuietMode(true)
  config.setServerOptions({
    port: 9520,
  })

  config.addFilter('filterForMethods', function(clazz) {
    const methods = clazz.members?.filter(m => {
      return m.kind === 'method' && m.privacy !== 'private'
        && m.privacy !== 'protected' && !m.inheritedFrom
        && m.name !== 'handleEvent'
    }) ?? []

    methods.sort((a, b) => a.name.localeCompare(b.name))
    return methods
  })

  config.addFilter('filterForParts', function(clazz) {
    const arr = clazz.cssParts ?? []
    return arr.toSorted((a, b) => a.name.localeCompare(b.name))
  })

  config.addFilter('filterForCSSProperties', function(clazz) {
    const props = clazz.cssProperties?.filter(p => !p.inheritedFrom) ?? []
    props.sort((a, b) => a.name.localeCompare(b.name))
    return props
  })

  config.addFilter('filterForProperties', function(clazz) {
    // Don't bother documenting private and protected fields.
    // Don't bother documenting fields inherited from border and backfground
    // mixins,since those are documented in a separate web page and clutter
    // the properties list.
    //
    // Also, don't bother documenting some internal fields.  For example,
    // 'styles' is Lit's internal CSS styling of the element.
    const props = clazz.members?.filter(m => {
      return m.kind === 'field' && m.privacy !== 'private'
        && m.privacy !== 'protected'
        && m.inheritedFrom?.name !== 'BackgroundMixin'
        && m.inheritedFrom?.name !== 'BorderMixin'
        && m.name !== 'styles'
        && m.name !== 'enableDebugging'
        && m.name !== 'formAssociated'
        && m.name !== 'shadowRootOptions'
    }) ?? []

    props.sort((a, b) => a.name.localeCompare(b.name))
    return props
  })

  config.addFilter('mapParam', function(arr) {
    return arr?.map(e => {
      const name = e.name ?? ''
      const type = e.type?.text ?? ''
      return type ? `${name}: ${type}` : name
    }) ?? []
  })

  config.addFilter('marked', function(str) {
    return str ? marked.parse(str) : ''
  })

  config.addFilter('filterForMixins', function(clazz) {
    return [...findMixinsOfClass(clazz)].map(m => m.name)
  })

  config.addFilter('filterForBordered', function(components) {
    return components.filter(
      c => findMixinsOfClass(c).some(m => m.name === 'BorderMixin'),
    )
  })

  config.addFilter('filterForBackgrounded', function(components) {
    return components.filter(
      c => findMixinsOfClass(c).some(m => m.name === 'BackgroundMixin'),
    )
  })

  config.addFilter('filterForFormControlled', function(components) {
    return components.filter(
      c => c.members?.find(m => m.name === 'formAssociated'),
    )
  })

  config.addFilter('filterForEvents', function(clazz) {
    return clazz?.events ?? []
  })

  config.addFilter('findMixin', function(mixins, name) {
    return mixins.find(m => m.name === name)
  })
}

// Setup a dynamic path prefix for GitHub Pages
const pathPrefix = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'
console.log(`pathPrefix=${pathPrefix}`)

export const config = {
  pathPrefix,
}
