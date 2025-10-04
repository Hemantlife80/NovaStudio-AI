// vite.config.ts (सही कोड)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base वाली लाइन को हमने यहाँ से हटा दिया है
})
