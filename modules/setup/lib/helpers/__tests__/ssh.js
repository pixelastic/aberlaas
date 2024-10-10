import { absolute, emptyDir, exists, write } from 'firost';
import current from '../ssh.js';
import helper from '../../../../helper.js';
import githubHelper from '../github.js';

describe('setup > helpers > ssh', () => {
  const tmpDir = absolute('<gitRoot>/tmp/setup/helpers/ssh');
  beforeEach(async () => {
    await emptyDir(tmpDir);
  });
  describe('hasBinary', () => {
    it('should check if ssh-keygen is available', async () => {
      vi.spyOn(current, '__which').mockReturnValue();
      await current.hasBinary();
      expect(current.__which).toHaveBeenCalledWith('ssh-keygen');
    });
    it('should return true if ssh-keygen is available', async () => {
      vi.spyOn(current, '__which').mockReturnValue('/path/to/file');
      const actual = await current.hasBinary();
      expect(actual).toBe(true);
    });
    it('should return false if ssh-keygen is not available', async () => {
      vi.spyOn(current, '__which').mockReturnValue(false);
      const actual = await current.hasBinary();
      expect(actual).toBe(false);
    });
  });
  describe('generateKeys', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__run').mockReturnValue();
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({
        email: 'user@provider.com',
      });
    });
    it('should create the key directory', async () => {
      const input = `${tmpDir}/newdir/key`;
      await current.generateKeys(input);
      expect(await exists(`${tmpDir}/newdir`)).toBe(true);
    });
    it('should call ssh-keygen with the right arguments', async () => {
      const input = `${tmpDir}/newdir/key`;
      await current.generateKeys(input);
      expect(current.__run).toHaveBeenCalledWith(
        `ssh-keygen -m PEM -t rsa -C user@provider.com -f ${input} -N ''`,
        expect.anything(),
      );
    });
    it('should run ssh-keygen in shell mode', async () => {
      const input = `${tmpDir}/newdir/key`;
      await current.generateKeys(input);
      expect(current.__run).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ shell: true }),
      );
    });
  });
  describe('getKey', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'generateKeys').mockReturnValue();
      vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDir);
      vi.spyOn(current, 'getFingerprint').mockReturnValue();
    });
    it('should return the public, private and fingerprint of the keys', async () => {
      await write('public_key', helper.hostPath('./tmp/ssh/key.pub'));
      await write('private_key', helper.hostPath('./tmp/ssh/key'));
      current.getFingerprint.mockReturnValue('fi:ng:er:pr:in:t');

      const actual = await current.getKeys();
      expect(actual).toHaveProperty('public', 'public_key');
      expect(actual).toHaveProperty('private', 'private_key');
      expect(actual).toHaveProperty('privateFingerprint', 'fi:ng:er:pr:in:t');
    });
    it('should generate the keys first if not yet there', async () => {
      vi.spyOn(current, 'generateKeys').mockImplementation(async () => {
        await write('new_public_key', helper.hostPath('./tmp/ssh/key.pub'));
        await write('new_private_key', helper.hostPath('./tmp/ssh/key'));
      });
      const actual = await current.getKeys();
      expect(current.generateKeys).toHaveBeenCalled();
      expect(actual).toHaveProperty('public', 'new_public_key');
      expect(actual).toHaveProperty('private', 'new_private_key');
    });
  });
  describe('getFingerprint', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__run').mockReturnValue();
    });
    it('should call ssh-keygen with the right arguments', async () => {
      await current.getFingerprint('./path');
      expect(current.__run).toHaveBeenCalledWith(
        'ssh-keygen -E md5 -l -f ./path',
        expect.anything(),
      );
    });
    it('should parse the md5 from the output', async () => {
      current.__run.mockReturnValue({
        stdout:
          '4096 MD5:61:ab:84:b7:ad:82:17:90:66:0d:f0:0c:c4:77:f9:26 name@provider.com (RSA)',
      });
      const actual = await current.getFingerprint();
      expect(actual).toBe('61:ab:84:b7:ad:82:17:90:66:0d:f0:0c:c4:77:f9:26');
    });
  });
});
