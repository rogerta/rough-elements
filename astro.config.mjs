import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  srcDir: './docs',
  outDir: './dist/docs',
  server: {
    port: 9518,
    host: false
  },

  integrations: [
    starlight({
      title: 'Rough Elements',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/rogerta/rough-elements'
        }
      ],
      // sidebar: [
      //   { label: 'Introduction', slug: 'intro' },
      //   { label: 'Components', slug: 'components' },
      // ],
    }),
  ],
})

