import helper from '../../../helper.js';
import run from 'firost/run.js';
import * as prettier from 'prettier';
import firostError from 'firost/error.js';
import read from 'firost/read.js';
// import pMap from 'golgoth/pMap.js';

/**
 * Fix all files using prettier
 * Note: Will be called by child classes
 * @param {Array} inputFiles Files to auto-fix
 **/
export async function fix(inputFiles) {

  await pMap(inputFiles, async (filepath) => {
    const content = await read(filepath);
    const result = await prettier.format(content, { filepath  });
    console.info(result);
  }, { concurrency: 10 });
// // -> 'foo()\n'

//   console.info({ binary });
//   const options = ['--write', ...inputFiles];
//   try {
//     const command = `yarn run prettier ${options.join(' ')}`;
//     console.info(command);
//     await run(command, { stdout: true });
//   } catch (err) {
//     throw firostError(
//       'LINT_ERROR_FIX_PRETTIER',
//       'Some files could not be automatically fixed.\nPlease run `yarn run lint` to further debug',
//     );
//   }
}

export default {
  fix,
};
