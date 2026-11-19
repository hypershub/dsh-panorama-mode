# npm trusted publishing / npm 可信发布

Workflow: `.github/workflows/publish.yml`. Uses GitHub Actions OIDC with `id-token: write`; no npm token secret is required. Published packages include provenance.

## One-time npm configuration

On the npm package access/settings page, create a trusted publisher with these exact fields:

| Field | Value |
| --- | --- |
| Publisher | GitHub Actions |
| Organization or user | `hypershub` |
| Repository | `dsh-panorama-mode` |
| Workflow filename | `publish.yml` |
| Environment name | Empty (the workflow does not declare an environment) |
| Allow npm publish | Enabled, for this direct-publish workflow |

Save the connection on npm. Adding the workflow to GitHub does not automatically create the npm connection. If you require an npm publishing environment, add that exact environment to the workflow and configure the GitHub environment protection rules before use.

npm 页面需要保存可信发布连接。仅向 GitHub 提交工作流不会自动完成 npm 授权。本流程直接使用 `npm publish`；必须允许该操作。如需强制 staged publishing，请另行改成对应流程，不能混用。

## Release

1. Update package.json and package-lock.json version together, add changelog notes, build and test.
2. Commit and push to main.
3. Either create/push a tag matching the package version (e.g. `v0.1.1`), or manually run **Publish to npm** on main with exact input `0.1.1`.
4. Verify the Action result and npm version, integrity and attestations. A submitted Action is not publication success.

Stable semver only; package name/version mismatch fails before publication. Ordinary main pushes do not publish. Forks and manual runs on non-main branches are excluded. Checkout credentials are not retained; external Actions are pinned by commit. npm 11.6.2 is installed explicitly for OIDC support.

## Failure handling

- EOTP or authentication errors: confirm the npm trusted-publisher connection, exact repo/workflow identity and supported runner/npm version. Do not introduce a token/OTP secret to bypass the missing connection.
- Existing version: inspect npm metadata. Never overwrite or unpublish an immutable release merely to rerun a job.
- Ambiguous network failure after publish: inspect the exact version read-only before retrying; it may already have been published.
- Verification step failure: publication may have succeeded. Use the manual `verify_only: true` input to rerun checks without publishing. Registry visibility checks retry read-only for up to 5 minutes; do not replay publish while npm is processing.

## First trusted release

`0.1.1` was submitted through [Action 44481713669](https://github.com/hypershub/dsh-panorama-mode/actions/runs/44481713669). Its immediate verification initially failed while npm processed the package; a later registry read confirmed version `0.1.1`, tarball SHA-1 `5ab5e3459220f0d3211887fb40a090cccc8590e4`, and SLSA provenance attestations. The verification-only path reconciles this without publishing a duplicate.

`0.1.0` was already found on npm with source gitHead `d3514eb0abdac7af86f151dc866813bc70404c66`; it must not be published again. `0.1.1` introduces this workflow and publishing documentation.
