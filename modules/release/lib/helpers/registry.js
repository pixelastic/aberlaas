import path from 'node:path';
import { _ } from 'golgoth';
import { run } from 'firost';

export let __;

/**
 * Runs `yarn npm publish --access public` for a single package
 * @param {object} packageData - Package object with filepath and content
 * @param {string} packageData.filepath - Path to the package.json file
 * @param {object} [options] - Publish options
 * @param {string} [options.otp] - One-time password for npm authentication
 * @param {object} [options.env] - Environment variables to pass to the child process
 * @returns {Promise<void>}
 */
export async function pushToRegistry(packageData, options = {}) {
  const { filepath } = packageData;
  const { env, ...flags } = options;

  // { otp: '123456' } → 'yarn npm publish --access public --otp 123456'
  const command = _.chain(flags)
    .map((value, key) => `--${key} ${value}`)
    .thru((parts) => ['yarn npm publish --access public', ...parts])
    .join(' ')
    .value();

  // Note:
  // ✘ npm publish <= Keeps workspace:* in dependencies
  // ✔ yarn npm publish <= Replaces workspace:* with actual versions
  // This is why we use yarn npm publish and not npm publish directly
  await __.run(command, {
    cwd: path.dirname(filepath),
    ...(env && { env: { ...process.env, ...env } }),
    stdout: false,
    stderr: false,
  });
}

__ = {
  run,
};
