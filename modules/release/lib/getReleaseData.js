import { _, pMap } from 'golgoth';
import { hostGitRoot } from 'aberlaas-helper';
import { getGitDiff, parseCommits } from 'changelogen';
import semver from 'semver';
import { getLastReleasePoint } from './helpers/git.js';
import { isFirstPublish } from './helpers/npm.js';
import { getAllPublicPackages } from './helpers/yarn.js';

export let __;

/**
 * Gathers all release information from CLI arguments
 * @param {object} cliArgs - CLI arguments from minimist
 * @returns {object} Release data containing bumpType, allPackages, currentVersion, newVersion, changelog
 */
export async function getReleaseData(cliArgs) {
  // Default options: changelog enabled unless explicitly disabled via CLI
  const options = {
    changelog: true,
    ...cliArgs,
  };

  const allPackages = await getAllPublicPackages();
  const currentVersion = allPackages[0].content.version;

  const bumpType = await __.getBumpType(cliArgs, currentVersion);

  const newVersion = semver.inc(currentVersion, bumpType);

  // Enrich each package with isFirstPublish from the npm registry
  const enrichedPackages = await pMap(
    allPackages,
    async (packageEntry) => {
      const packageName = packageEntry.content.name;
      return {
        ...packageEntry,
        isFirstPublish: await __.isFirstPublish(packageName),
      };
    },
    { concurrency: 5 },
  );

  return {
    bumpType,
    allPackages: enrichedPackages,
    currentVersion,
    newVersion,
    changelog: options.changelog,
  };
}

__ = {
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

    // Find all commits since last publish
    const lastReleasePoint = await getLastReleasePoint(currentVersion);
    const rawCommits = await getGitDiff(
      lastReleasePoint,
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
  isFirstPublish,
};
