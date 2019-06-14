import module from '../release';
import helper from '../../helper';
import firost from 'firost';

import releaseIt from 'release-it';
jest.mock('release-it');
import inquirer from 'inquirer';
jest.mock('inquirer');

const anyStringMatching = expect.stringMatching;

describe('release', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('tmp/host');
    jest.spyOn(module, 'output').mockImplementation();
    await firost.emptyDir(helper.hostRoot());
    await firost.writeJson(
      { name: 'foo', version: '0.0.0' },
      helper.hostPath('package.json')
    );
  });
  describe('getHostPackageJson', () => {
    it('return the content of the host package.json', async () => {
      const actual = await module.getHostPackageJson();

      expect(actual).toHaveProperty('name', 'foo');
    });
  });
  describe('fixNpmRegistry', () => {
    it('should set the npm registry', () => {
      /* eslint-disable camelcase */
      process.env.npm_config_registry = 'bad value';

      module.fixNpmRegistry();

      expect(process.env.npm_config_registry).toEqual(
        'https://registry.npmjs.org/'
      );
      /* eslint-enable camelcase */
    });
  });
  describe('getOptions', () => {
    beforeEach(() => {
      jest.spyOn(module, 'askForNextVersion').mockImplementation();
    });
    it('should call release-it in non-interactive mode', async () => {
      const actual = await module.getOptions();

      expect(actual).toHaveProperty('non-interactive', true);
    });
    it('should accept -n for a dry-run', async () => {
      const actual = await module.getOptions({ n: true });

      expect(actual).toHaveProperty('dry-run', true);
    });
    describe('version', () => {
      it('should use the one passed as argument', async () => {
        const actual = await module.getOptions({ _: ['minor'] });

        expect(actual).toHaveProperty('increment', 'minor');
      });
      it('should ask for version if not passed', async () => {
        jest.spyOn(module, 'askForNextVersion').mockReturnValue('foo');

        const actual = await module.getOptions();

        expect(actual).toHaveProperty('increment', 'foo');
      });
    });
  });
  describe('askForNextVersion', () => {
    it('should display the current version', async () => {
      jest
        .spyOn(module, 'getHostPackageJson')
        .mockReturnValue({ version: 'foo_bar' });

      await module.askForNextVersion();

      expect(module.output).toHaveBeenCalledWith(anyStringMatching('foo_bar'));
    });
    it('should return the result of the prompt', async () => {
      inquirer.prompt.mockReturnValue({ nextVersion: 'foo' });

      const actual = await module.askForNextVersion();

      expect(actual).toEqual('foo');
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(module, 'askForNextVersion').mockImplementation();
      jest.spyOn(firost, 'shell').mockImplementation();
    });
    it('should force fix the npm registry', async () => {
      jest.spyOn(module, 'fixNpmRegistry');

      await module.run();

      expect(module.fixNpmRegistry.mock.calls[0]).toEqual([]);
    });
    it('should call releaseIt', async () => {
      jest.spyOn(module, 'getOptions').mockReturnValue('bar');

      await module.run('foo');

      expect(module.getOptions).toHaveBeenCalledWith('foo');
      expect(releaseIt).toHaveBeenCalledWith('bar');
    });
    describe('build', () => {
      it('should build if there is a build command', async () => {
        jest
          .spyOn(module, 'getHostPackageJson')
          .mockReturnValue({ scripts: { build: 'foo' } });

        await module.run();

        expect(firost.shell).toHaveBeenCalledWith('yarn run build');
      });
      it('should not build if there is a no build command', async () => {
        jest.spyOn(module, 'getHostPackageJson').mockReturnValue();

        await module.run();

        expect(firost.shell).not.toHaveBeenCalled();
      });
    });
  });
});
