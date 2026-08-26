import path from 'node:path';
import { _, pMap } from 'golgoth';
import { run } from 'firost';
import { getAllPublicPackages } from './helpers/yarn.js';

export let __;

/**
 * Publishes packages via OIDC-based trusted publishing (no OTP needed)
 * Called from CI when --trusted-publish flag is set
 * @param {string} packagesString - Comma-separated list of package names
 * @returns {Promise<void>}
 */
export async function trustedPublish(packagesString) {
  const packageNames = packagesString.split(',');
  const allPackages = await __.getAllPublicPackages();
  const packages = _.filter(allPackages, (pkg) =>
    _.includes(packageNames, pkg.content.name),
  );

  const oidcToken = await __.getOidcToken();

  await pMap(packages, async (packageData) => {
    await __.pushToRegistry(packageData, { env: { NPM_ID_TOKEN: oidcToken } });
  });
}

__ = {
  /**
   * Fetches an OIDC token from CircleCI for npm trusted publishing
   * @returns {Promise<string>} The OIDC token
   */
  async getOidcToken() {
    const { stdout } = await __.run(
      'circleci run oidc get --claims \'{"aud": "npm:registry.npmjs.org"}\'',
      { stdout: false },
    );
    return stdout;
  },
  /**
   * Runs `yarn npm publish --access public` for a single package
   * @param {object} packageData - Package object with filepath and content
   * @param {string} packageData.filepath - Path to the package.json file
   * @param {object} options - Options for the publish command
   * @param {object} options.env - Environment variables to pass to the child process
   * @returns {Promise<void>}
   */
  async pushToRegistry(packageData, options = {}) {
    const { filepath } = packageData;
    const { env = {} } = options;
    // Note:
    // ✘ npm publish <= Keeps workspace:* in dependencies
    // ✔ yarn npm publish <= Replaces workspace:* with actual versions
    // This is why we use yarn npm publish and not npm publish directly
    await __.run('yarn npm publish --access public', {
      cwd: path.dirname(filepath),
      env: { ...process.env, ...env },
      stdout: false,
      stderr: false,
    });
  },
  getAllPublicPackages,
  run,
};
