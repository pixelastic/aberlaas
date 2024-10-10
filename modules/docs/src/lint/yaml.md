---
title: Lint YAML
---

YAML linting is by [yaml-lint][1]. Fixing is done by [Prettier][2].

## Configuration

There is not much configuration available, but if you'd like you could probably
update the local `.prettierrc.js` file to add yaml-specific rules.

Check the default [prettier.js][3] configuration for inspiration.

## CircleCI

If you have the [official CircleCI command-line tool][4] available in your
`$PATH`, your CircleCI config (located in `.circleci/config.yml`) will also be
linted through it.

[2]: https://prettier.io/
[3]: https://github.com/pixelastic/aberlaas/blob/master/lib/configs/prettier.js
[1]: https://classic.yarnpkg.com/en/package/yaml-lint
[4]: https://github.com/CircleCI-Public/circleci-cli
