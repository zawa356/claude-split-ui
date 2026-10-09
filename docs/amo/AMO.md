# Firefox Add-ons (AMO) publishing

[日本語](AMO.ja.md)

This project supports GitHub Actions CI for AMO and a **manually gated** listed-channel submission workflow. It never submits a new extension simply because somebody pushed a commit or opened a pull request.

## First-time setup (owner action)

1. Create or sign in to a Mozilla account and open the [AMO Developer Hub](https://addons.mozilla.org/developers/).
2. Create [AMO API credentials](https://addons.mozilla.org/developers/addon/api/key/) (JWT issuer and JWT secret).
3. In GitHub **Settings → Secrets and variables → Actions**, create repository secrets named `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`. **Do not paste API credentials into an issue, chat, README, Git commit, or Actions logs.**
4. Inspect `amo/metadata.json`, the built extension, and `docs/amo/BUILDING.md`. Confirm add-on ID `@claude-split-ui-zawa356` is the ID you want to keep: updates must retain it.
5. Run GitHub Actions → **Firefox Add-ons (AMO) verification and submission** → **Run workflow** on `main`. Use `DRY_RUN` first. The workflow runs build, Mozilla lint and packages source without uploading to AMO.
6. When ready for actual public listing, manually run the workflow on `main` again, entering `SUBMIT`. This calls `web-ext sign --channel listed`; check [AMO Developer Hub](https://addons.mozilla.org/developers/) for approval and listing status.

A successful submission job is **not** proof of Mozilla approval or public listing. It may take time or require manual review. Do not re-submit identical add-on versions repeatedly.

## Automation boundaries

- **CI:** Every PR and push to main/feat branches builds the Firefox extension, checks its manifest, runs Mozilla lint, and saves source/build artifacts.
- **CD:** Only explicit manual `SUBMIT` on `main`, using owner-managed GitHub Actions secrets, sends the listed version to Mozilla. We can automate on future release tags after the first listing works reliably.
- **Distribution:** Listed AMO add-ons receive automatic updates through Firefox after Mozilla publishes newer versions.
- **Versioning:** Increment `manifest.json` and package version before a second submission. The existing GitHub v0.1.0 prerelease is a separate ZIP and is **not** Mozilla-signed.

Mozilla may require screenshots, privacy disclosures, listing text edits, and further reviewer information. Check your account's Developer Hub for outstanding requests.

Official documentation: [Signing](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/), [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/), [source submissions](https://extensionworkshop.com/documentation/publish/source-code-submission/).
