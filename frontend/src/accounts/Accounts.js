import React from "react";
import axios from "axios";
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

// export const loadUser = async () => {
export async function loadUser() {
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

  //   // DISPATCH USER_LOADED
  //   // dispatch({ type: 'USER_LOADED', payload: data });
  // .catch(e => {
  //   console.log('no');
  //   return {logged_in:false, user:e}
  //   // DISPATCH AUTH_ERROR
  //   // dispatch({ type: 'AUTH_ERROR' });
  // });
    // return fetch("http://localhost:8000/accounts/api/user/", {headers, })
    //   .then(response => {
    //     if (response.status < 500) {
    //       return response.json().then(data => {
    //         return {status: response.status, data};
    //       })
    //     } else {
    //       console.log("Server Error!");
    //       throw response;
    //     }
    //   })
    //   .then(response => {
    //     if (response.status === 200) {
    //       dispatch({type: 'USER_LOADED', user: response.data });
    //       return response.data;
    //     } else if (response.status >= 400 && response.status < 500) {
    //       dispatch({type: "AUTHENTICATION_ERROR", data: response.data});
    //       throw response.data;
    //     }
    //   })
  // }
}

// export const login = (username, password) => {
//   return (dispatch, getState) => {
//     let headers = {"Content-Type": "application/json"};
//     let body = JSON.stringify({username, password});

//     return fetch("http://localhost:8000/login", {headers, body, method: "POST"})
//       .then(response => {
//         if (response.status < 500) {
//           return response.json().then(data => {
//             return {status: response.status, data};
//           })
//         } else {
//           console.log("Server Error!");
//           throw response;
//         }
//       })
//       .then(response => {
//         if (response.status === 200) {
//           dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
//           return response.data;
//         } else if (response.status === 403 || response.status === 401) {
//           dispatch({type: "AUTHENTICATION_ERROR", data: response.data});
//           throw response.data;
//         } else {
//           dispatch({type: "LOGIN_FAILED", data: response.data});
//           throw response.data;
//         }
//       })
//   }
// }
