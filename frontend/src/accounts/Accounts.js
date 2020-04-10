import React from "react";
import axios from "axios";
import {navigate} from "hookrouter";
import {LoginForm} from "./AccountsForms";
import setAuthToken from "./setAuthToken";

const header_style = {
  textAlign: "center",
};

export const Login = () => (
  <div>
    <h1 style={header_style}>Login</h1>
    <LoginForm />
  </div>
)

export function logoutUser() {
  let headers = {
    "Content-Type": "application/json",
    // "Authorization": `Token ${localStorage.getItem('token')}`,
  };

  axios.post("http://localhost:8000/logout/", {}, {
    headers: headers
  })
  .then(function() {
    localStorage.removeItem("token");
    navigate('/login');
  })
  .catch(e => {
    console.log(e);
    localStorage.removeItem("token");
    navigate('/login');
  });
}

export async function loadUser() {
  if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));
  // if (localStorage.token) axios.defaults.headers.common['Authorization'] = `Token ${localStorage.token}`;

  // DISPATCH USER_LOADING
  // dispatch({ type: 'USER_LOADING' });

  let headers = {
    "Content-Type": "application/json",
    "Authorization": `Token ${localStorage.getItem('token')}`,
  };

  const user = await axios.get("http://localhost:8000/accounts/auth/user/", {
    headers: headers
  })
  return user;
}
