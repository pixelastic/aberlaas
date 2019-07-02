# Aberlaas

Start a new npm package with all the right tooling in place.

This package exposes the `aberlaas` script that can be used to perform the most
common tasks on a package: `build`, `lint`, `test` and `release`. It also
exposes the inner configuration of the tools it uses.

## Installing aberlaas

Run `aberlaas install` to bootstrap your project with Aberlaas scripts and
configuration.

This will update your `package.json` to add custom scripts (located in
`./scripts`), and also add default configuration files for all the tool used at
the root of your project.

The following table lists all the scripts added:

| Script                   | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `yarn run build`         | Build JavaScript files through Babel                      |
| `yarn run build:watch`   | Build JavaScript files through Babel in watch mode        |
| `yarn run test`          | Run tests using Jest                                      |
| `yarn run test:watch`    | Run tests using Jest in watch mode                        |
| `yarn run lint`          | Lint all supported file types                             |
| `yarn run lint:fix`      | Attempt to fix linting issues on all supported file types |
| `yarn run lint:js`       | Lint JavaScript files                                     |
| `yarn run lint:js:fix`   | Attempt to fix linting issues on JavaScript files         |
| `yarn run lint:json`     | Lint JavaScript files                                     |
| `yarn run lint:json:fix` | Attempt to fix linting issues on JavaScript files         |
| `yarn run release`       | Release the module on npm                                 |

## Building (with Babel)

`aberlaas build` will build all files located in `./lib` into `./build` by
default. You can alter the behavior with the following options:

| CLI Argument         | Default value       | Description                                                                         |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| `[...]`              | `./lib`             | Files or directory to build                                                         |
| `--config`           | `./babel.config.js` | Babel config file to use                                                            |
| `--out-dir`          | `./build`           | Build directory                                                                     |
| `--ignore {pattern}` | empty               | Define patterns of files to ignore. Accepts globs, and can be passed more than once |
| `--watch`            | `false`             | If enabled, will listen for changes on files and rebuild                            |

You can extend the internal Babel by editing the `babel.config.js` created at
the root of your project.

## Linting

`aberlaas lint` will lint all supported files. Each file type can be linted
independently with the corresponding command (`aberlaas lint:json` will lint
JSON files for example).

You can have Aberlaas trying to autofix linting issues by adding the `--fix`
argument to your command.

The following table show the file types supported and the corresponding command
and linter used.

| Command              | File type     | Linter used | Fixer used                | Config files   |
| -------------------- | ------------- | ----------- | ------------------------- | -------------- |
| `aberlaas lint`      | All supported | N/A         | N/A                       | N/A            |
| `aberlaas lint:js`   | JavaScript    | ESLint      | Prettier (through ESLint) | `.eslintrc.js` |
| `aberlaas lint:json` | JSON          | jsonlint    | Prettier                  |                |

## Testing (with Jest)

`aberlaas test` to run all the Jest tests in `./lib`. You can alter the behavior
with the following options:

| CLI Argument | Default value    | Description                                                  |
| ------------ | ---------------- | ------------------------------------------------------------ |
| `[...]`      | `./lib`          | Files and directories to test                                |
| `--config`   | `jest.config.js` | Jest config file to use                                      |
| `--watch`    | `false`          | If enabled, will listen for changes on files and rerun tests |

## Releasing

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
userland allows user to change the files if they want to change the behavior.

`babel.config.js`, `.eslintrc.js`, `jest.config.js` and `.huskyrc.js` are local
configuration files for `aberlaas` itself. They eat their own dog food by
referencing the same configs as above.

## Name

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.
