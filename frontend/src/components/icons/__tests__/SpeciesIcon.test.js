import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import SpeciesIcon from '../SpeciesIcon';

describe('Components > icons > SpeciesIcon tests', () => {
  it('Renders SpeciesIcon component default state', () => {
    render(
      <SpeciesIcon />
    );
    const svgComponent = screen.getByLabelText('Other Species Icon');
    expect(svgComponent).toBeInTheDocument();
    expect(svgComponent.tagName).toEqual('svg');
  });

  it('Renders SpeciesIcon components with respective species icons', () => {
    const mockCat = { species: 'cat', srLabel: 'Test Cat Icon' };
    const mockDog = { species: 'dog', srLabel: 'Test Dog Icon' };
    const mockHorse = { species: 'horse', srLabel: 'Test Horse Icon' };
    render(
      <>
        <SpeciesIcon {...mockCat} />
        <SpeciesIcon {...mockDog} />
        <SpeciesIcon {...mockHorse} />
      </>
    )

    const catElement = screen.getByLabelText(mockCat.srLabel);
    expect(catElement).toBeInTheDocument();

    const dogElement = screen.getByLabelText(mockDog.srLabel);
    expect(dogElement).toBeInTheDocument();

    const horseElement = screen.getByLabelText(mockHorse.srLabel);
    expect(horseElement).toBeInTheDocument();
  });

  it('Renders SpeciesIcon component default state with an unknown species type', () => {
    render(
      <SpeciesIcon species="dragon" />
    );

    const svgComponent = screen.getByLabelText('Other Species Icon');
    expect(svgComponent).toBeInTheDocument();
    expect(svgComponent.tagName).toEqual('svg');
  })
});
