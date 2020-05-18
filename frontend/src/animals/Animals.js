import React from "react";
import { Link } from "raviger";
import {AnimalView} from "./AnimalViews";
import AnimalForm from "./AnimalForms";

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
    <Link href="/animals/animal/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">ANIMALS LIST</Link>
    <Link href="/animals/animal/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">ADD ANIMAL</Link>
    <br/>
    <br/>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
  </div>
)

export const AnimalDetail = ({id}) => (
  <div>
    <AnimalView id={id} />
  </div>
)

export const UpdateAnimal = ({id}) => (
  <div>
    <h1 style={header_style}>Update Animal</h1>
    <AnimalForm id={id} />
  </div>
)

export default Animals;
