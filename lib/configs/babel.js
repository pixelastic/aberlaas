
module.exports = () => {
  return {
    presets: [['@babel/preset-env', { targets: { node: 12 } }]],
    plugins: ['@babel/plugin-proposal-object-rest-spread'],
  };
};