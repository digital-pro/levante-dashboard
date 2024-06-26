import { sentryVitePlugin } from '@sentry/vite-plugin';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    VitePWA({
      manifest: {
        // Modify manifest options here...
        name: 'ROAR Dashboard',
        short_name: 'ROAD',
        start_url: '.',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: 'manual',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico}'],
        },
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // Add more manifest options as needed
      },
      /* enable sw on development */
      devOptions: {
        enabled: true,
        type: 'module',
        /* other options */
      },
    }),
    ...(process.env.NODE_ENV === 'development' ? [basicSsl()] : []),
    nodePolyfills({
      globals: {
        process: true,
      },
    }),
    sentryVitePlugin({
      org: 'roar-89588e380',
      project: 'dashboard',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ['lodash'],
          tanstack: ['@tanstack/vue-query'],
          chartJs: ['chart.js'],
          sentry: ['@sentry/browser', '@sentry/integrations', '@sentry/vue', '@sentry/wasm'],
          fluency: ['@bdelab/roam-fluency'],
          firekit: ['@bdelab/roar-firekit'],
          letter: ['@bdelab/roar-letter'],
          multichoice: ['@bdelab/roar-multichoice'],
          phoneme: ['@bdelab/roar-pa'],
          sre: ['@bdelab/roar-sre'],
          swr: ['@bdelab/roar-swr'],
          utils: ['@bdelab/roar-utils'],
          vocab: ['@bdelab/roar-vocab'],
          ran: ['@bdelab/roav-ran'],
          crowding: ['@bdelab/roav-crowding'],
          'roav-mep': ['@bdelab/roav-mep'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@bdelab/roar-firekit', 'vue-google-maps-community-fork', 'fast-deep-equal'],
  },
});
