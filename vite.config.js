import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The json-server API runs on 127.0.0.1:3001 (see "npm run api"). Everything the
// app requests under /api is forwarded there, so there are no CORS problems and
// the same URLs work in both `npm run dev` and `npm run preview`.
// 127.0.0.1 rather than "localhost" on purpose: Node 18+ can resolve localhost to
// IPv6, while json-server listens on IPv4.
const api = {
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
})
