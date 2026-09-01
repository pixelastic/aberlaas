import { _, pMap } from 'golgoth';
import { run } from 'firost';
import { pushToRegistry } from './helpers/registry.js';
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
      [
        'circleci',
        'run',
        'oidc',
        'get',
        '--claims',
        '{"aud": "npm:registry.npmjs.org"}',
      ],
      { stdout: false },
    );
    return stdout;
  },
  getAllPublicPackages,
  pushToRegistry,
  run,
};
