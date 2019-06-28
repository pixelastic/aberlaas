import module from '../lint';
import helper from '../../helper';

describe('lint', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('expandPatterns', () => {
    it('should return absolute paths', async () => {
      const input = ['./lib/__tests__/foo.js'];
      const actual = await module.expandPatterns(input);

      expect(actual).toContain(helper.hostPath('lib/__tests__/foo.js'));
    });
    it('should expand glob patterns', async () => {
      const input = ['./lib/**/*.js'];
      const actual = await module.expandPatterns(input);

      expect(actual).toContain(helper.hostPath('lib/__tests__/foo.js'));
    });
    it('should find known files in directories', async () => {
      const input = ['.'];
      const actual = await module.expandPatterns(input);

      expect(actual).toContain(helper.hostPath('jest.config.js'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should go deep in directories', async () => {
      const input = ['.'];
      const actual = await module.expandPatterns(input);

      expect(actual).toContain(helper.hostPath('lib/__tests__/foo.js'));
    });
    it('should find hidden files', async () => {
      const input = ['.'];
      const actual = await module.expandPatterns(input);

      expect(actual).toContain(helper.hostPath('.eslintrc.js'));
    });
    describe('exclude', () => {
      it('should exclude files we cannot lint', async () => {
        const input = ['.'];
        const actual = await module.expandPatterns(input);

        expect(actual).not.toContain(helper.hostPath('lib/assets/001.jpg'));
      });
      it('should exclude files in node_modules', async () => {
        const input = ['.'];
        const actual = await module.expandPatterns(input);

        expect(actual).not.toContain(
          helper.hostPath('node_modules/foo/foo.js')
        );
      });
      it('should exclude files in build', async () => {
        const input = ['.'];
        const actual = await module.expandPatterns(input);

        expect(actual).not.toContain(helper.hostPath('build/foo.js'));
      });
      it('should exclude files in tmp', async () => {
        const input = ['.'];
        const actual = await module.expandPatterns(input);

        expect(actual).not.toContain(helper.hostPath('tmp/foo.js'));
      });
      it('should exclude files in fixtures', async () => {
        const input = ['.'];
        const actual = await module.expandPatterns(input);

        expect(actual).not.toContain(helper.hostPath('fixtures/foo.js'));
      });
      it('should exclude directories and only keep files', async () => {
        const input = ['.'];
        const actual = await module.expandPatterns(input);

        expect(actual).not.toContain(helper.hostPath('lib'));
      });
    });
  });
});
