import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import AnimalCards from '../AnimalCards';

const mockAnimals = [{
  id: 1,
  name: 'Jake',
  species: 'other'
}, {
  id: 2,
  name: 'Joe',
  species: 'horse'
}];

describe('Components > AnimalCoverImage tests', () => {
  it('Renders AnimalCoverImage component default state', () => {
    render(<AnimalCards animals={mockAnimals} />);
    
    const animalName1 = screen.getByText(mockAnimals[0].name);
    expect(animalName1).toBeInTheDocument();

    const animalName2 = screen.getByText(mockAnimals[1].name);
    expect(animalName2).toBeInTheDocument();
  })
});
