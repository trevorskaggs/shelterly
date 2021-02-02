import React from "react";
import { Link } from "raviger";
import { ListGroup } from 'react-bootstrap';

  const Dispatch = () => (
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/dispatch/dispatchteammember/new">
        <ListGroup.Item action>ADD TEAM MEMBER</ListGroup.Item>
      </Link>
      <Link href="/dispatch/deploy">
        <ListGroup.Item action>DEPLOY TEAMS</ListGroup.Item>
      </Link>
      <Link href="/dispatch/dispatchassignment/search">
        <ListGroup.Item action>SEARCH DISPATCH ASSIGNMENTS</ListGroup.Item>
      </Link>
    </ListGroup>
  )

export default Dispatch
