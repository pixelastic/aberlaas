import helper from '../helper';
import firost from 'firost';
import _ from 'lodash';
export default {
  async run(args = {}) {
    const binary = await helper.which('babel');

    // Input files can be passed from the host, or we default to building ./lib
    const userFiles = _.drop(_.get(args, '_', []), 1);
    const defaultFiles = ['./lib'];
    const files = _.isEmpty(userFiles) ? defaultFiles : userFiles;

    // Output dir can be passed from the host, or we default to ./build
    const outDir = _.get(args, 'out-dir', './build');

    const defaultIgnore = ['lib/__tests__', 'lib/test-helper.js'];
    const ignorePatterns = _.flatten(_.concat(defaultIgnore, args.ignore));

    await firost.mkdirp(outDir);

    const options = [...files];
    _.each(ignorePatterns, ignorePattern => {
      options.push('--ignore');
      options.push(ignorePattern);
    });
    options.push('--out-dir');
    options.push(outDir);
    options.push('--verbose');

    // Watch mode
    if (args.watch) {
      options.push('--watch');
      options.push('--source-maps');
      options.push('inline');
    }

    helper.spawn(binary, options);
  },
};
