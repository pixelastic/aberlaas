describe('test fail', () => {
  it('should suceed', async () => {
    expect(true).toEqual(true);
  });
  it('should fail', async () => {
    expect(true).toEqual(false);
  });
});
