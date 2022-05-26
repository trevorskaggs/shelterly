import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import ShIcon from '../ShIcon';
import { ReactComponent as MockSvg } from './svg/mock.fixture.svg';

describe('Components > icons > ShIcon tests', () => {
  it('Renders ShIcon component default state', () => {
    const mockLabel = 'Testing Icon';
    render(
      <ShIcon icon={MockSvg} srLabel={mockLabel} />
    );
    const svgComponent = screen.getByLabelText(mockLabel);
    expect(svgComponent).toBeInTheDocument();
    expect(svgComponent.tagName).toEqual('svg');
  })
});
