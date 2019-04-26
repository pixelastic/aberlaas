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
  "release": "aberlaas release"
}
```

### Building

`aberlaas build` will build all files located in `./lib` into `./build` by
default. You can alter the behavior with the following options:

- `aberlaas build ./path/to/files` to change the default source directory
- `--out-dir ./dist` to change the destination directory
- `--ignore ignore-me.js` to exclude some files
- `--watch` to listen for changes on files and rebuild

You can extend the internal Babel by editing the `babel.config.js` created at
the root of your project.

### Linting

Run `aberlaas lint` to lint your files. You can call
`aberlass lint ./your/own/files` to lint specific files. `aberlaas lint:fix`
will attempt to fix most errors.

All `.js` files will go through ESLint. You can tweak the default configuration
by editing the `.eslintrc.js` file created at the root of your project.

### Testing

Run `aberlaas test` to run all the Jest tests in `./lib`. You can pass your own
list of files to the command to override the default. Use the
`--config jest.config.js` argument to specify your own config file and `--watch`
to start live reloading of test.

### Releasing

`yarn run release` aliased to `aberlaas release`.

This will build the package and release it to npm. It will update the version in
`package.json` as well as creating the related git tag.

When called without arguments, it will prompt you for the next version to
package. If called with an argument, this will be used as the next version
number (for example, `yarn run release 1.1.3`). You can also use SemVer
increments (for example, `yarn run release minor`).

Use `-n` to start a dry-run. It will simulate a release but won't actually push
anything to GitHub or npm.

## File structure

`./lib/configs` contain the default configuration for all the tools. They are
exported by the package and thus can be `import`ed in userland.

`./templates` contains default configurations files copied to userland. Each
extends the configuration exported in the previous files. Copying files to
userland allows user to modify the files if they want to change the behavior.

`.babelrc.js`, `.eslintrc.js`, `jest.config.js` and `.huskyrc.js` are local
configuration files for `aberlaas` itself. They eat their own dog food by
referencing the same configs as above.

## Name

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.
