import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/
  base: '/five-dysfunctions/',
  plugins: [react(), tailwindcss()],
  // recharts alone is ~450 kB; the whole app is one page, so splitting buys nothing
  build: { chunkSizeWarningLimit: 800 },
  test: {
    environment: 'node',
  },
})
