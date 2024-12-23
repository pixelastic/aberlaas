---
title: aberlaas init
---

The `aberlaas init` command will bootstrap the current repository to use
`aberlaas` as your default binary for all dev tasks (lint, test, release, etc).

You should only need to run it twice, right when you start your project.

What it will do:

- Add custom `yarn run` scripts for the most common tasks, that can be called
  from any subdirectory
- Expose the configuration of the underlying tools through their config files
- Scaffold a `./lib` folder to hold your code

## Custom scripts

The main `package.json` will be updated to add entries to the `scripts` key. All
those new entries will point to script files with the same name in the
`./scripts/` folder, which in turn will call `aberlaas`.

For example, calling `yarn run test` will trigger the following sequence:

- Finding the `scripts.test` key in `package.json`
- Running the `./scripts/test` script
- Calling `aberlaas test`

You might wonder what the point of the intermediate script is, and why aren't we
directly setting `scripts.test` to `aberlaas test`? Well, `aberlaas` tries to
hide as little "magic" as possible, and always allow you to tap into the
flow. 

Those intermediate scripts **are meant to be** updated to better fit your
needs (for example if you need to run more scripts, or do some additional
checks).

## Expose the configuration

Configuration files for all the underlying tools are created at the repository
root: `.eslintrc.js`, `jest.config.js`, etc. The content of those files is
pretty small, it only extends/inherit the default `aberlaas` configuration.

Once again, the goal of those intermediate files is to allow you to
modify them. If you don't like one of the default `aberlaas` linting rules, you
can update `.eslintrc.js` and override it. 

## Scaffolding a `./lib` folder

A `./lib` folder will be created with a single file, as well as a `__tests__`
directory. This directory contains only one test (that always succeeds).

The goal of this scaffold is to create the files you will most probably need in
your module, as well as already having a test system in place.

Note that the root `package.json` has been updated accordingly and will release
all files located in `./lib`.

## Monorepo setup

You can call `aberlaas init --monorepo` to initialize a slightly more complex
repository layout. This layout will create a monorepo, with distinct `./lib` and
`./docs` workspaces.

The main differences are:

- The root of the project will be used as the monorepo root.
- Actual library files will be stored in `./lib` and documentation in `./docs`
- Both `./lib` and `./docs` will be treated as workspaces, so can have their own
  dependencies
- The root will only contain dev tooling (`aberlaas` and `lerna` mostly).

This setup is interesting if you plan on developing a module you plan on
releasing. It already gives you the scaffolding to write and push the
documentation along with the code.

If you don't plan to build a module, or want to keep it private, you might not
need the `--monorepo` flag.

// TODO:
- I will need to change this option into a `--layout` option.
- Default will be `module`: Only a simple layout for a single module
- Other options would be `monorepo`: Something like what I have for `aberlaas`
  and `norska`. A main core, that depends on various modules; helpful to keep
  dependencies scoped to a specific submodule.
- A third option that's an hybrid. Still need to find the right name. Something
  that is technically a monorepo, but contains only `./lib` and `./docs`.

