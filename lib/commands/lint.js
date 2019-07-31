import { pAll, _ } from 'golgoth';
import lintJs from './lint-js';
import lintJson from './lint-json';
import lintCss from './lint-css';

export default {
  /**
   * Wrapper to lint all supported formats
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    const lintCssArgs = {
      ...cliArgs,
      config: _.get(cliArgs, 'config.css'),
    };
    const lintJsArgs = {
      ...cliArgs,
      config: _.get(cliArgs, 'config.js'),
    };
    const lintJsonArgs = cliArgs;
    await pAll([
      async () => await lintCss.run(lintCssArgs),
      async () => await lintJson.run(lintJsonArgs),
      async () => await lintJs.run(lintJsArgs),
    ]);
  },
};
