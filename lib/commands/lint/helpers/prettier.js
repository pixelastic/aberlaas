import helper from '../../../helper.js';
import run from 'firost/run.js';
import firostError from 'firost/error.js';

/**
 * Fix all files using prettier
 * Note: Will be called by child classes
 * Note: Prettier does not output any information as to why it failed, so
 * we'll manually run the command on each file individually so we can catch
 * the file that errors and display it
 * @param {Array} inputFiles Files to auto-fix
 **/
export async function fix(inputFiles) {
  const binary = await helper.which('prettier');
  const options = ['--write', ...inputFiles];
  try {
    const command = `${binary} ${options.join(' ')}`;
    await run(command, { stdout: false });
  } catch (err) {
    throw firostError(
      'LINT_ERROR_FIX_PRETTIER',
      'Some files could not be automatically fixed.\nPlease run `yarn run lint` to further debug',
    );
  }
}

export default {
  fix,
};
