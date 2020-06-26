import React from "react";
import { Link } from "raviger";
import { EvacTeamForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";
import { Container, ListGroup,  Tabs } from 'react-bootstrap';
// import EvacNavBar from "./EvacNavbar";
import styled from 'styled-components';


  const Evac = () => (
    <ListGroup className="flex-fill align-self-center">
      <ListGroup.Item action>
      <Link href="/evac/evacteam/new">NEW TEAM</Link>
      </ListGroup.Item>
      <ListGroup.Item action>
      <Link href="/evac/evacteam/list">TEAM LIST</Link>
      </ListGroup.Item>
      <ListGroup.Item action>
      <Link href="">DEPLOY</Link>
      </ListGroup.Item>
      <ListGroup.Item action>
      <Link href="">DEBRIEF</Link>
      </ListGroup.Item>
      <ListGroup.Item action>
      <Link href="/">BACK</Link>
      </ListGroup.Item>
    </ListGroup>
  )

export default Evac
