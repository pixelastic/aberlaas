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

/**
 * Update the CHANGELOG.md file with new additions
 * @param {string} currentVersion - The current version to compare from
 * @param {string} newVersion - The new version to compare to
 */
export async function updateChangelog(currentVersion, newVersion) {
  const suggestedChangelog = await generateChangelogFromGit(
    currentVersion,
    newVersion,
  );
  const approvedChangelog = await confirmOrEditChangelog(suggestedChangelog);

  const changelogPath = hostGitPath('CHANGELOG.md');
  let existingChangelog = '';
  if (await exists(changelogPath)) {
    existingChangelog = await read(changelogPath);
  }
  const newChangelog = `${approvedChangelog}\n\n${existingChangelog}`;
  await write(newChangelog, changelogPath);
}

/**
 * Display the changelog and ask the user to accept/edit/cancel.
 * @param {string} changelog - The changelog content to display and confirm
 * @returns {string} The approved (and possibly edited) changelog content
 */
async function confirmOrEditChangelog(changelog) {
  consoleInfo('CHANGELOG:');

  console.log(_.repeat('━', 60));
  console.log(cliMarkdown(changelog));
  console.log(_.repeat('━', 60));

  const nextStep = await select('What to do?', [
    { name: '✅ Approve', value: 'approve' },
    { name: '📝 Edit', value: 'edit' },
    { name: '⛔️ Cancel', value: 'cancel' },
  ]);

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

  await run(`$EDITOR ${changelogFilepath}`, {
    stdin: true,
    shell: true,
  });

  const newChangelog = await read(changelogFilepath);
  return await confirmOrEditChangelog(newChangelog);
}

/**
 * Generate changelog markdown from git commits between two versions
 * @param {string} currentVersion Starting version (e.g., 'v2.19.0')
 * @param {string} newVersion New version to release (e.g., '2.20.0')
 * @returns {string} Generated changelog markdown
 */
async function generateChangelogFromGit(currentVersion, newVersion) {
  const gitRoot = hostGitRoot();
  const currentVersionTag = `v${currentVersion}`;

  // Get commits
  const rawCommits = await getGitDiff(currentVersionTag, 'HEAD', gitRoot);
  const config = await loadChangelogConfig(gitRoot, {
    from: currentVersionTag,
    to: 'HEAD',
    newVersion,
    noAuthors: true,
    types: {
      feat: { title: 'Features', semver: 'minor' },
      fix: { title: 'Bug Fixes', semver: 'patch' },
      perf: { title: 'Performance', semver: 'patch' },
    },
  });
  const commits = parseCommits(rawCommits, config);

  // Filter commits to only keep user-facing types
  const allowedTypes = ['feat', 'fix', 'perf'];
  const filteredCommits = _.filter(commits, (commit) => {
    return _.includes(allowedTypes, commit.type);
  });

  // Generate markdown
  return await generateMarkDown(filteredCommits, config);
}
