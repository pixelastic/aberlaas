import feature from '../feature.js';

describe('test related', () => {
  it('should succeed', async () => {
    console.info('my-feature');
    expect(feature.name).toEqual('my feature');
  });
});
