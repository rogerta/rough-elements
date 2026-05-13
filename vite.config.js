import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/rough.ts'),
      name: 'rough',
      fileName: 'rough',
    },
    minify: 'oxc'
  },
  server: {
    host: '0.0.0.0',
    port: 9519,
    allowedHosts: ['photoace.tawacentral.net'],
  },
})

