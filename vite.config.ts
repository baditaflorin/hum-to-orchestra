import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  base: process.env.VITE_PUBLIC_BASE ?? '/hum-to-orchestra/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/idb')) {
            return 'storage';
          }
          if (id.includes('node_modules/zod')) {
            return 'validation';
          }
          return undefined;
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __GIT_COMMIT__: JSON.stringify(process.env.VITE_GIT_COMMIT ?? 'offline'),
    __REPOSITORY_URL__: JSON.stringify('https://github.com/baditaflorin/hum-to-orchestra'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita')
  }
});
