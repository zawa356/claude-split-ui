# Privacy

[English](PRIVACY.md) · [日本語](i18n/PRIVACY.ja.md)

The original Firefox PoC does not add network requests, store data, or send telemetry. It intercepts a narrow, same-origin bootstrap fetch **inside your own browser**, modifies only two fields in a matching feature definition, and passes unrelated traffic through. It does not require additional extension permissions.

This is a source-code description, **not** an independent security audit. MAIN-world scripts share a page execution context, and the upstream application may change. Review the code and use at your own risk.

We do not ask users to submit HAR archives, raw API responses, credentials, cookies, account identifiers or conversation contents. Do not attach such information to GitHub issues or pull requests.

For security disclosures, consult [SECURITY.md](../SECURITY.md).
