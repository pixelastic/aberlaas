import { pAll } from 'golgoth';
import lintJs from './lint-js';

export default {
  /**
   * Lint various kind of files
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    pAll([
      async () => await lintJs.run(cliArgs),
      // async () => await lintJson.run(filesByType.json),
    ]);
  },
  // async fix(cliArgs) {
  //   await lintJson.fix(jsonFile);
  //   await lintJs.fix(jsFiles);
  //   await lintMarkdown.fix(markdownFiles);
  //   await lintCss.fix(cssFiles);
  // }
};
