import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    // Treat .ts files as plain TypeScript (no JSX) even if tsconfig says otherwise
    jsx: 'preserve',
  },
  plugins: [
    build({
      entry: 'src/index.ts',
    }),
    devServer({
      adapter,
      entry: 'src/index.ts'
    })
  ]
})
