# プライバシー

[English](../PRIVACY.md) · [日本語](PRIVACY.ja.md)

Firefox・Chrome向けのWXT拡張機能と従来のFirefox PoCは、**利用者のブラウザ内だけ**で動作し、対象サイトは `https://claude.ai/*` に限定されています。同一オリジンの特定のbootstrap `fetch` レスポンスに含まれるUI用Feature Flagの一部を変更します。対象外のリクエスト・レスポンスは原則そのまま処理します。追加のネットワークリクエスト、テレメトリー送信、レスポンス保存、会話内容や認証情報の収集は行いません。

Firefox版は `browser_specific_settings.gecko.data_collection_permissions.required: ["none"]` を宣言しています。Cookie・storage・広範なhost permissionsは要求しません。これは**ソースコードに基づく説明であり、独立したセキュリティ監査ではありません**。MAIN worldはWebページと実行環境を共有し、Claude側の仕様変更に左右されます。

## Claude Desktop用パッケージ

Desktop用パッケージは、同じChrome版を同梱のローダー [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) でClaude Desktopに導入します。拡張機能の動作はブラウザ版と同じです。ローダーは通信もデータ収集もせず、手元のファイルと環境変数1つだけを変更します。

- `%LOCALAPPDATA%\ClaudeDesktopWebExt\`（Linux：`~/.local/share/claude-desktop-webext/`）：拡張機能のファイル、導入記録 `state.json`、バックアップ。
- `%APPDATA%\Claude\extensions\fmkadmapgofadopljbjfkapdkoienihi\`（Linux：`~/.config/Claude/extensions/...`）：Claude Desktopが読み込むフォルダー。ローダーが作ります。
- ユーザー環境変数 `REACT_PROFILE=1`。Linuxでは `~/.config/environment.d/90-claude-desktop-webext.conf` で設定します。ローダーが設定した場合は、ローダーを使うツールがすべて解除されたときに削除します。

HAR、bootstrap APIレスポンス原本、アカウントUUID、セッションCookie、秘密情報、非公開会話をGitHubのIssueやPRに投稿しないでください。脆弱性報告は[SECURITY.md](../../SECURITY.md)を参照してください。
