import React from 'react';
import { RoomDetailsTable } from "./ShelterDetails";
import { RoomForm } from "./ShelterForms";

const header_style = {
  textAlign: "center",
}

export const RoomDetails = ({id}) => (
  <div>
    <RoomDetailsTable id={id} />
  </div>
)

export const NewRoom = ({id}) => (
  <div>
    <h1 style={header_style}>Buildings</h1>
    <RoomForm />
  </div>
)

export const UpdateRoom = ({id}) => (
  <div>
    <RoomForm id={id}/>
  </div>
)
