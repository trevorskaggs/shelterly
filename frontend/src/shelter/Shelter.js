import React from "react";
import { Link } from 'raviger';
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
    <Link href="/shelter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW SHELTER</Link>
    <Link href="/shelter/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">SEE ALL SHELTERS</Link>
    <br/>
    <br/>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
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