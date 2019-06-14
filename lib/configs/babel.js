/* eslint-disable import/no-commonjs */
module.exports = () => {
  return {
    presets: [['@babel/preset-env', { targets: { node: 10 } }]],
    plugins: ['@babel/plugin-proposal-object-rest-spread'],
  };
};
