import React from "react";
import { Link } from "raviger";
import { EvacTeamForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";

const header_style = {
  textAlign: "center",
};

const link_style = {
  textDecoration: "none",
};

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const Evac = () => (
  <div style={btn_style}>
    <Link href="/evac/evacteam/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW EVAC TEAM</Link>
    <Link href="/evac/evacteam/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM LIST</Link>
    <Link href="" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">DEPLOY EVAC TEAM</Link>
    <Link href="" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">EVAC TEAM DEBRIEF</Link>
    <br/>
    <br/>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
  </div>
)

export const NewTeam = () => (
  <div>
    <h1 style={header_style}>Evac Team</h1>
    <EvacTeamForm />
  </div>
)

export const TeamList = () => (
  <div>
    <h1 style={header_style}>Evac Teams</h1>
    <br/>
    <EvacTeamTable />
  </div>
)

export default Evac
