import React from "react";
import { Link } from "raviger";
import { EvacTeamForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";
import { Container, Row, Col, Tab,  Tabs } from 'react-bootstrap';
// import EvacNavBar from "./EvacNavbar";
import styled from 'styled-components';

export const StyledEvac = styled(Container)`
  transform: ${({ open }) => open ? 'translateX(50%)' : 'translateX(0)'};
  transition: transform 0.3s ease-in-out;
  margin: flex;
  width: 50%;
  padding-top: 12rem;
  
`

const Evac = ({open, ...props}) => (
  <StyledEvac open={open} {...props}>
    <Tabs>
    <Tab eventKey="list" title="Evac Teams" >
      <EvacTeamTable />
    </Tab>
      <Tab eventKey="create" title="New Evac Team">
      <EvacTeamForm />
    </Tab>
    <Link href="">DEPLOY EVAC TEAM</Link>
    <Link href="">EVAC TEAM DEBRIEF</Link>
    </Tabs>
    <br/>
    <br/>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
  </StyledEvac>
)

export default Evac
