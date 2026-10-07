import { exists, read, remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { removeLegacyNpmAuth } from '../removeLegacyNpmAuth.js';

describe('removeLegacyNpmAuth', () => {
  it.slow('should remove the legacy token and commit', async () => {
    const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
    mockHelperPaths(testDirectory);

    const repo = new Gilmore(testDirectory);
    await repo.init();
    await repo.newFile('README.md');
    await repo.commitAll('Initial commit');

    await write(
      dedent`
      nodeLinker: node-modules
      npmAuthToken: secret-token-123
      yarnPath: .yarn/releases/yarn-4.0.0.cjs
    `,
      `${testDirectory}/.yarnrc.yml`,
    );
    await repo.add('.yarnrc.yml');
    await repo.commit('add yarnrc');
    await write('NPM_TOKEN=legacy-token', `${testDirectory}/.env`);

    const actual = await removeLegacyNpmAuth();

    expect(actual).toEqual(true);
    const yarnrcContent = await read(`${testDirectory}/.yarnrc.yml`);
    expect(yarnrcContent).toEqual(dedent`
    nodeLinker: node-modules
    yarnPath: .yarn/releases/yarn-4.0.0.cjs
  `);

    const lastCommit = (await repo.commitList())[0];
    expect(lastCommit).toHaveProperty(
      'subject',
      'chore(release): remove legacy npm auth token',
    );

    const envExists = await exists(`${testDirectory}/.env`);
    expect(envExists).toEqual(false);

    await remove(testDirectory);
  });
});
