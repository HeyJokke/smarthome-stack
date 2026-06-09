import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  server: {
      host: true
  },
  plugins: [
    react(),
    legacy({
      targets: ['ios >= 12']
    })
  ],
})
