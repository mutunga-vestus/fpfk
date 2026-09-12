import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all network interfaces (needed for phone/ngrok access)
    allowedHosts: [
      'unlineal-interpervasively-jestine.ngrok-free.dev', // current ngrok tunnel
      '.ngrok-free.dev', // allow any future ngrok-free.dev tunnel too
      '.ngrok-free.app',
    ],
  },
})
