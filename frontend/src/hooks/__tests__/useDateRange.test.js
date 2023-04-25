import React, { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useDateRange } from '../index';

const basicDateFormat = (date) => date?.toISOString?.()?.substring?.(0, 10);

const TestComponent = ({
  testStartDate,
  testEndDate,
}) => {
  const { startDate, endDate, parseDateRange } = useDateRange();
  const dateRange = [testStartDate];

  if (testEndDate) {
    dateRange.push(testEndDate);
  }

  return (
    <div>
      <p>{basicDateFormat(startDate)}</p>
      <p>{basicDateFormat(endDate)}</p>
      <button onClick={(e) => parseDateRange(dateRange)}>parse</button>
    </div>
  );
};

describe('Hooks > useDateRange', () => {
  it('should render start and end dates given a date range on button click', () => {
    const testStartDate = new Date('2020-01-01');
    const testEndDate = new Date('2020-01-02');

    render(
      <TestComponent testStartDate={testStartDate} testEndDate={testEndDate} />
    );

    // find button and click it
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // find the start and end date elements
    const startDate = screen.getByText(basicDateFormat(testStartDate));
    const endDate = screen.getByText(basicDateFormat(testEndDate));

    expect(startDate).toBeInTheDocument();
    expect(endDate).toBeInTheDocument();
  });

  it('should render start and end dates given a single date on button click', () => {
    const testStartDate = new Date('2023-01-01');

    render(<TestComponent testStartDate={testStartDate} />);

    // find button and click it
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // find the start and end date elements
    const startDate = screen.getAllByText(basicDateFormat(testStartDate));

    expect(startDate).toHaveLength(2);
  });
});
