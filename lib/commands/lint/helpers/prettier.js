import * as prettier from 'prettier';
import helper from '../../../helper.js';
import firostError from 'firost/error.js';
import write from 'firost/write.js';
import read from 'firost/read.js';
import pMap from 'golgoth/pMap.js';
import _ from 'golgoth/lodash.js';

/**
 * Fix all files using prettier
 * @param {Array} inputFiles Files to auto-fix
 **/
export async function fix(inputFiles) {
  // Config file
  const configFile = await helper.configFile(
    null,
    '.prettierrc.cjs',
    'lib/configs/prettier.cjs',
  );
  const config = await prettier.resolveConfig(configFile);

  const errors = [];

  // Read all files, run them through the formatter and save them back to disk
  // If any emits error, store the errors and display them all in one output
  await pMap(
    inputFiles,
    async (filepath) => {
      try {
        const content = await read(filepath);
        const options = { ...config, filepath };
        const result = await prettier.format(content, options);
        await write(result, filepath);
      } catch (error) {
        const message = error.toString();
        errors.push({ filepath, message });
      }
    },
    { concurrency: 10 },
  );

  if (!_.isEmpty(errors)) {
    let formattedErrors = '';
    _.each(errors, (error) => {
      formattedErrors = `${formattedErrors}${error.filepath}\n\n${error.message}\n\n`;
    });

    throw firostError(
      'LINT_ERROR_FIX_PRETTIER',
      `Some files could not be automatically fixed:\n\n${formattedErrors}`,
    );
  }
}

export default {
  fix,
};
