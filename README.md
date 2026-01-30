# Aberlaas

> My opinionated dev toolbox

## What is Aberlaas?

Aberlaas is my personal dev toolbox that configures my whole dev environment in
a single package. Instead of copying configuration files, managing dependencies,
and maintaining tooling across multiple projects, Aberlaas provides a unified
setup that I can use consistently everywhere.

It adds testing with **Vitest**, linting with
**ESLint**/**Stylelint**/**Prettier**/etc, dependencies with **Yarn**. It
includes pre-commit hooks, release scripts and CI integration.

## Philosophy

> Simple things are easy to do, while complex things are... possible.

All configuration files are exposed at the project root. This gives me sensible
defaults, while allowing me to configure specific rules per projects.

The goal is to eliminate boilerplate while maintaining full flexibility.

Install one package and get a complete development environment ready to go.

## Quick Start

```bash
# Install as a dev dependency
yarn add --dev aberlaas

# Create all necessary configuration files, sets up git hooks, and installs dependencies.
yarn run aberlaas init
# yarn run aberlaas init --libdocs  # To get ./lib and ./docs workspaces
# yarn run aberlaas init --monorepo # To get ./modules/* workspaces

# Optional: Configure external services (GitHub, CircleCI, Renovate)
# You might need:
# - `ABERLAAS_GITHUB_TOKEN` - GitHub token with 'repo' scope
# - `ABERLAAS_CIRCLECI_TOKEN` - CircleCI token
yarn run aberlaas setup

```

**Note:** You'll only run `init` and `setup` once when bootstrapping a new project.

## Core Commands

These are the commands you'll use daily during development. They're available as
`aberlaas <command>` but typically accessed directly through `yarn run <command>`.

### `yarn run test`

Runs your test suite with Vitest.

```bash
# Run all tests
yarn run test

# Run specific test files
yarn run test ./lib/myModule.js

# Watch mode for development
yarn run test --watch

# Stop on first failure
yarn run test --failFast
```

### `yarn run lint`

Lints JavaScript, CSS, JSON, YAML, and CircleCI config files.

```bash
# Lint everything
yarn run lint

# Auto-fix what's fixable
yarn run lint --fix

# Lint specific file types (also supports --css, --json, --yml, --circleci)
yarn run lint --js
```

### `yarn run release`

Publishes your package(s) to npm.

```bash
# Specify version bump explicitly
yarn run release minor

# Auto-detect version bump from conventional commit messages
yarn run release

# Skip tests, linting, and changelog generation
yarn run release --no-test --no-lint --no-changelog
```

## Configuration

All configuration files for the underlying tools are exported at your project
root and can be customized as needed.

```javascript
// eslint.config.js
// vite.config.js
// prettier.config.js
// stylelint.config.js
// lintstaged.config.js
```

Each file imports default configuration from `aberlaas/configs/*`, but you can override any setting:

```javascript
// eslint.config.js - example of extending the config
import config from 'aberlaas/configs/eslint';

export default [
  ...config,
  {
    rules: {
      // Add your custom rules here
      'no-console': 'warn',
    },
  },
];
```

This approach gives you sensible defaults while maintaining full control when you need it.

## Automated Workflows

### `precommit`

A `pre-commit` hook will run before each commit, preventing you from commiting
broken files.

On each commit, it:
- Runs tests on changed files
- Lints staged files
- Compresses images
- Regenerates README files

Note: If the hook fail to trigger, register it again with `git config core.hooksPath scripts/hooks`

The `precommit` command uses two other commands behind the scenes:
- `yarn run aberlaas compress` - Compresses images
- `yarn run aberlaas readme` - Generates README from templates

## CI Integration

### `yarn run ci`

This is the command to run on your CI on each commit. It will run tests and
lint, and stop if they fail.

CircleCI is automatically configured in `.circleci/config.yml`.

```bash
# Runs both test and lint
yarn run ci

# Skip tests or linting if needed
yarn run ci --no-test
yarn run ci --no-lint
```
