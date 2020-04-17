import React from "react";
import { A } from "hookrouter";
import { NewOwnerForm} from "./HotlineForms";

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

const Hotline = () => (
  <div style={btn_style}>
    <A href="/hotline/owner/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">OWNER CALLING</A>
    <A href="/hotline/reporter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">NON-OWNER CALLING</A>
    <A href="/hotline/request/list/search" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">SEARCH SERVICE REQUESTS</A>
    <br/>
    <br/>
    <A className="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
  </div>
)

export const NewOwner = () => (
  <div>
    <h1 style={header_style}>Owner Information</h1>
    <NewOwnerForm />
  </div>
)

// export const TeamList = () => (
//   <div>
//     <h1 style={header_style}>Evac Teams</h1>
//     <br/>
//     <EvacTeamTable />
//   </div>
// )

export default Hotline
