import helper from '../helper';
import _ from 'lodash';
export default {
  async run(args) {
    const binary = await helper.which('eslint');

    // Host can specify the files to lint, otherwise we lint ./lib and the root
    const userFiles = _.drop(args._, 1);
    const defaultFiles = ['./lib/**/*.js', './*.js'];
    const files = _.isEmpty(userFiles) ? defaultFiles : userFiles;

    const options = _.concat(['--color'], files);

    // Fixing errors if possible
    if (args.fix) {
      options.push('--fix');
    }

    await helper.spawn(binary, options);
  },
};
