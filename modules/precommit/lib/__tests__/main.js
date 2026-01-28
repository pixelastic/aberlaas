import { remove, tmpDirectory, write } from 'firost';
import Gilmore from 'gilmore';
import { __ as helper } from 'aberlaas-helper';
import { __, run } from '../main.js';

describe('precommit', () => {
  const testDirectory = tmpDirectory('aberlaas/precommit');
  let repo;

  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);

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
    it('should do nothing if no files passed', async () => {
      const actual = await run();
      expect(actual).toEqual(true);
    });
    it('should return true if linting pass', async () => {
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
    it('should throw an error if linting fails', async () => {
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
