import { marked } from 'marked'

/** @param {import("@11ty/eleventy").UserConfig} config */
export default function(config) {
  config.setInputDirectory('./docs')
  config.setOutputDirectory('./dist/docs')

  // Copy `img/` to output.  Note: the input directory prefix
  // is stripped from the file name before being copied to
  // the output.
  config.addPassthroughCopy('./docs/img')

  config.setQuietMode(true)
  config.setServerOptions({
    port: 9520,
  })

  config.addFilter('filterForMethods', function (members) {
    return members.filter(m => {
      return m.kind === 'method' && m.privacy !== 'private' &&
      m.privacy !== 'protected' && !m.inheritedFrom &&
      m.name !== 'handleEvent'
    })
  })

  config.addFilter('mapParam', function (arr) {
    return arr ? arr.map(e => {
      const name = e.name ?? ''
      const type = e.type?.text ?? ''
      return type ? `${name}: ${type}` : name
    }): []
  })

  config.addFilter('marked', function (str) {
    return str ? marked.parse(str) : ''
  })
}
