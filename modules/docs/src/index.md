---
title: aberlaas
---

<div class="lead">Scaffold your JavaScript projects with consistent config for tests, lint, release and CI.</div>

`aberlaas` is a wrapper around Jest, ESLint, Prettier, etc and their plugins so
you only install one package in your `devDependencies` instead of dozens. 

I created this module because I got tired of copy-pasting the same configuration
files from project to project. With one _meta_ module to handle all the tooling,
I could get started on a new project in minutes instead of hours.

Using `aberlaas` on every project ensured my linting rules and release process
is consistent across my projects. Of course, if you don't like the defaults
it's shipped with, you can override them as all configuration files are exposed.

## Installation

```shell
yarn add --dev aberlaas

yarn run aberlaas init
```

This will add `aberlaas` to your `devDependencies` and bootstrap your project.
Config files for all the tools will be created (`.eslintrc.js`,
`jest.config.js`, etc) and new `yarn run` scripts will be added for the most
common tasks (`lint`, `test`, `release`, etc).

At that point, you should probably commit all the changes.

### (Optional) Setup the external services

```shell
yarn run aberlaas setup
```

This will configure third party services like GitHub and CircleCI to work better
with `aberlaas`.

---




The following table lists all the scripts added:

| Script                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `yarn run test`            | Run tests using Jest                                      |
| `yarn run test:watch`      | Run tests using Jest in watch mode                        |
| `yarn run ci`              | Run testing and linting in CI                             |
| `yarn run release`         | Release the module on npm                                 |

## Testing (with Vitest)

`aberlaas test` to run all the Vitest tests in `./lib`. You can alter the behavior
with the following options:

| CLI Argument  | Default value      | Description                                                  |
| ------------- | ------------------ | ------------------------------------------------------------ |
| `[...]`       | `./lib`            | Files and directories to test.                               |
| `--config`    | `vite.config.js`   | Vitest config file to use                                    |
| `--watch`     | `false`            | If enabled, will listen for changes on files and rerun tests |
| `--fail-fast` | `false`            | If enabled, will stop as soon as one test fails              |
| `--only-slow` | `false`            | If enabled, will run only tests marked with `.slow()`        |

Note that you can also pass any other command-line flag and they will be passed
directly to Vitest under the hood.

Vitest is loaded with [jest-extended][1] allowing you to use new matchers like
`.toBeString()`, `.toStartWith()`, etc.

### Slow tests

For tests that involve heavy operations (Git, Yarn, filesystem I/O), you can use
`.slow()` to increase the timeout:

```javascript
describe.slow('Git operations', () => {
  it('should commit and push', async () => {
    // This test has a 30 second timeout instead of the default 5 seconds
  });
});

it.slow('should install packages with Yarn', async () => {
  // Individual tests can also use .slow()
});
```

Tests marked with `.slow()` can be filtered with `--only-slow` to run them in
isolation for debugging or optimization.

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

`aberlaas` uses `lint-staged` to make sure all committed code
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

By default, tests running on the CI will be parallelized on two CPUs (this is
what most free CI tier offer). If you have access to higher end machines, you
can update this value by passing the `--cpu-count=X` flag to your `aberlaas ci`
call.

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

`.eslintrc.js`, `.stylelintrc.js` and `jest.config.js` are local
configuration files for `aberlaas` itself. They eat their own dog food by
referencing the same configs as above.

## Where does the name Aberlaas come from?

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.

For your convenience, `aberlass` and `aberlas` are added as aliases by default.

[1]: https://github.com/jest-community/jest-extended
[3]: https://github.com/dmnd/dedent
