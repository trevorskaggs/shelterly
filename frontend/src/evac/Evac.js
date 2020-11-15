import React from "react";
import { Link } from "raviger";
import { EvacTeamMemberForm } from "./EvacForms";
import { ListGroup } from 'react-bootstrap';
import {EvacuationAssignmentTable} from "./EvacTables";

const header_style = {
  textAlign: "center",
};

  const Evac = () => (
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/evac/evacteammember/new">
        <ListGroup.Item action>ADD TEAM MEMBER</ListGroup.Item>
      </Link>
      <Link href="/evac/deploy">
      <ListGroup.Item action>
      DEPLOY
      </ListGroup.Item>
      </Link>
      <Link href="/evac/evacuationassignment/search">
          <ListGroup.Item action>SEARCH EVACUATION ASSIGNMENTS</ListGroup.Item>
      </Link>
    </ListGroup>
  )


  export const NewEvacTeamMember = () => (
    <div>
      <h1 style={header_style}>Add Evacuation Team Member</h1>
      <EvacTeamMemberForm />
    </div>
  )

  export const EvacuationAssignmentSearch = () => (
    <div>
        <h1 style={header_style}>Evacuation Assignments</h1>
        <br/>
        <EvacuationAssignmentTable/>
    </div>
  )



export default Evac
