import React from "react";
import {
  render,
  fireEvent,
  wait,
  waitForElement,
  act
} from "@testing-library/react";
import ShelterlyPrintifyButton from '../ShelterlyPrintifyButton';

describe('Components > ShelterlyPrintifyButton', () => {
  it('Renders ShelterlyPrintifyButton default state', () => {
    const { getByTestId } = render(
      <ShelterlyPrintifyButton/>
    )
    expect(getByTestId('icon-test-component')).toBeInTheDocument();
  });

  it('should render with correct tooltip text', async () => {
    const tooltipText = 'This is a tooltip text';
    const { getByText, getByTestId } = render(
      <ShelterlyPrintifyButton printFunc={() => {}} tooltipText={tooltipText} />
    );

    // Find the button element
    const buttonElement = getByTestId('button-test-component');

    // Hover over the button to trigger the tooltip
    act(() => {
      fireEvent.mouseEnter(buttonElement);
    });

    // Assert that the tooltip text is displayed
    const tooltipElement = await waitForElement(() => getByText(tooltipText));
    expect(tooltipElement).toBeInTheDocument();
  });

  it('should call clickHandler when button is clicked', async () => {
    const clickHandlerMock = jest.fn()
    const { getByTestId } = render(
      <ShelterlyPrintifyButton
        printFunc={clickHandlerMock}
        tooltipText="Tooltip text"
      />
    );

    // Find the button element
    const buttonElement = getByTestId('button-test-component');

    // Click the button
    fireEvent.click(buttonElement);

    // Wait for the Promise to resolve (clickHandler to be called)
    await wait(() => {
      expect(clickHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
});
