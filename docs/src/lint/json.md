---
title: Lint JSON
---

JSON linting is done by trying to parse the file with `JSON.parse`. Fixing is
done by [Prettier][1].

## Configuration

There is not much configuration available, but if you'd like you could probably
update the local `.prettierrc.js` file to add json-specific rules.

Check the default [prettier.js][2] configuration for inspiration.

[1]: https://prettier.io/
[2]: https://github.com/pixelastic/aberlaas/blob/master/lib/configs/prettier.js
