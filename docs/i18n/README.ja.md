<div align="center">

# Claude Split UI

**Claudeの「Chat / Cowork」分離UIを実験的に復元するプロジェクト**

[English](../../README.md) · [日本語](README.ja.md)

[クイックスタート](#クイックスタートfirefoxchrome) · [対応状況](#対応状況) · [FAQ](../FAQ.md) · [開発参加](../../CONTRIBUTING.md) · [セキュリティ](../../SECURITY.md)

> [!WARNING]
> **非公式・実験的なプロジェクトです。** Anthropicとは提携・協賛・関係していません。非公開の実装に依存しており、予告なく動作しなくなる可能性があります。

</div>

## このプロジェクトについて

Claude Webで統合されたChatとCoworkのUIを、**クライアント側の限定的な変更**によって分離表示へ戻せるか検証しています。サブスクリプションの権限を解除したり、認証を回避したり、Desktop専用機能を復元したりするものではありません。

## 対応状況

| 対象 | 状態 | 確認できていること |
| :-- | :-- | :-- |
| Firefox：従来のMV3 PoC | **実機確認済み** | 有効化・再読込で分離UI、削除・再読込で統合UIへ復帰 |
| Firefox：WXT版 | **基本動作確認済み** | 一時インストールで分離表示、削除・再読み込みで統合UIに復帰 |
| Chrome：WXT版 | **基本動作確認済み** | 展開した拡張機能で分離表示、無効化・再読み込みで統合UIに復帰 |
| Claude Desktop：Windows | **基本動作確認済み** | Claude 2.31226（Microsoft Store版）で、導入時に分離UI・解除後に統合UI。[claude_ctrl-enter](https://github.com/zawa356/claude_ctrl-enter) 0.4 と併用可 |
| Claude Desktop：Linux | **未確認** | 同じパッケージ。ローダーはCIでのみ確認 |

CIの成功はブラウザ上の動作保証ではありません。最新状況は[GitHub Actions](https://github.com/zawa356/claude-split-ui/actions)をご覧ください。

## クイックスタート：Firefox・Chrome

両方のWXT版について（v0.1.0開発時に）Claude Web上の簡易実機テストを実施し、拡張機能を有効にするとChat / Coworkが分離表示され、削除・無効化後の再読み込みで統合UIに戻ることを確認しました。**現段階は開発者向けの手動インストール方式です。**

1. [最新のGitHub Release](https://github.com/zawa356/claude-split-ui/releases/latest)を開きます。
2. **Assets**から、Firefoxなら `claude-split-ui-<版>-firefox.zip`、Chromeなら `claude-split-ui-<版>-chrome.zip` をダウンロードします。
3. ZIPを展開し、展開先フォルダー直下に `manifest.json` と `content-scripts/` があることを確認します。
4. **Firefox：** `about:debugging#/runtime/this-firefox` → **「一時的なアドオンを読み込む…」** → 展開済み拡張機能内の `manifest.json` を選択します。Firefoxを再起動すると一時アドオンは解除されます。
5. **Chrome：** `chrome://extensions/` → **デベロッパーモード**を有効化 → **「パッケージ化されていない拡張機能を読み込む」** → `manifest.json` が直下にある**フォルダー**を選択します。
6. [Claude Web](https://claude.ai/new)を開く、または再読み込みし、Chat / Coworkの分離表示を確認します。

**元に戻す：** Firefoxは `about:debugging` で一時アドオンを削除。Chromeは `chrome://extensions/` でスイッチをOFFにするか削除。その後Claudeを再読み込みすると統合UIに戻ります。

**注意：** Firefox AMO公開申請は準備済みですが、申請・承認はまだ行われていません。Mozilla署名済みXPIやChrome Web Storeでの配布はまだありません。ZIPをXPIへリネームしてもMozilla署名は付与されません。実機で確認したのは分離・復帰の基本動作であり、全アカウント・全バージョン・Coworkの各機能を保証するものではありません。

## クイックスタート：Claude Desktop

Claude本体は書き換えません。Chrome版を [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) 経由で導入します。これは、Claude DesktopがReact DevTools用に読み込む拡張の枠（`REACT_PROFILE=1`）を複数の拡張で共有するための小さなローダーです。

1. [最新のGitHub Release](https://github.com/zawa356/claude-split-ui/releases/latest) から `claude-split-ui-<版>-desktop.zip` をダウンロードして展開します。
2. **Windows：** `install.bat` を実行。**Linux：** `bash install.sh` を実行し（python3 3.8以上が必要）、一度ログアウト・ログインします。
3. Claudeを完全に終了（タスクトレイのアイコン →「終了」）してから起動し直します。入力欄の「＋」の横にChat / Coworkの切り替えが出ます。

**元に戻す：** `uninstall.bat` / `bash uninstall.sh` を実行し、Claudeを再起動します。`diagnose` は読み取りのみ、`repair` は枠を作り直します。Claudeのインストール先は変更せず、外したファイルは削除せずバックアップへ移します。同じローダーを使う他のツール（[claude_ctrl-enter](https://github.com/zawa356/claude_ctrl-enter) など）はそのまま動き続けます。現時点の確認はWindows・Claude 2.31226のみです（[記録](../research/2026-10-09-desktop-poc.md)）。

WXT版で問題がある場合、旧来の[Firefox PoC](../../poc/firefox-mv3/README.md)も残しています。認証済みHARやbootstrapレスポンス原本はIssueに貼らないでください。

## 仕組み

```text
Claude Web → 同一オリジンのbootstrap fetch
           → ブラウザ内（またはClaude Desktopの拡張の枠）でレスポンスを限定的に変更
           → feature 1174351393: defaultValue=false / rules[].force=false
           → Chat / Coworkの分離UI
```

対象外の通信や未知のレスポンス形式は原則そのまま通します。テレメトリーや認証情報の収集・送信・保存は行いません。

[技術資料](../research/wxt-migration.md) · [プライバシー](../PRIVACY.md) · [Firefox AMO公開準備](../amo/AMO.ja.md)

## 開発者向け

Node.js 22以降、WXTビルドにはpnpm 10.xを使用します。Desktop用ローダーをサブモジュール `vendor/claude-desktop-webext` に置いているため、`--recurse-submodules` を付けてcloneしてください。

```sh
git submodule update --init
npm run check
npm test
npm run build:poc
```

**分離・復帰の基本動作を実機確認済み**のWXT版ビルド（広範な互換性は未検証）：

```sh
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
```

詳細は[開発ガイド](DEVELOPMENT.ja.md)をご覧ください。

## ディレクトリ構成

| ディレクトリ | 用途 |
| :-- | :-- |
| `poc/firefox-mv3/` | 実機確認済みPoC |
| `apps/browser-extension/` | Firefox / Chrome共通WXT版（基本動作確認済み） |
| `packages/core/` | 共通処理とテスト |
| `apps/desktop/` | Claude Desktop用パッケージ設定（Chrome版を再利用） |
| `vendor/claude-desktop-webext/` | Claude Desktop用の共通ローダー（[claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext)、gitサブモジュール） |
| `docs/` | 解析資料・開発資料・翻訳 |

## ロードマップ

- [x] Feature Flagの特定とUI変化の再現
- [x] Firefox MV3 PoCのA/B/A検証
- [x] 共通ロジックとWXTビルド候補の実装
- [x] WXT Firefoxの分離・復帰の簡易実機検証
- [x] WXT Chromeの分離・復帰の簡易実機検証
- [x] 合成データによるブラウザ回帰テスト（Chromium拡張機能／Firefox生成スクリプト）
- [x] 共有ローダー経由でClaude Desktop（Windows）を検証
- [ ] Claude DesktopのLinux版を検証

## コミュニティとライセンス

IssueやPRでの報告・貢献を歓迎します。投稿前に[CONTRIBUTING](../../CONTRIBUTING.md)、[行動規範](../../CODE_OF_CONDUCT.md)、[SECURITY](../../SECURITY.md)をご確認ください。

MITライセンス。[LICENSE](../../LICENSE)参照。**AnthropicおよびClaudeは各権利者の商標です。**

---

<sub>独立した調査プロジェクトです。公式の関係はなく、動作保証はありません。</sub>

Desktop開発版では、インストール先の検出と、MSIXの仮想化データフォルダーだけが存在する場合の導入を改善しました。[詳細](../../apps/desktop/README.md#installation-discovery-development-version)。従来版の実機動作は未確認です。
