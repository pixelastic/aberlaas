# Aberlaas

Start a new npm package with all the right tooling in place.

This package exposes the `aberlaas` script that can be used to perform the most
common tasks on a package: `build`, `lint`, `test` and `release`. It also
exposes the inner configuration of the tools it uses.

## Installing aberlaas

Run `yarn add --dev aberlaas && yarn run aberlaas init` to bootstrap your
project with Aberlaas scripts and configuration.

This will update your `package.json` to add custom scripts (located in
`./scripts`), and also add default configuration files for all the tool used at
the root of your project.

The following table lists all the scripts added:

| Script                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `yarn run husky:precommit` | Run before any commit (through Husky)                     |
| `yarn run build`           | Build JavaScript files through Babel                      |
| `yarn run build:watch`     | Build JavaScript files through Babel in watch mode        |
| `yarn run test`            | Run tests using Jest                                      |
| `yarn run test:watch`      | Run tests using Jest in watch mode                        |
| `yarn run lint`            | Lint all supported file types                             |
| `yarn run lint:fix`        | Attempt to fix linting issues on all supported file types |
| `yarn run release`         | Release the module on npm                                 |

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
independently with the corresponding argument (`aberlaas lint --json` will lint
JSON files for example).

You can have Aberlaas trying to autofix linting issues by adding the `--fix`
argument to your command.

The following table show the file types supported and the corresponding command
and linter used.

| Command                    | File type              | Linter used                                     | Fixer used                | Config files                        |
| -------------------------- | ---------------------- | ----------------------------------------------- | ------------------------- | ----------------------------------- |
| `aberlaas lint`            | All supported          | N/A                                             | N/A                       | See individual file type            |
| `aberlaas lint --js`       | JavaScript             | ESLint                                          | Prettier (through ESLint) | `.eslintrc.js` or `--config.js`     |
| `aberlaas lint --css`      | CSS                    | Stylelint                                       | Prettier                  | `.stylelintrc.js` or `--config.css` |
| `aberlaas lint --json`     | JSON                   | jsonlint                                        | Prettier                  |                                     |
| `aberlaas lint --yml`      | YAML                   | yaml-lint                                       | Prettier                  |                                     |
| `aberlaas lint --circleci` | `.circleci/config.yml` | yaml-lint, `circleci` (if available in `$PATH`) | Prettier                  |                                     |

## Testing (with Jest)

`aberlaas test` to run all the Jest tests in `./lib`. You can alter the behavior
with the following options:

| CLI Argument | Default value    | Description                                                  |
| ------------ | ---------------- | ------------------------------------------------------------ |
| `[...]`      | `./lib`          | Files and directories to test.                               |
| `--config`   | `jest.config.js` | Jest config file to use                                      |
| `--watch`    | `false`          | If enabled, will listen for changes on files and rerun tests |
| `--failFast` | `false`          | If enabled, will stop as soon as one test fails              |

Note that you can also pass any other command-line flag and they will be passed
directly to Jest under the hood.

Jest is loaded with [jest-extended][1] allowing you to use new matchers like
`.toBeString()`, `.toStartWith()`, etc.

### New global variables

`testName` is available in all tests and contains the name of the current
`it`/`test` block.

`captureOutput` allows to swallow any `stdout`/`stderr` output for later
inspection. Output is stripped of any trailing newlines and ANSI characters.

```javascript
const actual = await captureOutput(async () => {
  console.log('foo');
});
// actual.stdout = ['foo']
```

## Precommit hooks

`aberlaas` uses `husky` and `lint-staged` to make sure all committed code follows
your coding standard.

All `css`, `js`, `json` and `yml` files will be checked for parsing errors
(using `aberlaas lint` internally), and if errors are found it will attempt to
automatically fix them. If errors persist, it will prevent the commit and let
you know which file contains errors so you can fix them before committing again.

Whenever you commit a `.js` file that has a test attached (or a test file
directly), `aberlaas test` will be run on those files. If the tests don't pass,
your commit will be rejected.

Those two measures ensure that you'll never "break the build", by committing
invalid files or code that does not pass the test. If you want to ignore this
behavior, you can always add the `-n` option to your `git commit` command to
skip the hooks.

## Releasing

`aberlaas release` will build the package and release it to npm. It will update
the version in `package.json` as well as creating the related git tag.

When called without arguments, it will prompt you for the next version to
package. If called with an argument, this will be used as the next version
number (for example, `yarn run release 1.1.3`). You can also use SemVer
increments (for example, `yarn run release minor`).

Use `-n` to start a dry-run. It will simulate a release but won't actually push
anything to GitHub or npm.

Note that by default it will also build and test everything before pushing and
stopping if any of those steps fails. You can disable those checks with the
`--no-build` and `--no-test` flags.

## Continuous Integration

`aberlaas ci` is triggered by CI Servers (currently only CircleCI is supported),
and won't do anything when run locally.

When on a CI server it will first display the current node and yarn version, and
then run `build`, `test` and `lint` scripts in that order. It will fail whenever
one of them fails, or succeed if they all succeed.

## File structure

`./lib/configs` contain the default configuration for all the tools. They are
exported by the package and thus can be `import`ed in userland.

`./templates` contains default configurations files copied to userland. Each
extends the configuration exported in the previous files. Copying files to
userland allows user to change the files if they want to change the behavior.

`babel.config.js`, `.eslintrc.js`, `.stylelintrc.js`, `jest.config.js` and
`.huskyrc.js` are local configuration files for `aberlaas` itself. They eat
their own dog food by referencing the same configs as above.

## Related packages

Check [renovate-config-aberlaas][2] for the Renovate bot config used.

## Where does the name Aberlaas come from?

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.

For your convenience, `aberlass` and `aberlas` are added as aliases by default.

[1]: https://github.com/jest-community/jest-extended
[2]: https://github.com/pixelastic/renovate-config-aberlaas
