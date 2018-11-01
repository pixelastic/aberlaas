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

## Building

Run `aberlaas build` to build all files `./lib` into `./build` using Babel. You
can pass your own list of files by calling `aberlaas build ./path/to/files`, and
change the build directory with `--out-dir ./my-build`. You can exclude files
using the `--ignore ignore-me.js` flag.

You can extend the internal Babel config used by creating a `.babelrc.js` file
with the following content:

```javascript
module.exports = {
  "presets": ["aberlaas/babel"]
}
```

## Linting

Run `aberlaas lint` to lint files through ESLint. It will link all `.js` files
in `./lib` and at the root of the project. You can pass you own list of files to
lint by calling `aberlaas lint ./your/own/files.js`. You can attempt to auto fix
issues on your files by adding the `--fix` flag.

We suggest you add a `.eslintrc.js` file in your project with the following
content. It will mirror the aberlaas configuration locally, allowing you to
extend it if needed, but also signaling to your IDE and other tools that ESLint
is available.

```js
module.exports = {
  extends: ['./node_modules/aberlaas/eslint.js'],
};
```

## Testing

Run `aberlaas test` to run all the Jest tests in `./lib`. You can pass your own
list of files to the command to override the default. Use the `--config
jest.config.js` argument to specify your own config file and `--watch` to start
live reloading of test.


## Name

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.
