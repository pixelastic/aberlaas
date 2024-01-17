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

Run `yarn set version 4.0.2`. This will add a `packageManager` field to your
`package.json`, and remove any previously committed yarn version.


## Scripts

### `pre-commit`

Removes previous husky scripts as we no longer use Husky.

```
rm ./scripts/husky-precommit
```
