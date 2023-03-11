import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDateRange } from "../index";

const TestComponent = ({ testStartDate = "2000-01-01", testEndDate }) => {
  const { startDate, endDate, parseDateRange } = useDateRange();
  const dateRange = [testStartDate];

  if (testEndDate) {
    dateRange.push(testEndDate);
  }

  return (
    <div>
      <p>{startDate}</p>
      <p>{endDate}</p>
      <button onClick={() => parseDateRange(dateRange)}>parse</button>
    </div>
  );
};

describe("Hooks > useDateRange", () => {
  it("should render start and end dates given a date range on button click", () => {
    const testStartDate = "2020-01-01";
    const testEndDate = "2020-01-02";

    render(
      <TestComponent testStartDate={testStartDate} testEndDate={testEndDate} />
    );

    // find button and click it
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // find the start and end date elements
    const startDate = screen.getByText(testStartDate);
    const endDate = screen.getByText(testEndDate);

    expect(startDate).toBeInTheDocument();
    expect(endDate).toBeInTheDocument();
  });

  it("should render start and end dates given a single date on button click", () => {
    const testStartDate = "2023-01-01";

    render(<TestComponent testStartDate={testStartDate} />);

    // find button and click it
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // find the start and end date elements
    const startDate = screen.getAllByText(testStartDate);

    expect(startDate).toHaveLength(2);
  });
});
