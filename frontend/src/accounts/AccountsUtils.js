import axios from "axios";
import { navigate } from "raviger";

// Authenticate the user with the backnd to obtain a user.
export function loadUser({dispatch, removeCookie}) {

  // Set user loading state.
  dispatch({ type: 'USER_LOADING' });

  // Check backend for authentication and return user information if valid.
  axios.get("/accounts/api/user/auth/")
  .then(function(results){
    // Set the user state.
    dispatch({type: 'USER_LOADED', user: results.data });
  })
  .catch(e => {
    // Raise error.
    removeCookie("token", {path: '/'});
    setAuthToken();
    dispatch({type: "AUTHENTICATION_ERROR", data: e});
    navigate('/');
  })
}

// Log the user out of the system.
export function logoutUser({dispatch}, {removeCookie}) {

  // Log the user out of Django invalidating the token.
  axios.post("/logout/")
  .then(function() {
    // Logout user out of frontend by removing the token.
    removeCookie("token", {path: '/'});
    setAuthToken();
    dispatch({ type: 'LOGOUT_SUCCESSFUL' });
    // Redirect to login page.
    navigate('/');
  })
  .catch(e => {
    removeCookie("token", {path: '/'});
    setAuthToken();
    // Raise error.
    dispatch({type: "LOGOUT_FAILED", data: e});
  });
}

export function setAuthToken(token) {
  if (token) {
    // if we have a token, set as default axios token
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
