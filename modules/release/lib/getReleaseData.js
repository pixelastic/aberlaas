import { consoleInfo, glob, readJson } from 'firost';
import { _, pMap } from 'golgoth';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import semver from 'semver';
import { getGitDiff, parseCommits } from 'changelogen';

export const __ = {
  consoleInfo,

  /**
   * Gets all packages that need to be released
   * @returns {Array<{filepath: string, content: object}>} Array of packages with their filepath and content
   */
  async getAllPackagesToRelease() {
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
    const rootPath = hostGitRoot();
    const rawList = await pMap(workspaces, async (workspacePattern) => {
      const packagesPath = await glob(
        `${rootPath}/${workspacePattern}/package.json`,
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
  },
  /**
   * Determines the appropriate semantic version bump type based on CLI arguments or git commit analysis
   * @param {object} [cliArgs={}] - Command line arguments object containing potential bump type
   * @param {string} currentVersion - The current version to compare commits against
   * @returns {Promise<string>} The bump type: 'major', 'minor', or 'patch'
   */
  async getBumpType(cliArgs = {}, currentVersion) {
    const argFromCli = cliArgs._[0];
    if (argFromCli) {
      return argFromCli;
    }

    // Getting all commits since last version tag
    const rawCommits = await getGitDiff(
      `v${currentVersion}`,
      'HEAD',
      hostGitRoot(),
    );
    // This is the minimal object required by changelogen
    const minimalConfig = { scopeMap: {} };
    const commits = parseCommits(rawCommits, minimalConfig);

    // If any commit has breaking changes: major
    const hasBreakingChanges = _.some(commits, { isBreaking: true });
    if (hasBreakingChanges) {
      return 'major';
    }

    // If any commit adds a feature: minor
    const hasFeature = _.some(commits, { type: 'feat' });
    if (hasFeature) {
      return 'minor';
    }

    // Anything else: patch
    return 'patch';
  },
};

/**
 * Gathers all release information from CLI arguments
 * @param {object} cliArgs - CLI arguments from minimist
 * @returns {object} Release data containing bumpType, allPackages, currentVersion, newVersion, skipChangelog
 */
export async function getReleaseData(cliArgs) {
  const allPackages = await __.getAllPackagesToRelease();
  const currentVersion = allPackages[0].content.version;

  const bumpType = await __.getBumpType(cliArgs, currentVersion);

  const newVersion = semver.inc(currentVersion, bumpType);
  const skipChangelog = !!cliArgs['skip-changelog'];

  return {
    bumpType,
    allPackages,
    currentVersion,
    newVersion,
    skipChangelog,
  };
}
