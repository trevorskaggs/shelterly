import React from "react";
import { Link } from "raviger";
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
      DEPLOY TEAMS
      </ListGroup.Item>
      </Link>
      <Link href="/evac/evacuationassignment/search">
          <ListGroup.Item action>DISPATCH ASSIGNMENTS</ListGroup.Item>
      </Link>
    </ListGroup>
  )

  export const EvacuationAssignmentSearch = () => (
    <div>
        <h1 style={header_style}>Dispatch Assignments</h1>
        <br/>
        <EvacuationAssignmentTable/>
    </div>
  )

export default Evac
