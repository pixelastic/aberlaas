import { read, remove, tmpDirectory, write } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { prettierFix } from '../prettierFix.js';

describe('prettierFix', () => {
  const testDirectory = tmpDirectory('aberlaas/lint/prettierFix');

  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
  });

  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('prettierFix', () => {
    it('should successfully fix valid files', async () => {
      const filepath = `${testDirectory}/good.json`;
      await write('{"foo":"bar",}', filepath);

      await prettierFix([filepath]);

      const actual = await read(filepath);
      expect(actual).toBe('{ "foo": "bar" }');
    });

    it('should collect errors from multiple broken files', async () => {
      const file1 = `${testDirectory}/broken1.json`;
      const file2 = `${testDirectory}/broken2.json`;

      await write('{ invalid }', file1);
      await write('{ also invalid }', file2);

      let actual = null;
      try {
        await prettierFix([file1, file2]);
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_PRETTIER_FIX');
      expect(actual.message).toContain('broken1.json');
      expect(actual.message).toContain('broken2.json');
    });

    it('should fix some files and throw for broken ones', async () => {
      const goodFile = `${testDirectory}/good.json`;
      const brokenFile = `${testDirectory}/broken.json`;

      await write('{"foo":"bar",}', goodFile);
      await write('{ << broken >>', brokenFile);

      let actual = null;
      try {
        await prettierFix([goodFile, brokenFile]);
      } catch (error) {
        actual = error;
      }

      const goodContent = await read(goodFile);
      expect(goodContent).toBe('{ "foo": "bar" }');

      expect(actual.code).toBe('ABERLAAS_LINT_PRETTIER_FIX');
      expect(actual.message).toContain('broken.json');
      expect(actual.message).not.toContain('good.json');
    });
  });
});
