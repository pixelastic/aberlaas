const current = require('../index.js');
const sshHelper = require('../../helpers/ssh.js');
const npmHelper = require('../../helpers/npm.js');
const githubHelper = require('../../helpers/github.js');
const circleciHelper = require('../../helpers/circleci.js');
describe('setup > autoRelease', () => {
  describe('validationErrors', () => {
    beforeEach(async () => {
      jest.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      jest.spyOn(npmHelper, 'hasToken').mockReturnValue(true);
      jest.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      jest.spyOn(sshHelper, 'hasBinary').mockReturnValue(true);
    });
    it('should return an empty array if no errors', async () => {
      const actual = await current.validationErrors();
      expect(actual).toBeEmpty();
    });
    it('should contain an error if no NPM_TOKEN', async () => {
      npmHelper.hasToken.mockReturnValue(false);
      const actual = await current.validationErrors();
      expect(actual).toHaveLength(1);
    });
    it('should contain an error if no CIRCLECI_TOKEN', async () => {
      circleciHelper.hasToken.mockReturnValue(false);
      const actual = await current.validationErrors();
      expect(actual).toHaveLength(1);
    });
    it('should contain an error if no GITHUB_TOKEN', async () => {
      githubHelper.hasToken.mockReturnValue(false);
      const actual = await current.validationErrors();
      expect(actual).toHaveLength(1);
    });
    it('should contain an error if no ssh-keygen', async () => {
      sshHelper.hasBinary.mockReturnValue(false);
      const actual = await current.validationErrors();
      expect(actual).toHaveLength(1);
    });
  });
  describe('enable', () => {
    describe('errors', () => {
      beforeEach(async () => {
        jest
          .spyOn(current, 'validationErrors')
          .mockReturnValue(['error 1', 'error 2']);
        jest.spyOn(current, '__consoleError').mockReturnValue();
      });
      it('should return false', async () => {
        const actual = await current.enable();
        expect(actual).toEqual(false);
      });
      it('should display errors', async () => {
        await current.enable();
        expect(current.__consoleError).toHaveBeenCalledWith('error 1');
        expect(current.__consoleError).toHaveBeenCalledWith('error 2');
      });
    });
    describe('success', () => {
      beforeEach(async () => {
        jest.spyOn(current, 'validationErrors').mockReturnValue([]);
        jest.spyOn(current, '__envVarsEnable').mockReturnValue([]);
        jest.spyOn(current, '__publicKeyEnable').mockReturnValue([]);
        jest.spyOn(current, '__privateKeyEnable').mockReturnValue([]);
      });
      it('should set NPM_TOKEN and ssh keys', async () => {
        await current.enable();
        expect(current.__envVarsEnable).toHaveBeenCalled();
        expect(current.__publicKeyEnable).toHaveBeenCalled();
        expect(current.__privateKeyEnable).toHaveBeenCalled();
      });
    });
  });
});
