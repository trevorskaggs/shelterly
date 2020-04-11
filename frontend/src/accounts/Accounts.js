import React from "react";
import {LoginForm} from "./AccountsForms";

const header_style = {
  textAlign: "center",
};

export const Login = () => (
  <div>
    <h1 style={header_style}>Login</h1>
    <LoginForm />
  </div>
)
