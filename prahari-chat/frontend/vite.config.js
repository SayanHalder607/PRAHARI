import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        host: true,
        proxy: {
            '/api': {
                target: backendUrl,
                changeOrigin: true,
            },
        },
    },
});