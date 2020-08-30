import React from "react";
import { Link } from "raviger";
import { EvacTeamMemberForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";
import { Container, ListGroup,  Tabs } from 'react-bootstrap';
// import EvacNavBar from "./EvacNavbar";
import styled from 'styled-components';

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
      <Link href="/evac/evacteam/list">
      <ListGroup.Item action>
      TEAM LIST
      </ListGroup.Item>
      </Link>
      <Link href="">
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


  export const NewEvacTeamMember = () => (
    <div>
      <h1 style={header_style}>Add Evacuation Team Member</h1>
      <EvacTeamMemberForm />
    </div>
  )


export default Evac
