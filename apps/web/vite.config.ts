import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd() + '/../../', '');
  const frontendKey = env.FRONTEND_MAPS_API_KEY || env.VITE_FRONTEND_MAPS_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'process.env.FRONTEND_MAPS_API_KEY': JSON.stringify(frontendKey),
      'process.env.VITE_FRONTEND_MAPS_API_KEY': JSON.stringify(frontendKey)
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true
        },
        '/socket.io': {
          target: 'http://localhost:4000',
          ws: true
        }
      }
    }
  };
});

