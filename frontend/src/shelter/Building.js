import React from 'react';
import {BuildingDetailsTable} from "./ShelterDetails";
import { BuildingForm } from "./ShelterForms";

const header_style = {
  textAlign: "center",
}


export const BuildingDetails = ({id}) => (
  <div>
    <BuildingDetailsTable id={id} />
  </div>
)

export const NewBuilding = () => (
  <div>
    <h1 style={header_style}>Buildings</h1>
    <BuildingForm />
  </div>
)

export const UpdateBuilding = ({id}) => (
  <div>
    <BuildingForm id={id}/>
  </div>
)