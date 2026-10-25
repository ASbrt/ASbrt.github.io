import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Two independent HTML entries: the existing portfolio and the reading-group page.
// Vite outputs index.html and reading-circle/index.html in dist/.
export default defineConfig({
  plugins: [vue()],
  input: {
    main: resolve(import.meta.dirname, 'index.html'),
    readingCircle: resolve(import.meta.dirname, 'reading-circle/index.html'),
  },
})
