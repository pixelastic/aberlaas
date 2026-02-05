import configDocs from './docs.js';
import configJs from './js.js';
import configJson from './json.js';
import configReact from './react.js';
import configScripts from './scripts.js';
import configVitest from './vitest.js';

export default [
  ...configJs,
  ...configVitest,
  ...configReact,
  ...configJson,
  ...configScripts,
  ...configDocs,
];
