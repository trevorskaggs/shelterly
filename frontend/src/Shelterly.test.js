import React from 'react';
import { render } from '@testing-library/react';
import Shelterly from './Shelterly';

test('renders learn react link', () => {
  const { getByText } = render(<Shelterly />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
