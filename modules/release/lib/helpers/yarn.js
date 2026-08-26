import { _, pMap } from 'golgoth';
import { glob, readJson, run } from 'firost';
import { hostGitPath } from 'aberlaas-helper';

export let __;

/**
 * Ensure the user is logged in to npm via yarn npm login
 * Checks whoami, runs interactive login if needed, then re-checks
 * @returns {Promise<void>}
 */
export async function ensureYarnNpmLogin() {
  if (await __.isAuthenticated()) {
    return;
  }

  await __.run('yarn npm login', { stdin: true });
  await __.ensureYarnNpmLogin();
}

/**
 * Scans Yarn workspaces and returns all non-private packages
 * @returns {Promise<Array<{filepath: string, content: object}>>} Array of packages with their filepath and parsed package.json
 */
export async function getAllPublicPackages() {
  const rootPackagePath = hostGitPath('package.json');
  const rootPackageContent = await readJson(rootPackagePath);
  const workspaces = rootPackageContent.workspaces;

  // If no workspaces, this is the package to publish
  if (!workspaces) {
    if (rootPackageContent.private) {
      return [];
    }
    return [
      {
        filepath: rootPackagePath,
        content: rootPackageContent,
      },
    ];
  }

  // If workspaces, we get the packages of all those workspaces
  const rawList = await pMap(workspaces, async (workspacePattern) => {
    const packagesPath = await glob(
      hostGitPath(`${workspacePattern}/package.json`),
    );
    const packagesData = await pMap(packagesPath, async (filepath) => {
      const content = await readJson(filepath);
      if (content.private) {
        return false;
      }
      return {
        filepath,
        content,
      };
    });
    return _.compact(packagesData);
  });

  return _.flatten(rawList);
}

__ = {
  /**
   * Check if the user is authenticated with npm via yarn npm whoami
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  async isAuthenticated() {
    try {
      await __.run('yarn npm whoami', { stderr: false, stdout: false });
      return true;
    } catch (_err) {
      return false;
    }
  },
  ensureYarnNpmLogin,
  run,
};
