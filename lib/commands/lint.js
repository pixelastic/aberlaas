// import lintJs from './lint-js';
import helper from '../helper';
import { _ } from 'golgoth';
import path from 'path';
import firost from 'firost';

export default {
  async expandPatterns(inputFiles) {
    // Making all path relative to the host
    const globs = _.map(inputFiles, inputFile => {
      return helper.hostPath(inputFile);
    });

    // Exclude folders that shouldn't be included
    const blockedFolders = ['.git', 'node_modules', 'tmp', 'build', 'fixtures'];
    _.each(blockedFolders, blockedFolder => {
      globs.push(`!${helper.hostPath()}/**/${blockedFolder}/**`);
    });

    // Expanding globs
    let allFiles = await firost.glob(globs);

    // Exclude files we can't lint
    const safeFiletypes = ['.js', '.json'];
    allFiles = _.filter(allFiles, filepath => {
      return _.includes(safeFiletypes, path.extname(filepath));
    });

    return allFiles;
  },
  // /**
  //  * Get list of JavaScript files to lint.
  //  * Default is to read from ./lib, but if files are passed as CLI arguments,
  //  * they will take precedence.
  //  * @param {object} cliArgs CLI Argument object, as created by minimist
  //  * @returns {Array} List of files to lint
  //  **/
  // async inputFiles(cliArgs = {}) {
  //   // Reading from CLI or linting default files
  //   let inputFiles = helper.inputFromCli(cliArgs, [
  //     './lib/**/*.js',
  //     './*.js',
  //     './.*.js',
  //   ]);

  //   // Excluding all non-js files
  //   const onlyJsFiles = _.filter(allFiles, filepath => {
  //     return path.extname(filepath) === '.js';
  //   });

  //   return onlyJsFiles;
  // },
  defaultFiles() {
    return [
      // JavaScript
      './lib/**/*.js',
      './*.js',
      './.*.js',
      // JSON
    ];

    //
    //./lib/**/*.js
    //./lib/**/*.json
    //./*.js
    //./*.json
    //./.*.js
    //./.*.json
    //
  },
  /**
   * Lint various kind of files
   * @param {object} cliArgs CLI Argument object, as created by minimist
   **/
  async run(cliArgs) {
    const inputPatterns = helper.inputFromCli(cliArgs, '.');
    const inputFiles = await this.expandPatterns(inputPatterns);
    console.info(inputFiles);
    const filesByType = _.groupBy(inputFiles, path.extname);
    console.info(filesByType);
    // await lintJson.run(jsonFile);
    // await lintJs.run(jsFiles);
    // await lintMarkdown.run(markdownFiles);
    // await lintCss.run(cssFiles);
  },
  // async fix(cliArgs) {
  //   await lintJson.fix(jsonFile);
  //   await lintJs.fix(jsFiles);
  //   await lintMarkdown.fix(markdownFiles);
  //   await lintCss.fix(cssFiles);
  // }
};
