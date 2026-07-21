it('one: pass', async () => {
  console.info('EXECUTED: one');
  expect(true).toEqual(true);
});
it('two: fail', async () => {
  console.info('EXECUTED: two');
  expect(true).toEqual(false);
});
it('three: pass', async () => {
  console.info('EXECUTED: three');
  expect(true).toEqual(true);
});
