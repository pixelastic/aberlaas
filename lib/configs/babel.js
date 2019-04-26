/* eslint-disable import/no-commonjs */
module.exports = api => {
  // Note: Recently, babel has been giving me warning about cache not being
  // configured. I enabled caching here, but I'm unsure if this is the best way
  // to do. From what I understand, caching is only in-memory caching, so
  // everytime the build process is started, no caching occurs. This seems to
  // only be relevant for watch mode. As config does not need to change between
  // watched build, I assume it's safe to set caching to true.
  api.cache(true);
  return {
    presets: [['@babel/preset-env', { targets: { node: 6 } }]],
    plugins: ['@babel/plugin-proposal-object-rest-spread'],
  };
};
