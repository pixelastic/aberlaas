import { read, remove, tmpDirectory, write } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import {
  getLastReleasePoint,
  getNpmAuthToken,
  setNpmAuthToken,
} from '../helper.js';

describe('release/helper', () => {
  const testDirectory = tmpDirectory('aberlaas/release/helper');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('getLastReleasePoint', () => {
    it('should return the tag name when the tag exists', async () => {
      const repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');
      await repo.createTag('v1.2.3');

      const actual = await getLastReleasePoint('1.2.3');

      expect(actual).toEqual('v1.2.3');
    });

    it('should return null when the tag does not exist', async () => {
      const repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');

      const actual = await getLastReleasePoint('1.2.3');

      expect(actual).toEqual(null);
    });
  });

  describe('getNpmAuthToken', () => {
    it('should return the token when .env file exists with token', async () => {
      await write(
        'ABERLAAS_RELEASE_NPM_AUTH_TOKEN="my_test_token_123"',
        `${testDirectory}/.env`,
      );

      const actual = await getNpmAuthToken();

      expect(actual).toEqual('my_test_token_123');
    });

    it('should return null when .env file does not exist', async () => {
      const actual = await getNpmAuthToken();

      expect(actual).toEqual(null);
    });

    it('should return null when .env file exists but token is not set', async () => {
      await write('SOME_OTHER_VAR="value"', `${testDirectory}/.env`);

      const actual = await getNpmAuthToken();

      expect(actual).toEqual(null);
    });
  });

  describe('setNpmAuthToken', () => {
    it('should write token to .env file', async () => {
      await setNpmAuthToken('npm_secret_token_456');

      const envContent = await read(`${testDirectory}/.env`);
      expect(envContent).toEqual(
        'ABERLAAS_RELEASE_NPM_AUTH_TOKEN="npm_secret_token_456"',
      );
    });

    it('should update existing token in .env file', async () => {
      await write(
        'ABERLAAS_RELEASE_NPM_AUTH_TOKEN="old_token"',
        `${testDirectory}/.env`,
      );

      await setNpmAuthToken('new_token');

      const envContent = await read(`${testDirectory}/.env`);
      expect(envContent).toEqual('ABERLAAS_RELEASE_NPM_AUTH_TOKEN="new_token"');
    });

    it('should preserve other variables when updating token', async () => {
      await write(
        'OTHER_VAR="keep_me"\nABERLAAS_RELEASE_NPM_AUTH_TOKEN="old_token"',
        `${testDirectory}/.env`,
      );

      await setNpmAuthToken('new_token');

      const envContent = await read(`${testDirectory}/.env`);
      expect(envContent).toEqual(
        'OTHER_VAR="keep_me"\nABERLAAS_RELEASE_NPM_AUTH_TOKEN="new_token"',
      );
    });
  });
});
