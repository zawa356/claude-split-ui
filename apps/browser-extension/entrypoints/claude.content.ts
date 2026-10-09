import { installFetchHook } from '../../../packages/core/src/index.mjs';

// Claude performs its bootstrap fetch before the external application bundles.
export default defineContentScript({
  matches: ['https://claude.ai/*'],
  runAt: 'document_start',
  world: 'MAIN',
  allFrames: false,
  main() {
    installFetchHook(window);
  }
});
