import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid TypeScript error about 'cwd' property
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    base: './', // IMPORTANT: This fixes the blank page/asset loading issue on InfinityFree
    define: {
      // Polyfill process.env for browser compatibility
      'process.env': env
    }
  }
})