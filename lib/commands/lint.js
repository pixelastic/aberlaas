import { pAll } from 'golgoth';
import lintJs from './lint-js';
import lintJson from './lint-json';

export default {
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    pAll([
      async () => await lintJs.run(cliArgs),
      async () => await lintJson.run(cliArgs),
    ]);
  },
};
