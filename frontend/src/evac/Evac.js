import React from "react";
import { Link } from "raviger";
import { ListGroup } from 'react-bootstrap';


  const Evac = () => (
    <ListGroup className="flex-fill p-5 h-50">
      <Link href="/evac/evacteam/new">
      <ListGroup.Item action>
      NEW TEAM
      </ListGroup.Item>
      </Link>
      <Link href="/evac/evacteam/list">
      <ListGroup.Item action>
      TEAM LIST
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
      <Link href="/">
      <ListGroup.Item action>
      BACK
      </ListGroup.Item>
      </Link>
    </ListGroup>
  )

export default Evac
