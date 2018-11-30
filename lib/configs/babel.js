/* eslint-disable import/no-commonjs */
// Note: We use babel.config.js and not .babelrc.js.
// Babel will look for .babelrc.js files at the same level as the package.json
// file but will look up the tree until it finds a babel.config.js.
// In a regular setup, both will do the same, but when building a monorepo, with
// package.json in subfolders, babel.config.js allows us to have one master
// config for all projects.
module.exports = () => ({
  presets: [['@babel/preset-env', { targets: { node: 6 } }]],
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
});
