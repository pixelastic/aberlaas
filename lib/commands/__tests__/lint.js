import module from '../lint';
import helper from '../../helper';
import lintJs from '../lint-js';

describe('lint', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('run', () => {
    it('should call lint-js with same arguments', async () => {
      jest.spyOn(lintJs, 'run').mockReturnValue();

      await module.run('./lib');

      expect(lintJs.run).toHaveBeenCalledWith('./lib');
    });
  });
});
