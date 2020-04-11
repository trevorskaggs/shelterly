import React, {Fragment, useContext, useEffect, useReducer} from "react";
import axios from "axios";
import {navigate, useRoutes, A} from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import {CounterContext} from "./accounts/AccountsReducer";
import setAuthToken from "./accounts/setAuthToken";

if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));
function Shelterly() {

  // Initial login state.
  const { state, dispatch } = useContext(CounterContext);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadUser();
    }
    console.log("token "+localStorage.getItem('token'));
  }, []);

  // Redirect to login page if user is logged out.
  console.log(state);
  if (!state.user) {
    console.log('logged out');
    navigate('/login');
  }
  const routeResult = useRoutes(routes);

  // Login
  function loadUser() {
    if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));

    // DISPATCH USER_LOADING
    dispatch({ type: 'USER_LOADING' });

    let headers = {
      "Content-Type": "application/json",
    };

    axios.get("http://localhost:8000/accounts/auth/user/", {
      headers: headers
    })
    .then(function(results){
      console.log(results.data);
      dispatch({type: 'USER_LOADED', user: results.data });
    })
    .catch(e => {
      console.log('error: '+e);
      dispatch({type: "AUTHENTICATION_ERROR", data: e});
    })
  }

  // Logout
  function logoutUser() {
    let headers = {
      "Content-Type": "application/json",
    };
  
    axios.post("http://localhost:8000/logout/", {}, {
      headers: headers
    })
    .then(function() {
      dispatch({ type: 'LOGOUT_SUCCESSFUL' });
      navigate('/login');
    })
    .catch(e => {
      console.log(e);
    });
  }

  return (
    <div>
      <Fragment>
        {routeResult || <PageNotFound />}
      </Fragment>
      <div style={{textAlign: "right"}}>
      {state.isAuthenticated ? <button onClick={logoutUser}>logout </button> : ''}
      </div>
    </div>
  );
}

export default Shelterly;
