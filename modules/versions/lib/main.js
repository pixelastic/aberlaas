// Read the most up-to-date aberlaas version from package.json
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export const aberlaasVersion = require('../package.json').version;

export const nodeVersion = '18.18.0';
export const yarnVersion = '4.5.0';
export const norskaVersion = '2.9.0';
export const norskaThemeDocsVersion = '5.0.3';
export const lernaVersion = '4.0.0';

export default {
  aberlaasVersion,
  lernaVersion,
  nodeVersion,
  norskaThemeDocsVersion,
  norskaVersion,
  yarnVersion,
};
