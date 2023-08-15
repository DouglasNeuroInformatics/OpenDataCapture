import { defineConfig, sharpImageService } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: '_assets'
  },
  compressHTML: true,
  experimental: {
    assets: true
  },
  image: {
    service: sharpImageService()
  },
  server: {
    port: parseInt(process.env.MARKETING_DEV_SERVER_PORT ?? 4000)
  }
});
