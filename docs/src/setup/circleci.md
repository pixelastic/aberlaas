---
title: CircleCI
---

The `aberlaas setup` command will automatically **follow** your repository on
CircleCI. This means that each git push on the `master` branch will trigger
a run of `aberlaas ci`.

See the [aberlaas ci](/ci/) command for more details.

You will need a `CIRCLECI_TOKEN` environment variable for this command to
correctly follow your repository. If no such token is available, the URL to
manually follow the project will be displayed.

To go further with CircleCI, you can check
[on-circle](https://projects.pixelastic.com/on-circle/). It provides
a commandline interface for adding environment variables and following projects,
as well as running arbitrary code in a sandbox.

## Auto-release

When `aberlaas setup` is called with the `--auto-release` flag, it configures
CircleCI so your jobs can now automatically deploy a new version of your module.

You will need a `NPM_TOKEN` token in addition to the `CIRCLECI_TOKEN` for this
flag to work. The token will be saved as an environment variable on your
CircleCI project, allowing it to release your module on your behalf.

See the [aberlaas ci autorelease](/ci/autorelease) feature for more details.
