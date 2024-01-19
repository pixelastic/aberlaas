# v1 to v2

Early 2024, I dit a large update of aberlaas dependencies, to align it more with
the current modern JavaScript ecosystem. I had planned those updates for a long
time, but in 2024 it was the right time. Tools were more mature, worked better
together, NodeJS LTS were renewed and **I** needed my toolbelt back.

If your project used `aberlaas` v1, migrating to `aberlaas` v2 means you'll also
have to embrace those new tooling in your repository. Below are the list of
changes, and direction to update your repository.

## Git

### `.gitignore`

This adds additional ignore rules required by Yarn 2.

```
cp -f ./node_modules/aberlaas/templates/_gitignore ./.gitignore
```

### `.gitattributes`

This makes git consider specific big yarn files as binary, and ignore them in
diffs.

```
cp -f ./node_modules/aberlaas/templates/_gitattributes ./.gitattributes
```

### Hooks

Reverts the hooks to default, as we no longer use Husky

```
rm -rf ./.git/hooks
git init
```

Use `./scripts/hooks` instead

```
git config core.hooksPath scripts/hooks
mkdir -p ./scripts/hooks
cp ./node_modules/aberlaas/templates/scripts/hooks/* ./scripts/hooks
```


## Node

The new default node version is 18.18. You might need to change your repository
code accordingly, but this is outside of the scope of this migration.

### `.nvmrc`

```
18.18.0
```

You might also need to run `nvm install`

### `.circleci/config.yml`

```yml
aliases:
  - &defaults
    docker:
      - image: cimg/node:18.18.0
```

## Yarn

### Use Berry

This will add a `packageManager` field to your
`package.json`, and remove any previously committed yarn version.

```
yarn set version 4.0.2
```

### Update configuration file

```
cp ./node_modules/aberlaas/templates/_yarnrc.yml ./.yarnrc.yml
rm ./yarnrc
```

### Update dependencies

```
rm ./yarn.lock
rm -rf ./node_modules
yarn
```

### Scripts

Update the `scripts` section like this:

```
// package.json
TODO

// lib/package.json
TODO
```

## ESLint

### `.eslintignore`

Updated to ignore files in `.yarn`

```
cp -f ./node_modules/aberlaas/templates/_eslintignore.conf ./.eslintignore
```


## Prettier

### `prettier.config.js`

Use ESM version of prettier config

```
rm .prettierrc.js
cp -f ./node_modules/aberlaas/templates/prettier.config.js ./prettier.config.js
```

## Stylelint

### `stylelint.config.js`

Use ESM version of stylelint config

```
rm .stylelintrc.js
cp -f ./node_modules/aberlaas/templates/stylelint.config.js ./stylelint.config.js
```

## Lint-Staged


### `lintstaged.config.js`

Use ESM version of lint-staged config

```
rm .lintstagedrc.js
cp -f ./node_modules/aberlaas/templates/lintstaged.config.js ./lintstaged.config.js
```

## Husky

### `.huskyrc.js'

Remove the file

```
rm ./.huskyrc.js
```

### `pre-commit`

Removes previous husky scripts as we no longer use Husky.

```
rm ./scripts/husky-precommit
```

Also remove the `scripts.husky:precommit` from the `package.json` and
`./lib/package.json`


