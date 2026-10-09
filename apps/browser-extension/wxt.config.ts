import { defineConfig } from 'wxt';

// No background worker, cookie permission, remote scripts or telemetry.
export default defineConfig({
  srcDir: '.',
  manifest: ({ browser }) => ({
    name: 'Claude Split UI (Unofficial)',
    description: 'Experimental restoration of Claude Chat/Cowork split UI. No telemetry.',
    version: '0.2.3',
    ...(browser === 'firefox' ? {
      browser_specific_settings: {
        gecko: {
          id: '@claude-split-ui-zawa356',
          data_collection_permissions: { required: ['none'] },
          strict_min_version: '128.0'
        }
      }
    } : {})
  })
});
