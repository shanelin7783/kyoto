import { defineConfig } from 'vite'

export default defineConfig({
  base: '/kyoto/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
})
