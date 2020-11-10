import React from "react";
import { Link } from "raviger";
import { EvacTeamMemberForm } from "./EvacForms";
import { ListGroup } from 'react-bootstrap';
import {ServiceRequestTable} from "../hotline/HotlineTables";
import {EvacuationAssignmentTable} from "./EvacTables";

const header_style = {
  textAlign: "center",
};

  const Evac = () => (
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/evac/evacteammember/new">
      <ListGroup.Item action>
      NEW TEAM MEMBER
      </ListGroup.Item>
      </Link>
      <Link href="/evac/dispatch">
      <ListGroup.Item action>
      DEPLOY
      </ListGroup.Item>
      </Link>
      <Link href="">
      <ListGroup.Item action>
      DEBRIEF
      </ListGroup.Item>
      </Link>
      <Link href="/evac/evacuationassignment/list">
          <ListGroup.Item action>SEARCH EVACUATION ASSIGNMENT</ListGroup.Item>
      </Link>
      <Link href="/">
      <ListGroup.Item action>
      BACK
      </ListGroup.Item>
      </Link>
    </ListGroup>
  )


  export const NewEvacTeamMember = () => (
    <div>
      <h1 style={header_style}>Add Evacuation Team Member</h1>
      <EvacTeamMemberForm />
    </div>
  )

  export const EvacuationAssignmentList = () => (
    <div>
        <h1 style={header_style}>Evacuation Assignments</h1>
        <br/>
        {/*<ServiceRequestTable/>*/}
        {/*<EvacTeamTable/>*/}
        <EvacuationAssignmentTable/>
    </div>
  )



export default Evac
