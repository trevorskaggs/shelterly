import React from "react";
import { Link } from 'raviger';
import { Row, ListGroup } from 'react-bootstrap'
import { ShelterForm } from "./ShelterForms";
import { ShelterTable } from "./ShelterTables";


const header_style = {
  textAlign: "center",
};

const Shelter = () => (
  <ListGroup className="flex-fill p-5 h-50">
    <Link href="/shelter/new">
      <ListGroup.Item action>CREATE NEW SHELTER</ListGroup.Item>
    </Link>
    <Link href="/shelter/list">
      <ListGroup.Item action>SEE ALL SHELTERS</ListGroup.Item>
    </Link>
  </ListGroup>
)

export const NewShelter = () => (
  <div>
    <ShelterForm />
  </div>
)

export const UpdateShelter = ({id}) => (
  <div>
    <ShelterForm id={id}/>
  </div>
)

export const ShelterList = () => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <ShelterTable />
  </div>
)

export default Shelter