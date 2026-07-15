import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project pages serve from /<repo>/, not from the domain root.
  base: '/medication-stock-tracker/',
})
