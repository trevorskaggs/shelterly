import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import AnimalCoverImage from '../AnimalCoverImage';

describe('Components > AnimalCoverImage tests', () => {
  it('Renders AnimalCoverImage component default state', () => {
    render(<AnimalCoverImage />);
    const svgComponent = screen.getByLabelText('Animal Cover Image');
    expect(svgComponent).toBeInTheDocument();
    expect(svgComponent.tagName).toEqual('svg');
  })

  it('Renders AnimalCoverImage component with animalImageSrc', () => {
    render(<AnimalCoverImage animalImageSrc="/static/images/image-not-found.png" />);
    const imgComponent = screen.getByAltText('Animal Cover Image');
    expect(imgComponent).toBeInTheDocument();
    expect(imgComponent.tagName).toEqual('IMG');
  })
});
