---
title: aberlaas lint
---

Running `aberlaas lint` will lint all supported files in the repository. 

## Fix

Running `aberlaas lint --fix` (or the `yarn lint:fix` alias) will try to
automatically fix linting issues. If some issues can't be automatically fixed,
they will be displayed.

## Pre-commit

Also note that linting will automatically be applied to all files before each
commit. See the [precommit](/precommit/) section for more details.

## Supported types

Below is a list of all the supported types, with a link to more detailed
documentation:

- [JavaScript](./javascript/)
- [CSS](./css/)
- [JSON](./json/)
- [YAML](./yaml/)
- [CircleCI](./circleci/)
- [Dockerfile](./dockerfile/)


