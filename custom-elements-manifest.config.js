import slotPlugin from '@rogerta/cem-plugin-litelement-slots'
import partPlugin from './tools/cem-plugin-part.js'

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.test.js', 'src/**/*.spec.js', 'node_modules'],
  outdir: '.',
  litelement: true,
  fast: false,
  stencil: false,
  plugins: [slotPlugin(), partPlugin()]
}
