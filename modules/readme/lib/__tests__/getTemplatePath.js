import { exists } from 'firost';
import { getTemplatePath } from '../getTemplatePath.js';

describe('getTemplatePath', () => {
  it('should return the path to an existing template', async () => {
    const actual = getTemplatePath();

    expect(actual).toMatch(/templates\/README\.template\.md$/);
    expect(await exists(actual)).toEqual(true);
  });
});
