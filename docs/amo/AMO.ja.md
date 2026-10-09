# Firefox Add-ons（AMO）公開手順

[English](AMO.md)

このリポジトリにはMozillaの検証CIと、**明示的に承認したときだけ送信する**AMO公開ワークフローを用意しています。通常のpush/PRで勝手にストアへ公開することはありません。

## 初回だけ必要な操作

1. [AMO Developer Hub](https://addons.mozilla.org/developers/)でMozillaアカウントにログイン・登録します。
2. [AMO API認証情報](https://addons.mozilla.org/developers/addon/api/key/)でJWT issuer / JWT secretを発行します。
3. GitHubの **Settings → Secrets and variables → Actions** に `AMO_JWT_ISSUER` と `AMO_JWT_SECRET` をそれぞれ登録します。**認証情報をチャット、Issue、コミット、READMEに貼らないでください。**
4. `amo/metadata.json`、ビルドした拡張機能、`docs/amo/BUILDING.md`を確認します。拡張機能IDは `@claude-split-ui-zawa356` です。以後の更新でも同じIDを使用します。
5. GitHub Actions → **Firefox Add-ons (AMO) verification and submission** → **Run workflow** を選び、まず `main` に対して `DRY_RUN` でテストします。この段階ではMozillaへ送信しません。
6. 掲載申請する段階で、`main` の `SUBMIT` を明示的に実行します。Mozillaの[Developer Hub](https://addons.mozilla.org/developers/)で審査・公開状況を確認してください。

CI成功や申請受け付けは、**Mozillaの掲載承認を意味しません**。審査や追加確認が必要な場合があります。

## CI/CDの範囲

- **CI：** PR・pushごとにFirefox版をビルドし、Mozillaのlint・マニフェスト検査・審査用ソース生成を実施。
- **CD：** `main` ブランチで `SUBMIT` を手動指定したときだけ、GitHub Secretsを使ってAMOへ掲載申請。初回申請が通れば、将来的にリリースタグ連動へ拡張可能。
- **自動更新：** AMO掲載版を利用しているFirefoxユーザーには、Mozilla掲載後の新バージョンが自動配信されます。
- **バージョン：** 2回目以降の申請にはバージョン更新が必要です。GitHubのv0.1.0は以前の未署名ビルドとして維持します。申請の準備は、拡張機能ID・データ収集宣言を整えたv0.1.1で行いました。申請する場合は `apps/browser-extension/package.json` の現在の版を使います。Firefox版の動作はv0.1.1から変わっていません。まだ申請はしていません。GitHub ZIPはMozilla未署名です。

AMOの掲載画像、プライバシー表示、追加の審査情報が必要になる場合があります。
