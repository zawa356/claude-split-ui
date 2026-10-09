# 開発ガイド

[English](../DEVELOPMENT.md) · [日本語](DEVELOPMENT.ja.md)

## 必要な環境

- Node.js 22以降
- WXTビルド用pnpm 10.x（Corepackまたはローカルインストール）
- 従来の一時アドオンPoC用Firefox 128以降

## コマンド

```sh
npm run check
npm test
npm run build:poc
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
```

CIでは生成されたMV3マニフェストについて、同一オリジンの対象、MAIN world、document_startを検査します。WXTの出力は `apps/browser-extension/.output/` に生成されます。**WXT版の実機検証は未完了です。**

## 構成

- `poc/firefox-mv3/`：実機確認済みの基準実装。回帰テスト用に保持。
- `packages/core/`：対象Feature Flagを限定的に変更する共通処理。
- `apps/browser-extension/`：WXTエントリーポイントとブラウザ向けビルド。
- `apps/desktop-patcher/`：将来の復元可能なElectron/ASARパッチャー。

## テスト・報告

自動テストには合成データを使用してください。実際のHAR、bootstrap JSON、Cookie、トークン、アカウント識別子、会話内容をコミット・投稿しないでください。報告にはブラウザのバージョン、拡張機能のコミットSHA、Network Overrideを無効にしたか、UIの結果を記載してください。

## 貢献方法

[CONTRIBUTING.md](../../CONTRIBUTING.md)をご覧ください。変更はPRで提出し、CI成功だけを根拠に実機対応済みと表記しないでください。
