import { titleCase, isImageFile, getFileNameFromUrl } from '../Utils';

describe('Components > Utils', () => {
  describe('titleCase', () => {
    const mockStringInput = 'capitalize every word.';

    const mockStringOutput = 'Capitalize Every Word.';

    it('capitalizes the first letter of the first word', () => {
      expect(titleCase(mockStringInput)).toEqual(mockStringOutput);
    });
  });

  describe('isImageFile', () => {
    it('should return true if filename has an image extension', () => {
      const filename = 'example.jpg';
      expect(isImageFile(filename)).toBe(true);
    });

    it('should return false if filename does not have an image extension', () => {
      const filename = 'example.txt';
      expect(isImageFile(filename)).toBe(false);
    });
  });

  describe('getFileNameFromUrl', () => {
    it('should return the file name from a URL', () => {
      const url = 'https://example.com/file1.txt';
      expect(getFileNameFromUrl(url)).toBe('file1');
    });
  
    it('should handle URLs with multiple extensions', () => {
      const url = 'https://example.com/file2.tar.gz';
      expect(getFileNameFromUrl(url)).toBe('file2');
    });
  
    it('should handle URLs with no file extension', () => {
      const url = 'https://example.com/directory1/directory2/';
      expect(getFileNameFromUrl(url)).toBe('');
    });
  
    it('should handle URLs with query parameters', () => {
      const url = 'https://example.com/file3.txt?foo=bar&baz=qux';
      expect(getFileNameFromUrl(url)).toBe('file3');
    });
  
    it('should handle URLs with hash parameters', () => {
      const url = 'https://example.com/file4.txt#anchor';
      expect(getFileNameFromUrl(url)).toBe('file4');
    });
  
    it('should handle URLs with no path', () => {
      const url = 'https://example.com?foo=bar&baz=qux';
      expect(getFileNameFromUrl(url)).toBe('example');
    });
  
    it('should handle malformed URLs', () => {
      const url = 'not a valid URL';
      expect(getFileNameFromUrl(url)).toBe(url);
    });
  });
});
