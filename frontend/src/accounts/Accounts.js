import React from "react";
import { A } from "hookrouter";
import {LoginForm} from "./AccountsForms";


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

export const Login = () => (
  <div>
    <h1 style={header_style}>Evac Team</h1>
    <LoginForm />
  </div>
)
