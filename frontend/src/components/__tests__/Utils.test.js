import { titleCase } from '../Utils';

describe('Components > Utils', () => {
  describe('titleCase', () => {
    const mockStringInput = 'capitalize every word.';

    const mockStringOutput = 'Capitalize Every Word.';

    it('capitalizes the first letter of the first word', () => {
      expect(titleCase(mockStringInput)).toEqual(mockStringOutput);
    });
  });
});
