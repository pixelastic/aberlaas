# Aberlaas

Start a new npm package with all the right tooling in place.

This package exposes the `aberlaas` script that can be used to perform the most
common tasks on a package: `build`, `lint`, `test` and `release`. It also
exposes the inner configuration of the tools it uses.

## Usage

Use this by calling the `aberlaas` script to perform tasks on your code. We
suggest you add `scripts` aliases in your `package.json` to run them.

```json
"scripts": {
  "build": "aberlaas build",
  "build:watch": "aberlaas build --watch",
  "lint": "aberlaas lint",
  "lint:fix": "aberlaas lint --fix",
  "test": "aberlaas test",
  "test": "aberlaas test --watch",
  "release": "aberlaas release",
}
```

## Linting

Run `aberlaas lint` to lint files through ESLint. It will link all `.js` files
in `./lib` and at the root of the project. You can pass you own list of files to
lint by calling `aberlaas lint ./your/own/files.js`.

We suggest you add a `.eslintrc.js` file in your project with the following
content. It will mirror the Aberlaas configuration locally, allowing you to
extend it if needed, but also signaling to your IDE and other tools that ESLint
is available.

## Building

You can extend the internal Babel config used by creating a `.babelrc.js` file
with the following content:

```javascript
module.exports = {
  "presets": ["aberlaas/babel"]
}
```

## Name

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.
