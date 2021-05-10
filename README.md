# Aberlaas

Start a new npm package with all the right tooling in place.

This package exposes the `aberlaas` script that can be used to perform the most
common tasks on a package: `lint`, `test` and `release`. It also
exposes the inner configuration of the tools it uses.

## Installing aberlaas

- Run `yarn add --dev aberlaas` to install it
- Run `yarn run aberlaas init` to bootstrap your project with all the scripts
  and configuration
- Commit and push
- Run `yarn run aberlaas setup` to enable the external services (CircleCI and
  Renovate)

`aberlaas init` will add custom scripts (in `./scripts` and in your
`package.json`), scaffold a `./lib` folder and create default config files for
the tools used internally/

`aberlaas setup` will enable CircleCI and Renovate, but requires the repository
to have been pushed to GitHub first. If you have a `CIRCLECI_TOKEN` and
`GITHUB_TOKEN` defined, everything will be automatically enabled for you.
Otherwise, the relevant URLs will be displayed so you can enable them manually.

The following table lists all the scripts added:

| Script                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `yarn run husky:precommit` | Run before any commit (through Husky)                     |
| `yarn run test`            | Run tests using Jest                                      |
| `yarn run test:watch`      | Run tests using Jest in watch mode                        |
| `yarn run ci`              | Run testing and linting in CI                             |
| `yarn run lint`            | Lint all supported file types                             |
| `yarn run lint:fix`        | Attempt to fix linting issues on all supported file types |
| `yarn run release`         | Release the module on npm                                 |

## Linting

`aberlaas lint` will lint all supported files. Each file type can be linted
independently with the corresponding argument (`aberlaas lint --json` will lint
JSON files for example).

You can have Aberlaas trying to autofix linting issues by adding the `--fix`
argument to your command.

The following table show the file types supported and the corresponding command
and linter used.

| Command                             | File type              | Linter used                                     | Fixer used                | Config files                        |
| ----------------------------------- | ---------------------- | ----------------------------------------------- | ------------------------- | ----------------------------------- |
| `aberlaas lint`                     | All supported          | N/A                                             | N/A                       | See individual file type            |
| `aberlaas lint --js`                | JavaScript             | ESLint                                          | Prettier (through ESLint) | `.eslintrc.js` or `--config.js`     |
| `aberlaas lint --css`               | CSS                    | Stylelint                                       | Prettier                  | `.stylelintrc.js` or `--config.css` |
| `aberlaas lint --json`              | JSON                   | jsonlint                                        | Prettier                  |                                     |
| `aberlaas lint --yml` (or `--yaml`) | YAML                   | yaml-lint                                       | Prettier                  |                                     |
| `aberlaas lint --circleci`          | `.circleci/config.yml` | yaml-lint, `circleci` (if available in `$PATH`) | Prettier                  |                                     |

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
`.toBeString()`, `.toStartWith()`, etc. It also includes `jest-expect-message`
to add custom error messages when test fails, as `expect(actual, "Custom error
message").toBe(true)`.

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

[dedent][3] is included in all tests, so you can
write multiline strings without having to break your indentation.

```javascript
describe('moduleName', () => {
  describe('methodName', () => {
    it('should test a multiline string', () => {
      const input = dedent`
        Leading and trailing lines will be trimmed, so you can write something like
        this and have it work as you expect:

          * how convenient it is
          * that I can use an indented list
             - and still have it do the right thing`;
      // …
    });
  });
```

## Precommit hooks

`aberlaas` uses `husky` and `lint-staged` to make sure all committed code
follows your coding standard.

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

`aberlaas release` will release the package to npm. It will update
the version in `package.json` as well as creating the related git tag.

When called without arguments, it will prompt you for the next version to
package. If called with an argument, this will be used as the next version
number (for example, `yarn run release 1.1.3`). You can also use SemVer
increments (for example, `yarn run release minor`).

Use `--dry-run` to start a dry-run. It will simulate a release but won't
actually push anything to GitHub or npm.

## Continuous Integration

`aberlaas ci` is triggered by CI Servers (currently only CircleCI is supported),
and won't do anything when run locally.

When on a CI server it will first display the current node and yarn version, and
then `test` and `lint` scripts in that order. It will fail whenever one of them
fails, or succeed if they all succeed.

The node and yarn version used both locally and on the CI server will be the
same. A `.nvmrc` file is created when running `yarn run aberlaas init` that will
force local users to use the specified version. The same version is also
specified in the Docker image pulled by CircleCI. As for Yarn, a local copy of
the whole yarn program is added to the repository when first initializing it, so
both locals and CI servers will use it.

### Auto-Releasing

As an optional feature, you can have aberlaas automatically release a new
version of your module from the CI environment when relevant.

The CI will then check all the commits since the last release. If any commit is
a `feat()` it will release a new minor version; it any commit is a `fix()` it
will release a new patch version. For major release, you'll have to do it
manually.

This option is not enabled by default. If you need it, you need to follow those
steps:

- Run `aberlaas setup --auto-release`. It will setup the required `ENV` variables
  and ssh keys
- Update your `aberlaas ci` script to `aberlaas ci --auto-release`
- Uncomment the `add_ssh_keys` in your `.circleci.yml` file

## File structure

`./lib/configs` contain the default configuration for all the tools. They are
exported by the package and thus can be `require`d in userland.

`./templates` contains default configurations files copied to userland. Each
extends the configuration exported in the previous files. Copying files to
userland allows user to change the files if they want to change the behavior.

`.eslintrc.js`, `.stylelintrc.js`, `jest.config.js` and `.huskyrc.js` are local
configuration files for `aberlaas` itself. They eat their own dog food by
referencing the same configs as above.

## Related packages

Check [renovate-config-aberlaas][2] for the Renovate bot config used.

## Where does the name Aberlaas come from?

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.

For your convenience, `aberlass` and `aberlas` are added as aliases by default.

[1]: https://github.com/jest-community/jest-extended
[2]: https://github.com/pixelastic/renovate-config-aberlaas
[3]: https://github.com/dmnd/dedent
