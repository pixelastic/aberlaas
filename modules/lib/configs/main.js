// Raw dependencies
import eslint from './eslint.js';
import lintstaged from './lintstaged.js';
import node from './node.js';
import prettier from './prettier.js';
import stylelint from './stylelint.js';
import vite from './vite.js';

// Named exports (preferred way)
// Usage: import { eslint, vite } from 'aberlaas-config';
export { eslint as eslint };
export { lintstaged as lintstaged };
export { node as node };
export { prettier as prettier };
export { stylelint as stylelint };
export { vite as vite };

// Default export (god object)
// Usage: import allConfigs from 'aberlaas-config';
export default {
  eslint,
  lintstaged,
  node,
  prettier,
  stylelint,
  vite,
};
