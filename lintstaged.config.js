import config from './modules/lib/configs/lintstaged.js';

// Note: This is a local override when developing aberlaas itself. We can't call
// yarn run aberlaas, so we need to manually call the ./lib/bin/aberlaas.js file
export default {
  ...config,
  '**/*.md': ['./modules/lib/bin/aberlaas.js readme --add-to-git'],
};
