import React, {Fragment, useContext, useEffect} from "react";
import {A, navigate, useRoutes} from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import {AuthContext} from "./accounts/AccountsReducer";
import {loadUser, logoutUser, setAuthToken} from "./accounts/AccountsUtils";
import logo from "./static/images/nvadg_logo.png"

const header_style = {
  textAlign: "center",
};

function Shelterly() {

  // Initial login state.
  const { state, dispatch } = useContext(AuthContext);
  if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));

  useEffect(() => {
    // If we have a token but no user, attempt to authenticate them.
    if (!state.user && localStorage.getItem('token')) {
      loadUser({dispatch});
    }
  }, []);

  // Redirect to login page if no authenticated user object is present.
  if (!state.user) {
    navigate('/login');
  }
  const routeResult = useRoutes(routes);

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
        {state.user ? <button className="btn btn-danger" onClick={() => logoutUser({dispatch})}>Logout {state.user.username}</button> : ''}
      </div>
    </div>
  );
}

export default Shelterly;
