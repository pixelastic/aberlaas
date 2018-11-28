# Aberlaas

Start a new npm package with all the right tooling in place.

This package exposes the `aberlaas` script that can be used to perform the most
common tasks on a package: `build`, `lint`, `test` and `release`. It also
exposes the inner configuration of the tools it uses.

## Usage

Use this by calling the `aberlaas` script to perform tasks on your code. The
following `scripts` are automatically added to your `package.json`.

```json
"scripts": {
  "build": "aberlaas build",
  "build:watch": "aberlaas build --watch",
  "lint": "aberlaas lint",
  "lint:fix": "aberlaas lint --fix",
  "test": "aberlaas test",
  "test:watch": "aberlaas test --watch",
  "release": "aberlaas release",
}
```

### Building

Run `aberlaas build` to build all files `./lib` into `./build` using Babel. You
can pass your own list of files by calling `aberlaas build ./path/to/files`, and
change the build directory with `--out-dir ./my-build`. You can exclude files
using the `--ignore ignore-me.js` flag.

You can extend the internal Babel by editing the `.babelrc.js` created at the
root of your project.

### Linting

Run `aberlaas lint` to lint your files. You can call `aberlass lint
./your/own/files` to lint specific files. `aberlaas lint:fix` will attempt
to fix most errors.

All `.js` files will go through ESLint. You can tweak the default configuration
by editing the `.eslintrc.js` file created at the root of your project.

### Testing

Run `aberlaas test` to run all the Jest tests in `./lib`. You can pass your own
list of files to the command to override the default. Use the `--config
jest.config.js` argument to specify your own config file and `--watch` to start
live reloading of test.

### Release

Run `aberlaas release` to build the package and release it to npm. It will ask
your for the new version and will create the needed git tag.

## Name

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.
