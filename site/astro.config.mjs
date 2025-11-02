import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://cywf.github.io/htb-helper',
  base: '/htb-helper',
  integrations: [
    react(),
    tailwind(),
    mdx()
  ],
  output: 'static',
  build: {
    assets: 'assets'
  }
});
