import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, 
    allowedHosts: [
      'pps.fdrach.pp.ua',
      '.fdrach.pp.ua'
    ],
  },
  plugins: [react()],
})
