import { __, isFirstPublish } from '../isFirstPublish.js';

describe('isFirstPublish', () => {
  it.each([
    {
      title: 'registry returns 404',
      status: 404,
      expected: true,
    },
    {
      title: 'registry returns 200',
      status: 200,
      expected: false,
    },
  ])('should return $expected when $title', async ({ status, expected }) => {
    vi.spyOn(__, 'fetch').mockReturnValue({ status });

    const actual = await isFirstPublish('my-package');

    expect(actual).toEqual(expected);
  });

  it('should encode scoped package names correctly', async () => {
    vi.spyOn(__, 'fetch').mockReturnValue({ status: 404 });

    await isFirstPublish('@scope/my-package');

    expect(__.fetch).toHaveBeenCalledWith(
      'https://registry.npmjs.org/@scope%2fmy-package',
      { method: 'HEAD' },
    );
  });
});
