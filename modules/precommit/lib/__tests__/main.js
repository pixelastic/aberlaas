import { remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { __, run } from '../main.js';

describe('precommit/main', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  let repo;

  beforeEach(async () => {
    mockHelperPaths(testDirectory);

    __.clearOptions();
    __.addOption('quiet', true);
    __.addOption('cwd', testDirectory);

    repo = new Gilmore(testDirectory);
    await repo.init();
    await repo.newFile('README.md');
    await repo.commitAll('Initial commit');
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('run', () => {
    it('should do nothing if no files in the staging area', async () => {
      const actual = await run();
      expect(actual).toEqual(true);
    });
    it.slow('should return true if linting pass', async () => {
      await write(
        "export default { '*.js': ['true'] }",
        `${testDirectory}/lintstaged.config.js`,
      );

      const filepath = `${testDirectory}/file.js`;
      await repo.newFile(filepath);
      await repo.add(filepath);

      const actual = await run();

      expect(actual).toEqual(true);
    });
    it.slow('should throw an error if linting fails', async () => {
      await write(
        "export default { '*.js': ['false'] }",
        `${testDirectory}/lintstaged.config.js`,
      );

      const filepath = `${testDirectory}/file.js`;
      await repo.newFile(filepath);
      await repo.add(filepath);

      let actual;
      try {
        await run();
      } catch (err) {
        actual = err;
      }
      expect(actual).toHaveProperty('code', 'ABERLAAS_PRECOMMIT_LINT_FAILED');
    });
  });
});
