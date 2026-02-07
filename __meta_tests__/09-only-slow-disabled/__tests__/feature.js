it('normal test', async () => {
  console.info(testName);
  expect(true).toEqual(true);
});

it.slow('slow test', async () => {
  console.info(testName);
  expect(true).toEqual(true);
});
