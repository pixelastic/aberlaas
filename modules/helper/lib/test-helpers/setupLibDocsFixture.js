import { absolute, mkdirp, run, write, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';

// Git Root {{{
const gitRootPackageJson = {
  type: 'module',
  workspaces: ['lib', 'docs'],
  scripts: {
    'test-helper': 'node ./scripts/test-helper.js',
  },
  packageManager: `yarn@${yarnVersion}`,
};
const scriptsTestHelperContent = `
import helper from '${absolute('../main.js')}';

console.log(
  JSON.stringify(
    {
      hostWorkingDirectory: helper.hostWorkingDirectory(),
      hostPackageRoot: helper.hostPackageRoot(),
      hostGitRoot: helper.hostGitRoot(),
    },
    null,
    2,
  ),
);`;
const yarnRcYmlContent = `
nodeLinker: node-modules
`;
// }}}
// ./lib {{{
const libPackageJson = {
  scripts: {
    'test-helper': 'node ../scripts/test-helper.js',
  },
};
// }}}
// ./docs {{{
const docsPackageJson = {
  scripts: {
    'test-helper': 'node ../scripts/test-helper.js',
  },
};
// }}}

/**
 * Setup a libdocs fixture that looks like this:
 *
 *   ./.git
 *   ./scripts
 *     ./test-helper.js
 *   ./lib
 *     ./helpers
 *     ./package.json
 *   ./docs
 *     ./assets
 *     ./package.json
 *   ./.yarnrc.yml
 *   ./package.json
 * @param {string} rootPath Path where to set the fixture
 */
export async function setupLibDocsFixture(rootPath) {
  // Git root
  await mkdirp(absolute(rootPath, '.git'));
  await writeJson(gitRootPackageJson, absolute(rootPath, 'package.json'));
  await write(
    scriptsTestHelperContent,
    absolute(rootPath, 'scripts/test-helper.js'),
  );
  await write(yarnRcYmlContent, absolute(rootPath, '.yarnrc.yml'));

  // ./lib
  await writeJson(libPackageJson, absolute(rootPath, 'lib/package.json'));
  await mkdirp(absolute(rootPath, 'lib/helpers'));

  // ./docs
  await writeJson(docsPackageJson, absolute(rootPath, 'docs/package.json'));
  await mkdirp(absolute(rootPath, 'docs/assets'));

  // yarn install
  await run('yarn install', { cwd: rootPath, stdout: false });
}
