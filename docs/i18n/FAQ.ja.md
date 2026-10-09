# FAQ・トラブルシューティング

[English](../FAQ.md) · [日本語](FAQ.ja.md)

## Coworkや有料機能の権限も有効になりますか？
いいえ。観測されたbootstrapレスポンス内のUI用フラグを変更するだけです。サーバー側の認可・契約・Desktop専用機能には影響しません。

## Anthropic公式の拡張機能ですか？
いいえ。独立した非公式の実験プロジェクトです。

## Chromeには対応していますか？
はい。ChromeのWXT版は「パッケージ化されていない拡張機能を読み込む」方式で、分離表示と無効化後の統合UI復帰を簡易実機検証済みです。ただしChrome Web Storeにはまだ公開していません。

## Claude Desktopに対応していますか？
Windows版は対応しています（Claude 2.31226で簡易実機確認）。`claude-split-ui-<版>-desktop.zip` を [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) ローダー経由で導入し、Claude本体は変更しません。Linux版も同じパッケージですが未確認です。

## トラブルシューティング

### 統合UIのまま変わらない
`about:debugging` で一時アドオンの読み込みを確認し、Claudeを再読み込みしてください。FirefoxのNetwork Overrideが残っていないかも確認してください。Claude側の更新で機能が変わった可能性もあります。

### 拡張機能を読み込めない
[GitHub Releases](https://github.com/zawa356/claude-split-ui/releases)からブラウザ用ZIPを取得し、一度展開してください。Firefoxでは展開先の `manifest.json` を `about:debugging` で選択します。Chromeでは `chrome://extensions/` から、そのmanifestを含むフォルダーを選択します。Firefoxの一時アドオンは再起動後に再読み込みが必要です。

### 元に戻したい
一時アドオンを削除してClaudeを再読み込みしてください。サーバーの設定は変更されません。

### デバッグログを投稿できますか？
合成データまたは十分に匿名化したものだけにしてください。HAR、bootstrapレスポンス原本、認証ヘッダー、Cookie、アカウントUUID、会話内容は投稿禁止です。
