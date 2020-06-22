import React from "react";
import { Link } from "raviger";
import { EvacTeamForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";
import { Container, Row, Col, Tab,  Tabs } from 'react-bootstrap';
// import EvacNavBar from "./EvacNavbar";
import styled from 'styled-components';

export const StyledEvac = styled(Container)`
  transition: transform 0.3s ease-in-out;
  margin: flex;
  width: 50%;
  padding-top: 12rem;
  color: white;
  a {
    color: white !important;
    background-color: #454d55 !important; 
  }
  
`
export const StyledTabs = styled(Tabs)`
  color: white;
  background-color: #454d55;
`

const Evac = ({open, ...props}) => (
  <StyledEvac open={open} {...props}>
    <StyledTabs>
    <Tab eventKey="list" title="Evac Teams" >
      <EvacTeamTable />
    </Tab>
      <Tab eventKey="create" title="New Evac Team">
      <EvacTeamForm />
    </Tab>
    <Link href="">DEPLOY EVAC TEAM</Link>
    <Link href="">EVAC TEAM DEBRIEF</Link>
    </StyledTabs>
    <br/>
    <br/>
  </StyledEvac>
)

export default Evac
