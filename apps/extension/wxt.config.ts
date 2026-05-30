import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'ApplyFlow',
    description: 'AI-powered job application assistant',
    permissions: ['storage', 'tabs', 'cookies'],
    host_permissions: ['<all_urls>'],
  },
  vite: () => ({
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: false,
        },
      },
    },
  }),
});
