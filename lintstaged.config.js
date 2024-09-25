import config from './lib/configs/lintstaged.js';

// Note: This is a local override when developing aberlaas itself. We can't call
// yarn run aberlaas, so we need to manually call the ./lib/bin/aberlaas.js file
const readmeCommands = [
  './lib/bin/aberlaas.js readme',
  'git add ./README.md ./lib/README.md',
];

export default {
  ...config,
  'docs/src/**/*.md': readmeCommands,
  '.github/README.template.md': readmeCommands,
};
