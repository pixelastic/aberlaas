---
title: Lint Markdown
---

Markdown linting is done by [ESLint][1] with the [@eslint/markdown][2] plugin.
Fixing is done by [Prettier][3], which also wraps prose at 80 characters.

Front matter is parsed as YAML. A post with a `title` in its front matter must
not also start with a `# Heading`, as both would count as a top-level heading.

## Configuration

Rules are defined in the default [markdown.js][4] ESLint configuration. You can
override them in your local `eslint.config.js` file.

Prose wrapping is defined in the `*.md` override of the default [prettier.js][5]
configuration. Code blocks are left untouched by Prettier.

Files in a `docs/` directory are never linted.

[1]: https://eslint.org/
[2]: https://github.com/eslint/markdown
[3]: https://prettier.io/
[4]: https://github.com/pixelastic/aberlaas/blob/main/modules/lint/configs/eslint/markdown.js
[5]: https://github.com/pixelastic/aberlaas/blob/main/modules/lint/configs/prettier.js
