describe('test/gitEnv', () => {
  it.each([
    { input: 'GIT_DIR' },
    { input: 'GIT_INDEX_FILE' },
    { input: 'GIT_OBJECT_DIRECTORY' },
    { input: 'GIT_WORK_TREE' },
  ])('does not define $input', ({ input }) => {
    const actual = process.env[input];
    expect(actual).toBeUndefined();
  });
});
