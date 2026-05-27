import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@uni-draw/shared':    resolve(__dirname, '../../lib/shared'),
      '@uni-draw/core':      resolve(__dirname, '../../lib/core'),
      '@uni-draw/shapes':    resolve(__dirname, '../../lib/shapes'),
      '@uni-draw/materials': resolve(__dirname, '../../lib/materials'),
      '@uni-draw/draw/vue':  resolve(__dirname, '../../lib/vue'),
      '@uni-draw/draw/react': resolve(__dirname, '../../lib/react'),
      '@uni-draw/draw':      resolve(__dirname, '../../lib'),
      '@':                   resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/ai-proxy': {
        target: 'https://api.siliconflow.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/ai-proxy/, ''),
        secure: true,
      },
    },
  },
})
