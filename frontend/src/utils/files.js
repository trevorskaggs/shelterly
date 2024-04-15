import { IMAGE_TYPES } from '../constants';

// Function to check if a string is a valid URL
export function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

export function isImageFile(input) {
  // Check if the input is a URL
  let filename;
  if (isValidURL(input)) {
    // Parse the URL
    const url = new URL(input);
    
    // Get the pathname from the URL
    const pathname = url.pathname;

    // Extract the filename from the pathname
    const filenameParts = pathname.split('/');
    filename = filenameParts[filenameParts.length - 1];
  } else {
    // If input is not a URL, use it as the filename
    filename = input;
  }

  // Extract the file extension
  const extension = filename.split('.').pop().toLowerCase();

  return IMAGE_TYPES.includes(extension);
}

export function getFileNameFromUrl(url) {
  return url.split('/').pop().split('.')[0];
}
