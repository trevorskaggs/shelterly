import React from "react";
import { A } from "hookrouter";
import {AnimalForm} from "./AnimalForms";
import {AnimalTable} from "./AnimalTables";

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

const Animals = () => (
  <div style={btn_style}>
    <A href="/animals/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">ANIMALS LIST</A>
    <A href="/animals/add" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">ADD ANIMAL</A>
    <br/>
    <br/>
    <A className="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
  </div>
)

export default Animals;
