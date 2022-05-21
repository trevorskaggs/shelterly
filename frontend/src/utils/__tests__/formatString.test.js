import { capitalize } from '../formatString';

describe('Utils > formatString', () => {
  const mockStringInput1 = 'capitalize the first word.';
  const mockStringInput2 = 'capitalize every word.';

  const expectedStringOutput1 = 'Capitalize the first word.';
  const expectedStringOutput2 = 'Capitalize Every Word.';

  it('capitalizes the first letter of the first word', () => {
    expect(capitalize(mockStringInput1)).toEqual(expectedStringOutput1);
  });

  it('capitalizes the first letter of every word', () => {
    expect(capitalize(mockStringInput2, {
      proper: true
    })).toEqual(expectedStringOutput2)
  })
})