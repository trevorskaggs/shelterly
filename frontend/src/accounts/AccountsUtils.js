import axios from "axios";
import { navigate } from "raviger";
import { publicRoutes } from "../router";

// Authenticate the user with the backnd to obtain a user.
export function loadUser({state, dispatch, removeCookie, path}) {

  // Set user loading state.
  dispatch({ type: 'USER_LOADING' });

  // Check backend for authentication and return user information if valid.
  axios.get("/accounts/api/user/auth/?organization=" + state.organization.id + "&incident=" + state.incident.id)
  .then(function(results){
    // Set the user state.
    dispatch({type: 'USER_LOADED', user: results.data });
  })
  .catch(e => {
    // Raise error.
    // removeCookie("token");
    // setAuthToken();
    dispatch({type: "AUTHENTICATION_ERROR", data: e});
    if (!Object.keys(publicRoutes).includes(path)) {
      navigate('/login?next=' + path);
    }
  })
}

// Log the user out of the system.
export function logoutUser({dispatch}, {removeCookie}) {

  // Log the user out of Django invalidating the token.
  axios.post("/logout/")
  .then(function() {
    // Logout user out of frontend by removing the token.
    removeCookie("token");
    setAuthToken();
    dispatch({ type: 'LOGOUT_SUCCESSFUL' });
    navigate('/login')
  })
  .catch(e => {
    // removeCookie("token");
    // setAuthToken();
    // Raise error.
    dispatch({type: "LOGOUT_FAILED", data: e});
  });
}

export function setAuthToken(token, csrftoken) {
  if (token) {
    // if we have a token, set as default axios token
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    axios.defaults.headers.post['X-CSRF-Token'] = csrftoken;
  } else {
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.post['X-CSRF-Token'];
  }
};
