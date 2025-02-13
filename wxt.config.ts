import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: [
      'downloads',
    ],
    host_permissions: [
      '*://*.pinterest.com/*',
      'https://pin.krnl.my.id/*'
    ]
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
});
