import { isValidURL, isImageFile, getFileNameFromUrl } from '../files';

describe('Utils > files', () => {
  describe('isValidURL', () => {
    // Test valid URLs
    test('should return true for a valid URL with HTTPS protocol', () => {
      expect(isValidURL('https://www.example.com')).toBe(true);
    });

    test('should return true for a valid URL with HTTP protocol', () => {
      expect(isValidURL('http://example.com')).toBe(true);
    });

    test('should return true for a valid URL with path', () => {
      expect(isValidURL('https://example.com/path')).toBe(true);
    });

    test('should return true for a valid URL with file', () => {
      expect(isValidURL('https://example.com/path/file.html')).toBe(true);
    });

    test('should return true for a valid URL with query parameters', () => {
      expect(isValidURL('https://example.com?param=value')).toBe(true);
    });

    test('should return true for a valid URL with fragment', () => {
      expect(isValidURL('https://example.com#fragment')).toBe(true);
    });

    test('should return true for a valid URL with FTP protocol', () => {
      expect(isValidURL('ftp://example.com')).toBe(true);
    });

    // Test invalid URLs
    test('should return false for a URL without protocol', () => {
      expect(isValidURL('example.com')).toBe(false);
    });

    test('should return false for a URL without hostname', () => {
      expect(isValidURL('https://')).toBe(false);
    });

    test('should return true for a URL with invalid protocol', () => {
      expect(isValidURL('htp://example.com')).toBe(true);
    });

    test('should return false for a URL with missing protocol and hostname', () => {
      expect(isValidURL('https://')).toBe(false);
    });

    test('should return false for a URL with missing hostname', () => {
      expect(isValidURL('ftp://')).toBe(false);
    });

    test('should return true for a valid URL with localhost', () => {
      expect(isValidURL('https://localhost')).toBe(true);
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

    it('should return true if url has an image extension', () => {
      const url =
        'https://testerly.org/path/imag_file.jpg?token=99999999aaaaaaaaaaaaaa&sign=doattend';
      expect(isImageFile(url)).toBe(true);
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
