import React from "react";
import { A } from "hookrouter";
import { ShelterForm } from "./ShelterForms";
import { ShelterTable } from "./ShelterTables";

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

const Shelter = () => (
  <div style={btn_style}>
    <A href="/shelter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW SHELTER</A>
    <A href="/shelter/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">SEE ALL SHELTERS</A>
    <br/>
    <br/>
    <A className="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
  </div>
)

export const NewShelter = () => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <ShelterForm />
  </div>
)

export const ShelterList = () => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <br/>
    <ShelterTable />
  </div>
)

export default Shelter