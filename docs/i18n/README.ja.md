<div align="center">

# Claude Split UI

**Claudeの「Chat / Cowork」分離UIを実験的に復元するプロジェクト**

[English](../../README.md) · [日本語](README.ja.md)

[クイックスタート](#クイックスタートfirefox-poc) · [対応状況](#対応状況) · [FAQ](../FAQ.md) · [開発参加](../../CONTRIBUTING.md) · [セキュリティ](../../SECURITY.md)

> [!WARNING]
> **非公式・実験的なプロジェクトです。** Anthropicとは提携・協賛・関係していません。非公開の実装に依存しており、予告なく動作しなくなる可能性があります。

</div>

## このプロジェクトについて

Claude Webで統合されたChatとCoworkのUIを、**クライアント側の限定的な変更**によって分離表示へ戻せるか検証しています。サブスクリプションの権限を解除したり、認証を回避したり、Desktop専用機能を復元したりするものではありません。

## 対応状況

| 対象 | 状態 | 確認できていること |
| :-- | :-- | :-- |
| Firefox：従来のMV3 PoC | **実機確認済み** | 有効化・再読込で分離UI、削除・再読込で統合UIへ復帰 |
| Firefox：WXT版 | **実験段階** | CIでビルド、実機A/B/Aテスト未実施 |
| Chrome：WXT版 | **実験段階** | CIでビルド、実機A/B/Aテスト未実施 |
| Claude Desktop：Electron | **構想段階** | パッチャー未実装 |

CIの成功はブラウザ上の動作保証ではありません。最新状況は[GitHub Actions](https://github.com/zawa356/claude-split-ui/actions)をご覧ください。

## クイックスタート：Firefox PoC

**必要なもの：** Firefox 128以降（実機確認は157.0.1）、Claude Webにアクセスできる環境、展開したリポジトリ。Node.jsは不要です。

1. [ソースコードZIP](https://github.com/zawa356/claude-split-ui/archive/refs/heads/main.zip)を取得して展開するか、リポジトリをcloneします。
2. Firefoxで `about:debugging#/runtime/this-firefox` を開きます。
3. **「一時的なアドオンを読み込む…」** から `poc/firefox-mv3/manifest.json` を指定します。
4. [Claude Web](https://claude.ai/new) を開いて再読み込みします。
5. Chat / Coworkの分離切替が表示されるか確認します。表示はアカウントやClaude側の更新により異なる可能性があります。

**元に戻す：** `about:debugging` で一時アドオンを削除し、Claudeを再読み込みします。ローカルのファイルは消えません。

**動かない場合：** FirefoxのNetwork Overrideが残っていないか確認し、[FAQ](../FAQ.md)を参照してください。HAR、認証済みAPIレスポンス、Cookie、トークンはIssueに投稿しないでください。

> [!IMPORTANT]
> PoCはページのMAIN worldで動作します。コードを確認したうえで使用してください。一時アドオンはFirefox再起動時に解除されます。

## 仕組み

```text
Claude Web → 同一オリジンのbootstrap fetch
           → ブラウザ内でレスポンスを限定的に変更
           → feature 1174351393: defaultValue=false / rules[].force=false
           → Chat / Coworkの分離UI
```

対象外の通信や未知のレスポンス形式は原則そのまま通します。テレメトリーや認証情報の収集・送信・保存は行いません。

[技術資料](../research/wxt-migration.md) · [プライバシー](../PRIVACY.md)

## 開発者向け

Node.js 22以降、WXTビルドにはpnpm 10.xを使用します。

```sh
npm run check
npm test
npm run build:poc
```

**実機未検証**のWXT版ビルド：

```sh
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
```

詳細は[開発ガイド](../DEVELOPMENT.md)をご覧ください。

## ディレクトリ構成

| ディレクトリ | 用途 |
| :-- | :-- |
| `poc/firefox-mv3/` | 実機確認済みPoC |
| `apps/browser-extension/` | Firefox / Chrome共通WXT版（実機未検証） |
| `packages/core/` | 共通処理とテスト |
| `apps/desktop-patcher/` | 将来のElectron版 |
| `docs/` | 解析資料・開発資料・翻訳 |

## ロードマップ

- [x] Feature Flagの特定とUI変化の再現
- [x] Firefox MV3 PoCのA/B/A検証
- [x] 共通ロジックとWXTビルド候補の実装
- [ ] WXT Firefoxの実機検証
- [ ] WXT Chromeの実機検証
- [ ] ブラウザ回帰テストの整備
- [ ] 復元可能なDesktopパッチャーの設計・実装・検証

## コミュニティとライセンス

IssueやPRでの報告・貢献を歓迎します。投稿前に[CONTRIBUTING](../../CONTRIBUTING.md)、[行動規範](../../CODE_OF_CONDUCT.md)、[SECURITY](../../SECURITY.md)をご確認ください。

MITライセンス。[LICENSE](../../LICENSE)参照。**AnthropicおよびClaudeは各権利者の商標です。**

---

<sub>独立した調査プロジェクトです。公式の関係はなく、動作保証はありません。</sub>
