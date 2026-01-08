import { exists, read, write } from 'firost';
import conventionalChangelog from 'conventional-changelog';

/**
 * Generate and update CHANGELOG.md using conventional commits
 * @param {string} newVersion Version being released
 * @returns {Promise<void>}
 */
async function generate(newVersion) {
  const changelogPath = './CHANGELOG.md';

  // Generate new changelog entry for this release
  const newEntry = await new Promise((resolve, reject) => {
    let content = '';

    conventionalChangelog({
      preset: 'angular',
      releaseCount: 1,
    })
      .on('data', (chunk) => {
        content += chunk.toString();
      })
      .on('end', () => resolve(content))
      .on('error', reject);
  });

  // Prepend to existing CHANGELOG or create new one
  let existingContent = '';
  if (await exists(changelogPath)) {
    existingContent = await read(changelogPath);
  }

  const fullChangelog = newEntry + '\n' + existingContent;
  await write(changelogPath, fullChangelog);
}

export default generate;
