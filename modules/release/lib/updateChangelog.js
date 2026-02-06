import { _ } from 'golgoth';
import {
  consoleInfo,
  exists,
  firostError,
  read,
  run,
  select,
  write,
} from 'firost';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import { generateMarkDown, getGitDiff, parseCommits } from 'changelogen';
import cliMarkdown from 'cli-markdown';
import { getLastReleasePoint } from './helper.js';

export let __;

/**
 * Update the CHANGELOG.md file with new additions
 * @param {object} releaseData - Release data containing currentVersion, newVersion, and changeLog
 * @param {boolean} [releaseData.changelog=true] Generate changelog
 */
export async function updateChangelog(releaseData) {
  if (!releaseData.changelog) {
    return;
  }

  const suggestedChangelog = await __.generateChangelogFromGit(releaseData);
  const approvedChangelog = await __.confirmOrEditChangelog(suggestedChangelog);

  await __.addToExistingChangelogFile(approvedChangelog);
}

__ = {
  /**
   * Generate changelog markdown from git commits between two versions
   * @param {object} releaseData - Release data containing currentVersion, newVersion, and changeLog
   * @returns {string} Generated changelog markdown
   */
  async generateChangelogFromGit(releaseData) {
    const { currentVersion, newVersion } = releaseData;

    const lastReleasePoint = await getLastReleasePoint(currentVersion);

    // Get config
    const config = {
      from: lastReleasePoint,
      to: 'HEAD',
      newVersion,
      noAuthors: true,
      types: {
        feat: { title: 'Features', semver: 'minor' },
        fix: { title: 'Bug Fixes', semver: 'patch' },
        perf: { title: 'Performance', semver: 'patch' },
      },
      templates: {
        tagMessage: 'v{{newVersion}}',
        tagBody: 'v{{newVersion}}',
      },
      // Note: This scopeMap key is required by changelogen
      scopeMap: {},
    };

    const rawCommits = await getGitDiff(
      lastReleasePoint,
      'HEAD',
      hostGitRoot(),
    );
    const commits = parseCommits(rawCommits, config);

    // Filter commits to only keep user-facing types
    const allowedTypes = _.keys(config.types);
    const filteredCommits = _.filter(commits, (commit) => {
      return _.includes(allowedTypes, commit.type);
    });

    // Sort commits by type order
    const typeOrder = { feat: 0, fix: 1, perf: 2 };
    const sortedCommits = _.sortBy(filteredCommits, (commit) => {
      return typeOrder[commit.type];
    });

    // Generate markdown
    return await generateMarkDown(sortedCommits, config);
  },

  /**
   * Display the changelog and ask the user to accept/edit/cancel.
   * @param {string} changelog - The changelog content to display and confirm
   * @param {object} selectOptions - Options object with input stream for testing
   * @returns {string} The approved (and possibly edited) changelog content
   */
  async confirmOrEditChangelog(changelog, selectOptions = {}) {
    __.consoleInfo('CHANGELOG:');

    __.consoleLog(_.repeat('━', 60));
    __.consoleLog(__.cliMarkdown(changelog));
    __.consoleLog(_.repeat('━', 60));

    const nextStep = await __.select(
      'What to do?',
      [
        { name: '✅ Approve', value: 'approve' },
        { name: '📝 Edit', value: 'edit' },
        { name: '⛔️ Cancel', value: 'cancel' },
      ],
      selectOptions,
    );

    if (nextStep == 'cancel') {
      throw firostError(
        'ABERLAAS_RELEASE_CHANGELOG_CANCELLED',
        'Release cancelled by user',
      );
    }

    if (nextStep === 'approve') {
      return changelog;
    }

    // Save the changelog in temp file and edit it
    const changelogFilepath = hostGitPath('./tmp/CHANGELOG.md');
    await write(changelog, changelogFilepath);

    await __.run(`$EDITOR ${changelogFilepath}`, {
      stdin: true,
      shell: true,
    });

    const newChangelog = await read(changelogFilepath);
    return await __.confirmOrEditChangelog(newChangelog, selectOptions);
  },

  /**
   * Prepends new changelog content to existing CHANGELOG.md file
   * @param {string} newChangelog - The new changelog content to prepend
   */
  async addToExistingChangelogFile(newChangelog) {
    const changelogPath = hostGitPath('CHANGELOG.md');

    if (!(await exists(changelogPath))) {
      await write(newChangelog, changelogPath);
      return;
    }

    const existingChangelog = await read(changelogPath);
    const updatedChangelog = `${newChangelog}\n\n${existingChangelog}`;
    await write(updatedChangelog, changelogPath);
  },

  consoleInfo,
  consoleLog(input) {
    console.log(input);
  },
  select,
  cliMarkdown,
  run,
  getLastReleasePoint,
};
