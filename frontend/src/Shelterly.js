import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, navigate, useRoutes } from 'raviger';
import routes from "./router";
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import PageNotFound from "./components/PageNotFound";
import { useCookies, withCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { loadUser, logoutUser, setAuthToken } from "./accounts/AccountsUtils";
import Sidebar from "./components/Sidebar"
import styled from 'styled-components';

export const StyledShelterly = styled.div`
  background: #444444;

`


function Shelterly() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [open, setOpen] = useState(false);

  if (cookies.token) setAuthToken(cookies.token);

  useEffect(() => {
    // If we have a token but no user, attempt to authenticate them.
    if (!state.user && cookies.token) {
      loadUser({dispatch}, {removeCookie})
    }
  }, []);

  // Redirect to login page if no authenticated user object is present.
  if (!state.user && !cookies.token) {
    if (!window.location.pathname.includes("login")) {
      navigate('/login');
    }
  }

  const routeResult = useRoutes(routes, {routeProps: { open: open }});

  return (
    <ThemeProvider theme={theme}>
    <StyledShelterly>
    <div>
    <Sidebar open={open} setOpen={setOpen} />
      <Fragment>
        {routeResult || <PageNotFound />}
      </Fragment>
    </div>
    </StyledShelterly>
    </ThemeProvider>
  );
}

export default withCookies(Shelterly);
