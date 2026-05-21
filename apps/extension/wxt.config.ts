import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'ApplyFlow',
<<<<<<< HEAD
    description: 'Autofill job applications in seconds. Track your progress. Land faster.',
    permissions: [
      'storage',
      'activeTab',
      'tabs',
      'alarms',
    ],
    host_permissions: [
      '*://*.linkedin.com/*',
      '*://*.indeed.com/*',
      '*://*.greenhouse.io/*',
      '*://jobs.lever.co/*',
      '*://*.myworkdayjobs.com/*',
      '*://*.ashbyhq.com/*',
      '*://*.recruitee.com/*',
      '*://*.bamboohr.com/*',
      '*://*.smartrecruiters.com/*',
    ],
    action: {
      default_popup: 'popup/index.html',
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '128': 'icon/128.png',
      },
    },
  },
=======
    description: 'AI-powered job application assistant',
    permissions: ['storage', 'tabs'],
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
});
