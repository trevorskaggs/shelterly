import React from "react";
import { Link } from "raviger";
import { DispatchTeamMemberForm } from "./DispatchForms";
import { ListGroup } from 'react-bootstrap';

const header_style = {
  textAlign: "center",
};

  const Dispatch = () => (
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/dispatch/dispatchteammember/new">
      <ListGroup.Item action>
      NEW TEAM MEMBER
      </ListGroup.Item>
      </Link>
      <Link href="/dispatch/dispatch">
      <ListGroup.Item action>
      DEPLOY
      </ListGroup.Item>
      </Link>
      <Link href="">
      <ListGroup.Item action>
      DEBRIEF
      </ListGroup.Item>
      </Link>
      <Link href="/">
      <ListGroup.Item action>
      BACK
      </ListGroup.Item>
      </Link>
    </ListGroup>
  )


  export const NewDispatchTeamMember = () => (
    <div>
      <h1 style={header_style}>Add Dispatch Team Member</h1>
      <DispatchTeamMemberForm />
    </div>
  )

export default Dispatch
