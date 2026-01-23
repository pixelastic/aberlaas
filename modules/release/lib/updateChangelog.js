import {
  consoleInfo,
  exists,
  firostError,
  read,
  run,
  select,
  write,
} from 'firost';
import { _ } from 'golgoth';
import {
  generateMarkDown,
  getGitDiff,
  loadChangelogConfig,
  parseCommits,
} from 'changelogen';
import { hostGitPath, hostGitRoot } from 'aberlaas-helper';
import cliMarkdown from 'cli-markdown';

export const __ = {
  /**
   * Generate changelog markdown from git commits between two versions
   * @param {object} releaseData - Release data containing currentVersion, newVersion, and skipChangelog
   * @returns {string} Generated changelog markdown
   */
  async generateChangelogFromGit(releaseData) {
    const { currentVersion, newVersion } = releaseData;
    const gitRoot = hostGitRoot();
    const currentVersionTag = `v${currentVersion}`;

    // Get config
    const defaultConfig = await loadChangelogConfig(gitRoot);
    const config = {
      ...defaultConfig,
      from: currentVersionTag,
      to: 'HEAD',
      newVersion,
      noAuthors: true,
      types: {
        feat: { title: 'Features', semver: 'minor' },
        fix: { title: 'Bug Fixes', semver: 'patch' },
        perf: { title: 'Performance', semver: 'patch' },
        // Unused types 👇️
        // refactor: { title: '💅 Refactors', semver: 'patch' },
        // docs: { title: '📖 Documentation', semver: 'patch' },
        // build: { title: '📦 Build', semver: 'patch' },
        // types: { title: '🌊 Types', semver: 'patch' },
        // chore: { title: '🏡 Chore' },
        // examples: { title: '🏀 Examples' },
        // test: { title: '✅ Tests' },
        // style: { title: '🎨 Styles' },
        // ci: { title: '🤖 CI' }
      },
    };

    const rawCommits = await getGitDiff(currentVersionTag, 'HEAD', gitRoot);
    const commits = parseCommits(rawCommits, config);

    // Filter commits to only keep user-facing types
    const allowedTypes = _.keys(config.types);
    const filteredCommits = _.filter(commits, (commit) => {
      return _.includes(allowedTypes, commit.type);
    });

    // Generate markdown
    return await generateMarkDown(filteredCommits, config);
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
  consoleInfo,
  consoleLog(input) {
    console.log(input);
  },
  select,
  cliMarkdown,
  run,
};

/**
 * Update the CHANGELOG.md file with new additions
 * @param {object} releaseData - Release data containing currentVersion, newVersion, and skipChangelog
 */
export async function updateChangelog(releaseData) {
  if (releaseData.skipChangelog) {
    return;
  }

  const suggestedChangelog = await __.generateChangelogFromGit(releaseData);
  const approvedChangelog = await __.confirmOrEditChangelog(suggestedChangelog);

  const changelogPath = hostGitPath('CHANGELOG.md');
  let existingChangelog = '';
  if (await exists(changelogPath)) {
    existingChangelog = await read(changelogPath);
  }
  const newChangelog = `${approvedChangelog}\n\n${existingChangelog}`;
  await write(newChangelog, changelogPath);
}
