import module from '../lint';
import helper from '../../helper';
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
    });
    it('should call lint-js with same arguments', async () => {
      await module.run('./lib');

      expect(lintJs.run).toHaveBeenCalledWith('./lib');
    });
    it('should call lint-json with same arguments', async () => {
      await module.run('./lib');

      expect(lintJson.run).toHaveBeenCalledWith('./lib');
    });
  });
});
