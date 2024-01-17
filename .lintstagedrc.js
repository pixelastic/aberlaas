// import config from './lib/configs/lintstaged.js';
// console.info('root');
// console.info(config);
// export default config;

// lint-staged.config.js
export default (allStagedFiles) => {
  console.info(allStagedFiles);
  return ['eslint'];
};
