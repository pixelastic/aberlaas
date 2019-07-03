import { pAll } from 'golgoth';
import lintJs from './lint-js';
import lintJson from './lint-json';
import lintCss from './lint-css';

export default {
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    await pAll([
      async () => await lintCss.run(cliArgs),
      async () => await lintJson.run(cliArgs),
      async () => await lintJs.run(cliArgs),
    ]);
  },
};
