import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import AnimalRoomAssignmentCard from '../AnimalRoomAssignmentCard';

const mockAnimal = {
  id: 1,
  name: 'swoop',
  species: 'eagle',
  owner_names: []
};

describe('Components > AnimalRoomAssignmentCard tests', () => {
  it('Renders AnimalRoomAssignmentCard component default state', () => {
    render(<AnimalRoomAssignmentCard
      animal={mockAnimal}
      snapshot={{
        isDragging: false
      }}
    />);
    
    const animalName = screen.getByText(mockAnimal.name);
    expect(animalName).toBeInTheDocument();

    const animalSpecies = screen.getByText(mockAnimal.name);
    expect(animalSpecies).toBeInTheDocument();
  })
});
