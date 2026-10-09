export declare const FEATURE_ID: string;
export declare const STATE_KEY: string;
export interface PatchResult {
  value: unknown;
  matched: number;
  modifiedRules: number;
  changed: boolean;
}
export interface HookState {
  installed: true;
  intercepted: number;
  patched: number;
  lastResult: string;
  modifiedRules: number;
}
export declare function isBootstrapUrl(input: Request | URL | string, baseUrl: string): boolean;
export declare function patchBootstrap(root: unknown): PatchResult;
export declare function installFetchHook(scope: Window & typeof globalThis): HookState | null;
