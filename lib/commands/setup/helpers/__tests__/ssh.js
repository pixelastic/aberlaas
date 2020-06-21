const module = require('../ssh.js');
const helper = require('../../../../helper.js');
const githubHelper = require('../github.js');
const emptyDir = require('firost/lib/emptyDir');
const exists = require('firost/lib/exists');
const write = require('firost/lib/write');

describe('setup > helpers > ssh', () => {
  const tmpDir = './tmp/setup/helpers/ssh';
  beforeEach(async () => {
    await emptyDir(tmpDir);
  });
  describe('hasBinary', () => {
    it('should check if ssh-keygen is available', async () => {
      jest.spyOn(module, '__which').mockReturnValue();
      await module.hasBinary();
      expect(module.__which).toHaveBeenCalledWith('ssh-keygen');
    });
    it('should return true if ssh-keygen is available', async () => {
      jest.spyOn(module, '__which').mockReturnValue('/path/to/file');
      const actual = await module.hasBinary();
      expect(actual).toEqual(true);
    });
    it('should return false if ssh-keygen is not available', async () => {
      jest.spyOn(module, '__which').mockReturnValue(false);
      const actual = await module.hasBinary();
      expect(actual).toEqual(false);
    });
  });
  describe('generateKeys', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__run').mockReturnValue();
      jest
        .spyOn(githubHelper, 'repoData')
        .mockReturnValue({ email: 'user@provider.com' });
    });
    it('should create the key directory', async () => {
      const input = `${tmpDir}/newdir/key`;
      await module.generateKeys(input);
      expect(await exists(`${tmpDir}/newdir`)).toEqual(true);
    });
    it('should call ssh-keygen with the right arguments', async () => {
      const input = `${tmpDir}/newdir/key`;
      await module.generateKeys(input);
      expect(module.__run).toHaveBeenCalledWith(
        `ssh-keygen -m PEM -t rsa -C user@provider.com -f ${input} -N ''`,
        expect.anything()
      );
    });
    it('should run ssh-keygen in shell mode', async () => {
      const input = `${tmpDir}/newdir/key`;
      await module.generateKeys(input);
      expect(module.__run).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ shell: true })
      );
    });
  });
  describe('getKey', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'generateKeys').mockReturnValue();
      jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDir);
      jest.spyOn(module, 'getFingerprint').mockReturnValue();
    });
    it('should return the public, private and fingerprint of the keys', async () => {
      await write('public_key', helper.hostPath('./tmp/ssh/key.pub'));
      await write('private_key', helper.hostPath('./tmp/ssh/key'));
      module.getFingerprint.mockReturnValue('fi:ng:er:pr:in:t');

      const actual = await module.getKeys();
      expect(actual).toHaveProperty('public', 'public_key');
      expect(actual).toHaveProperty('private', 'private_key');
      expect(actual).toHaveProperty('privateFingerprint', 'fi:ng:er:pr:in:t');
    });
    it('should generate the keys first if not yet there', async () => {
      jest.spyOn(module, 'generateKeys').mockImplementation(async () => {
        await write('new_public_key', helper.hostPath('./tmp/ssh/key.pub'));
        await write('new_private_key', helper.hostPath('./tmp/ssh/key'));
      });
      const actual = await module.getKeys();
      expect(module.generateKeys).toHaveBeenCalled();
      expect(actual).toHaveProperty('public', 'new_public_key');
      expect(actual).toHaveProperty('private', 'new_private_key');
    });
  });
  describe('getFingerprint', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__run').mockReturnValue();
    });
    it('should call ssh-keygen with the right arguments', async () => {
      await module.getFingerprint('./path');
      expect(module.__run).toHaveBeenCalledWith(
        'ssh-keygen -E md5 -l -f ./path',
        expect.anything()
      );
    });
    it('should parse the md5 from the output', async () => {
      module.__run.mockReturnValue({
        stdout:
          '4096 MD5:61:ab:84:b7:ad:82:17:90:66:0d:f0:0c:c4:77:f9:26 name@provider.com (RSA)',
      });
      const actual = await module.getFingerprint();
      expect(actual).toEqual('61:ab:84:b7:ad:82:17:90:66:0d:f0:0c:c4:77:f9:26');
    });
  });
});
