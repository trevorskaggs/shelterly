import React from "react";
import { Link } from "raviger";
import { ListGroup } from 'react-bootstrap';

const header_style = {
  textAlign: "center",
};

  const Evac = () => (
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/evac/evacteammember/new">
        <ListGroup.Item action>ADD TEAM MEMBER</ListGroup.Item>
      </Link>
      <Link href="/evac/deploy">
        <ListGroup.Item action>DEPLOY</ListGroup.Item>
      </Link>
    </ListGroup>
  )

export default Evac
