# 開発ガイド

[English](../DEVELOPMENT.md) · [日本語](DEVELOPMENT.ja.md)

## 必要な環境

- Node.js 22以降
- WXTビルド用pnpm 10.x（Corepackまたはローカルインストール）
- Gitのサブモジュール：`git clone --recurse-submodules` で取得するか、clone後に `git submodule update --init` を実行します。Claude Desktop用ローダーは `vendor/claude-desktop-webext` にあります。
- 従来の一時アドオンPoC用Firefox 128以降

## コマンド

```sh
git submodule update --init
npm run check
npm test
npm run build:poc
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
node vendor/claude-desktop-webext/tools/package.mjs --config apps/desktop/desktop-webext.json --extension apps/browser-extension/.output/chrome-mv3 --out dist/desktop/claude-split-ui-desktop
```

CIでは生成されたMV3マニフェストについて、同一オリジンの対象、MAIN world、document_startを検査します。WXTの出力は `apps/browser-extension/.output/` に生成されます。**WXT版Firefox・Chromeは、分離表示と無効化後の統合UI復帰を実機で簡易確認済みです。**

最後のコマンドは、Chrome版からClaude Desktop用パッケージを作ります。作ったパッケージは、python3 または Windows PowerShell を使って一時的なサンドボックスに導入し、検証します。合成データの自動テストは、全機能の動作保証ではありません。

## 構成

- `poc/firefox-mv3/`：実機確認済みの基準実装。回帰テスト用に保持。
- `packages/core/`：対象Feature Flagを限定的に変更する共通処理。
- `apps/browser-extension/`：WXTエントリーポイントとブラウザ向けビルド。
- `apps/desktop/`：Claude Desktop用パッケージの設定（`desktop-webext.json`）。WXT版Chromeのビルドを再利用します。`order: 10` で、他のツールより先にfetchフックを読み込みます。
- `vendor/claude-desktop-webext/`：Claude Desktop用の共通ローダー（gitサブモジュール。リリースタグに固定）。ローダーの修正は [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) 側で行い、サブモジュールの参照先を更新します。

## リリース

まだGitHub Releaseのない版を `main` にpushすると、`.github/workflows/release.yml` が公開します。公開物はFirefox・Chrome・DesktopのZIPと `SHA256SUMS.txt` です。

版を上げる手順：

1. `package.json`、`apps/browser-extension/package.json`、`apps/browser-extension/wxt.config.ts` の版を更新します。
2. `docs/releases/v<版>.md` を追加します。

## テスト・報告

自動テストには合成データを使用してください。実際のHAR、bootstrap JSON、Cookie、トークン、アカウント識別子、会話内容をコミット・投稿しないでください。報告には次の内容を記載してください。

- ブラウザまたはClaude Desktopのバージョン
- 拡張機能のコミットSHA
- Network Overrideを無効にしたか
- UIの結果

## 貢献方法

[CONTRIBUTING.md](../../CONTRIBUTING.md)をご覧ください。変更はPRで提出し、CI成功だけを根拠に実機対応済みと表記しないでください。
