import current from '../index.js';
import helper from '../../../helper.js';
import emptyDir from 'firost/emptyDir.js';
import writeJson from 'firost/writeJson.js';

describe('ci', () => {
  describe('run', () => {
    describe('locally', () => {
      it('should do nothing when not on a CI server', async () => {});
    });
    describe('on CI server', () => {
      beforeEach(async () => {});
      it('should fail if any step fails', async () => {});
      it('should not call further steps if one fails', async () => {});
      it('should succeed if all steps succeed', async () => {});
    });
  });
});
