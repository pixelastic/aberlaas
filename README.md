# Aberlaas

Start a new npm package with all the right tooling in place.

This includes sane config for Babel, ESLint, Jest, Prettier and Husky as well as
command line tool to execute the most common tasks: test, lint, build, release.

## Babel

A default Babel config is available. You can use it by creating a `.babelrc.js`
file with the following content to extend the default configuration:

```javascript
module.exports = {
  "presets": ["aberlaas/babel"]
}
```

## Name

Aberlaas is the base camp from which all great expedition start in the _La Horde
du Contrevent_ book. I felt it's a great name for a bootstrapping kit for
modules.
