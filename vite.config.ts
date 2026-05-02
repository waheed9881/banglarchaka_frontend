import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_API_PROXY?.trim() || 'http://127.0.0.1:8000'
  const devPortRaw = env.VITE_DEV_PORT?.trim() || '5275'
  const devPort = Number.parseInt(devPortRaw, 10)
  const serverPort = Number.isFinite(devPort) && devPort > 0 ? devPort : 5275

  const devProxy = {
    '/api': {
      target: proxyTarget,
      changeOrigin: true,
    },
    '/storage': {
      target: proxyTarget,
      changeOrigin: true,
    },
  }

  return {
  server: {
    port: serverPort,
    /** If 5275 is taken, Vite picks the next free port instead of failing to start. */
    strictPort: false,
    proxy: devProxy,
    open: '/listings?type=used_car',
  },
  preview: {
    strictPort: false,
    proxy: devProxy,
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}})
