import { gitRoot, read, readJson } from 'firost';
import { nodeVersion, yarnVersion } from '../main.js';

describe('versions/main', () => {
  describe('version consistency', () => {
    it('yarnVersion should match yarn set version in .circleci/config.yml', async () => {
      const content = await read(`${gitRoot()}/.circleci/config.yml`);
      const match = content.match(/yarn set version (\S+)/);

      expect(match).toHaveProperty('1', yarnVersion);
    });

    it('yarnVersion should match packageManager in root package.json', async () => {
      const content = await readJson(`${gitRoot()}/package.json`);

      expect(content).toHaveProperty('packageManager', `yarn@${yarnVersion}`);
    });

    it('nodeVersion should match cimg/node image in .circleci/config.yml', async () => {
      const content = await read(`${gitRoot()}/.circleci/config.yml`);
      const match = content.match(/cimg\/node:(\S+)/);

      expect(match).toHaveProperty('1', nodeVersion);
    });
  });
});
