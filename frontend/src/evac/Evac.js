import React from "react";
import { Link } from "raviger";
import { EvacTeamForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";
// import EvacNavBar from "./EvacNavbar";
import styled from 'styled-components';

export const StyledEvac = styled.div`
  transform: ${({ open }) => open ? 'translateX(50%)' : 'translateX(0)'};
  transition: transform 0.3s ease-in-out;
  margin: flex;
  width: 50%;
  padding-top: 12rem;
  
`
const Evac = ({open, ...props}) => (
  <StyledEvac open={open} {...props}>
  <div>
    <Link href="/evac/evacteam/new" style={{backgroundColor:"#375a7f",color:"white"}} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW EVAC TEAM</Link>
    <Link href="/evac/evacteam/list" style={{backgroundColor:"#375a7f",color:"white"}} className="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM LIST</Link>
    <Link href="" style={{backgroundColor:"#375a7f",color:"white"}} className="btn btn-warning btn-lg btn-block mb-2">DEPLOY EVAC TEAM</Link>
    <Link href="" style={{backgroundColor:"#375a7f",color:"white"}} className="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM DEBRIEF</Link>
    <br/>
    <br/>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
  </div>
  </StyledEvac>
)

export const NewTeam = ({open, ...props}) => (
  <StyledEvac open={open} {...props}>
  <div>
    {/* <EvacNavBar /> */}
    <h1 >Evac Team</h1>
    <EvacTeamForm />
  </div>
  </StyledEvac>
)

export const TeamList = ({open, ...props}) => (
  <StyledEvac open={open} {...props}>
  <div>
    {/* <EvacNavBar /> */}
    <h1 >Evac Teams</h1>
    <br/>
    <EvacTeamTable />
  </div>
  </ StyledEvac>
)

export default Evac
