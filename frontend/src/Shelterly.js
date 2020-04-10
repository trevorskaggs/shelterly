import React, {Fragment, useEffect, useReducer} from "react";
import axios from "axios";
import logo from "./static/images/nvadg_logo.png"
import {navigate, useRoutes, A} from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import {loadUser} from "./accounts/Accounts";
import auth, {initialState} from "./accounts/AccountsReducer";
import setAuthToken from "./accounts/setAuthToken";

const header_style = {
  textAlign: "center",
};

if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));

function Shelterly() {

  // Initial login state.
  const [state, dispatch] = useReducer(auth, initialState);
  // const UserContext = React.createContext(initialState);

  useEffect(() => {
    dispatch({ type: 'USER_LOADING' });
    let user_status = loadUser();
    user_status.then(function(results){
      console.log(results.data);
      dispatch({type: 'USER_LOADED', user: results.data });
    })
    .catch(e => {
      console.log('error: '+e);
      dispatch({type: "AUTHENTICATION_ERROR", data: e});
    })
    console.log("token "+localStorage.getItem('token'));
  }, []);

  // Redirect to login page if user is logged out.
  console.log(state);
  if (!state.user) {
    console.log('logged out');
    navigate('/login');
  }
  const routeResult = useRoutes(routes);
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
      <h1 style={header_style} className="col-12">
      <A href="/"><img src={logo} alt=""/></A>
      </h1>
      <hr className="mt-0 mb-4"/>
      <Fragment>
        {routeResult || <PageNotFound />}
      </Fragment>
      <div style={{textAlign: "right"}}>
      {state.isAuthenticated ? <button onClick={logoutUser}>logout {state.user.username}</button> : ''}
      </div>
    </div>
  );
}

export default Shelterly;
