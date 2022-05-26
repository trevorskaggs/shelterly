// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// mock canvas element
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillStyle: null,
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  getImagesData: jest.fn(),
  measureText: jest.fn()
}));
