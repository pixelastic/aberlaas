import module from '../lint';
import helper from '../../helper';
import lintCss from '../lint-css';
import lintJs from '../lint-js';
import lintJson from '../lint-json';

describe('lint', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(lintJs, 'run').mockReturnValue();
      jest.spyOn(lintJson, 'run').mockReturnValue();
      jest.spyOn(lintCss, 'run').mockReturnValue();
    });
    describe('lint-js', () => {
      it('should call lint-js with same positional arguments', async () => {
        await module.run({ _: './lib' });

        expect(lintJs.run).toHaveBeenCalledWith({ _: './lib' });
      });
      it('should pass the --config.js key to --config', async () => {
        await module.run({ config: { js: 'foo.eslint.js' } });

        expect(lintJs.run).toHaveBeenCalledWith({ config: 'foo.eslint.js' });
      });
    });
    describe('lint-json', () => {
      it('should call lint-json with same positional arguments', async () => {
        await module.run({ _: './lib' });

        expect(lintJson.run).toHaveBeenCalledWith({ _: './lib' });
      });
    });
    describe('lint-css', () => {
      it('should call lint-css with same positional arguments', async () => {
        await module.run({ _: './lib' });

        expect(lintCss.run).toHaveBeenCalledWith({ _: './lib' });
      });
      it('should pass the --config.css key to --config', async () => {
        await module.run({ config: { css: 'foo.stylelint.js' } });

        expect(lintCss.run).toHaveBeenCalledWith({
          config: 'foo.stylelint.js',
        });
      });
    });
  });
});
