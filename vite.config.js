/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/rough-elements.ts'),
      name: 'rough',
      fileName: 'rough-elements',
    },
    minify: 'oxc',
  },
  server: {
    host: '0.0.0.0',
    port: 9519,
    allowedHosts: ['titanium.tailb25bc6.ts.net'],
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    pool: 'vmThreads',
  },
})
