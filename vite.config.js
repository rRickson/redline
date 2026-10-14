import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    // pdf.js is large; the single-file output is meant to be big
    chunkSizeWarningLimit: 4000,
  },
  preview: { port: 4573, strictPort: true },
})
