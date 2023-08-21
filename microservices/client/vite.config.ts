/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5000,
    // Add the next lines if you're using windows and hot reload doesn't work
     watch: {
       usePolling: true
     },
     strictPort: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js', './src/mocks/setupMocks.ts'],
    coverage: {
      provider: 'v8',
    }
  }
})
