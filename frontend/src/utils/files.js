import { IMAGE_TYPES } from '../constants';

export function isImageFile(filename) {
  return IMAGE_TYPES.includes(filename.split('.').pop());
}

export function getFileNameFromUrl(url) {
  return url.split('/').pop().split('.')[0];
}
