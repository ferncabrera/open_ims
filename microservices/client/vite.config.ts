/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
      __APP_VERSION__: JSON.stringify('v0.4.0'),
      __APP_DEFAULT_ERROR_MSG__: JSON.stringify('Oops, an error occured! Sorry about that please try again later.')
    },
  plugins: [react()],
//   plugins: [react({ plugins: [["@swc-jotai/react-refresh", {}], ["@swc-jotai/debug-label", {}]] })],
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
    setupFiles: ['./tests/setup.js', './tests/mocks/setupMocks.ts'],
    coverage: {
      provider: 'v8',
    }
  }
});
