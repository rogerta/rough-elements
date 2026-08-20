import partPlugin from '@rogerta/cem-plugin-litelement-parts'
import slotPlugin from '@rogerta/cem-plugin-litelement-slots'

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.test.js', 'src/**/*.spec.js', 'node_modules'],
  outdir: '.',
  litelement: true,
  fast: false,
  stencil: false,
  plugins: [slotPlugin(), partPlugin()],
}
