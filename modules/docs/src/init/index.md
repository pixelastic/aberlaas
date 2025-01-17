---
title: aberlaas init
---

The `aberlaas init` command will bootstrap the current repository to use
`aberlaas` as your default binary for all dev tasks (lint, test, release, etc).

You should only need to run it once, right when you start your project.

What it will do:

- Add custom `yarn run` scripts for the most common tasks, that can be called
  from any subdirectory
- Expose the configuration of the underlying tools through their config files
- Scaffold folders and files in a specific layout

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
root: `eslint.config.js`, `vite.config.js`, etc. The content of those files is
pretty small, it only extends/inherit the default `aberlaas` configuration.

Once again, the goal of those intermediate files is to allow you to
modify them. If you don't like one of the default `aberlaas` linting rules, you
can update `eslint.config.js` and override it. 

## Scaffolding folder in a specific layout

By default, `aberlaas init` will scaffold folders following the `module` layout,
but you can also pass `--libdocs` or `--monorepo` to create a different layout.

All layouts follow the same logic. Config files are stored at the root, and
custom scripts in `./scripts`. Your code should go in `./lib` and your tests in
`./lib/__tests__`.

### The `module` layout

This layout is the default one. It's perfect if your aim is to publish an npm
module quickly and the documentation is short enough to fit in a readme.

```
lib/
    __tests__/
        main.js
    main.js
node_modules/
scripts/
    test
    lint
    [...]
README.md
eslint.config.js
package.json
[...]
```


### The `--libdocs` layout

This is a slightly more advanced layout, for when you need a dedicated
documentation website. This technically turns the repository into a monorepo,
with a `./lib` and `./docs` module (hence the name).


```
lib/
    __tests__/
        main.js
    node_modules/
    scripts/
        test
        lint
        [...]
    main.js
    package.json
docs/
    src/
        index.md
    node_modules/
    scripts/
        test
        lint
        [...]
    package.json
scripts/
    test
    lint
    [...]
README.md
eslint.config.js
package.json
[...]
```

### The `--monorepo` layout

This one is the more advanced layout, for when your project is made of many
different pieces that would require their own module. This very project,
`aberlaas`, uses such a layout, where each command (`test`, `lint`, etc) uses
their own module.

```
modules/
    lib/
        lib/
            __tests__/
                main.js
            main.js
        node_modules/
        scripts/
            test
            lint
            [...]
        package.json
    docs/
        src/
            index.md
        node_modules/
        package.json
scripts/
    test
    lint
    [...]
README.md
eslint.config.js
package.json
[...]
```
