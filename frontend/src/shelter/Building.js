import React from 'react';
import { BuildingDetailsTable } from "./ShelterDetails";
import { BuildingForm } from "./ShelterForms";

export const BuildingDetails = ({id}) => (
  <div>
    <BuildingDetailsTable id={id} />
  </div>
)

export const NewBuilding = () => (
  <div>
    <BuildingForm />
  </div>
)

export const UpdateBuilding = ({id}) => (
  <div>
    <BuildingForm id={id}/>
  </div>
)
