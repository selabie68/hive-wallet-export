import { defineConfig } from 'vite'
import { resolve } from 'path'
import million from 'million/compiler'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/hive-wallet-export/',
  plugins: [
    svgr(),
    react({
      babel: {
        plugins: ['babel-plugin-styled-components'],
      },
    }),
    million.vite({
      auto: {
        threshold: 0.1,
        skip: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    sourcemap: true,
  },
})
