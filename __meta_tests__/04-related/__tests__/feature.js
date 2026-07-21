import feature from '../feature.js';

describe('test related', () => {
  it('should succeed', async () => {
    console.info('my-feature');
    expect(feature).toHaveProperty('name', 'my feature');
  });
});
