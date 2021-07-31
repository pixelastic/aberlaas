---
title: aberlaas init
---

The `aberlaas init` command will bootstrap the current repository to use
`aberlaas`. It should only be run once.

This will do three main things:

- Add custom `yarn run` scripts for the most common tasks
- Expose the configuration of the underlying tools through their config files
- Scaffold a `./lib` folder to hold your code

_Note that it is better to run this command on a fresh repository rather that one
that already has some of the tools configured because it could create
conflicting configurations._

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

