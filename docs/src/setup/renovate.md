---
title: Renovate
---

The `aberlaas setup` will enable [Renovate][1] on your GitHub repository.
Renovate will automatically update your dependencies when a new version is
released, or submit a Pull Request to do so.

You will need a `GITHUB_TOKEN` environment variable for this command to work. If
no such token is available, the URL to the Renovate settings page will be
displayed, so you can enable it manually.

## Configuration

The default configuration uses the `config:js-lib` official preset, as well as
the custom [aberlaas][2] preset.

- Whenever a new version of one of your dependencies is released, Renovate will
  automatically update your `package.json` and `yarn.lock` accordingly.
- If the update is a SemVer major, it will create a Pull Request instead, for
  you to approve.
- If the tests fails because of this update, it will create a Pull Request
  as well.

You can update your Renovate configuration by updating the
`.github/renovate.json` file.

[1]: https://github.com/renovatebot/renovate
[2]: https://github.com/pixelastic/renovate-config-aberlaas
