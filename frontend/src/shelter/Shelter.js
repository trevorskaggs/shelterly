import React from "react";
import { Link } from 'raviger';
import { Row, ListGroup } from 'react-bootstrap'
import { ShelterForm, EditShelterForm } from "./ShelterForms";
import { ShelterTable } from "./ShelterTables";


const header_style = {
  textAlign: "center",
};

const btn_style = {
  width: "50%",
  margin: "0 auto",
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

export const NewShelter = ({sid}) => (
  <div>
    <ShelterForm sid={sid} />
  </div>
)

// export const UpdateShelter = ({sid}) => (
//   <div>
//     <EditShelterForm sid={sid}/>
//   </div>
// )

export const ShelterList = () => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <ShelterTable />
  </div>
)

export default Shelter