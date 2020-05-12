import React, { Fragment, useContext, useEffect } from "react";
import { Link, navigate, useRoutes } from 'raviger';
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import { useCookies, withCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { loadUser, logoutUser, setAuthToken } from "./accounts/AccountsUtils";
import logo from "./static/images/nvadg_logo.png"

const header_style = {
  textAlign: "center",
};

function Shelterly() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, , removeCookie] = useCookies(['token']);

  if (cookies.token) setAuthToken(cookies.token);

  useEffect(() => {
    // If we have a token but no user, attempt to authenticate them.
    if (!state.user && cookies.token) {
      loadUser({dispatch}, {removeCookie})
    }
  }, [dispatch, removeCookie, cookies.token]);

  // Redirect to login page if no authenticated user object is present.
  if (!state.user && !cookies.token) {
    if (!window.location.pathname.includes("login")) {
      navigate('/login');
    }
  }

  const routeResult = useRoutes(routes);

  return (
    <div>
      <h1 style={header_style} className="col-12">
        <Link href="/"><img src={logo} alt=""/></Link>
      </h1>
      <hr className="mt-0 mb-4"/>
      <Fragment>
        {routeResult || <PageNotFound />}
      </Fragment>
      <div style={{textAlign: "right"}}>
        {state.user ? <button className="btn btn-danger" onClick={() => logoutUser({dispatch}, {removeCookie})}>Logout {state.user.username}</button> : ''}
      </div>
    </div>
  );
}

export default withCookies(Shelterly);
