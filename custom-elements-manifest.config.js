import slotPlugin from './tools/cem-plugin-slot.js'

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.test.js', 'src/**/*.spec.js', 'node_modules'],
  outdir: '.',
  litelement: true,
  fast: false,
  stencil: false,
  plugins: [slotPlugin()]
};
