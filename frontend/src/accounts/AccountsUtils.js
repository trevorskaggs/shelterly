import axios from "axios";
import {navigate} from "hookrouter";

// Authenticate the user with the backnd to obtain a user.
export function loadUser({dispatch}) {
  // Set token for axios requests.
  if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));

  // Set user loading state.
  dispatch({ type: 'USER_LOADING' });

  let headers = {
    "Content-Type": "application/json",
  };

  // Check backend for authentication and return user information if valid.
  axios.get("http://localhost:8000/accounts/auth/user/", {
    headers: headers
  })
  .then(function(results){
    // Set the user state.
    dispatch({type: 'USER_LOADED', user: results.data });
  })
  .catch(e => {
    console.log('error: '+e);

    // Raise error.
    dispatch({type: "AUTHENTICATION_ERROR", data: e});
  })
}

// Log the user out of the system.
export function logoutUser({dispatch}) {
  let headers = {
    "Content-Type": "application/json",
  };

  // Log the user out of Django invalidating the token.
  axios.post("http://localhost:8000/logout/", {}, {
    headers: headers
  })
  .then(function() {
    // Logout user out of frontend by removing the token.
    dispatch({ type: 'LOGOUT_SUCCESSFUL' });
    // Redirect to login page.
    navigate('/login');
  })
  .catch(e => {
    console.log(e);
    // Raise error.
    dispatch({type: "LOGOUT_FAILED", data: e});
  });
}

export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
