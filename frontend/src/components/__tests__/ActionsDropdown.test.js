import React from 'react';
import { render, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionsDropdown from '../ActionsDropdown';

describe('ActionsDropdown component', () => {
  it('renders dropdown with default props', () => {
    const { getByText } = render(<ActionsDropdown>Test</ActionsDropdown>);
    expect(getByText('Actions')).toBeInTheDocument();
  });

  it('renders dropdown with custom title', () => {
    const { getByText } = render(<ActionsDropdown title="Custom Title">Test</ActionsDropdown>);
    expect(getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders dropdown with custom variant', () => {
    const { container } = render(<ActionsDropdown variant="primary">Test</ActionsDropdown>);
    expect(container.getElementsByClassName('btn-primary')).toHaveLength(1);
  });

  it('renders dropdown with custom class name', () => {
    const { container } = render(<ActionsDropdown className="custom-class">Test</ActionsDropdown>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders dropdown with children', async () => {
    const { getByText, queryByText } = render(<ActionsDropdown><div>Test</div></ActionsDropdown>);
    const dropdownBtn = getByText('Actions');
    expect(queryByText('Test')).not.toBeInTheDocument();
    userEvent.click(dropdownBtn);
    await wait(() => {
      expect(getByText('Test')).toBeInTheDocument();
    });
  });
});