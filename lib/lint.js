import helper from './helper';
import _ from 'lodash';
export default {
  async run(args) {
    const eslintBinary = await helper.which('eslint');
    const userFiles = _.drop(args._, 1);
    const defaultFiles = ['./lib/**/*.js', './*.js'];
    const eslintFiles = _.isEmpty(userFiles) ? defaultFiles : userFiles;

    helper.spawn(eslintBinary, eslintFiles);
  },
};
