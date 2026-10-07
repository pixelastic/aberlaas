import { encodePackageName } from '../encodePackageName.js';

describe('encodePackageName', () => {
  it.each([
    { title: 'unscoped name', input: 'my-package', expected: 'my-package' },
    {
      title: 'scoped name',
      input: '@scope/my-package',
      expected: '@scope%2fmy-package',
    },
  ])('should encode $title', ({ input, expected }) => {
    const actual = encodePackageName(input);

    expect(actual).toEqual(expected);
  });
});
