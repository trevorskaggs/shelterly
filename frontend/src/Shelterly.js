import React, { Fragment, useCallback, useContext, useEffect } from "react";
import { navigate, useLocationChange, usePath, useRoutes } from 'raviger';
import routes, { publicRoutes } from "./router";
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import PageNotFound from "./components/PageNotFound";
import { useCookies, withCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { Container, Row, Col } from "react-bootstrap";
import { loadUser, setAuthToken } from "./accounts/AccountsUtils";
import Sidebar from "./components/Sidebar";

function Shelterly() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  if (cookies.token) setAuthToken(cookies.token);

  const path = usePath();
  const onChange = useCallback(path => dispatch({type: "PAGE_CHANGED", data: path}), []);
  useLocationChange(onChange);

  useEffect(() => {
    // If we have a token but no user, attempt to authenticate them.
    if (!state.user && cookies.token) {
      loadUser({dispatch}, {removeCookie})
    }
  }, []);

  // Redirect to login page if no authenticated user object is present.
  if (!state.user && !cookies.token) {
    if (!window.location.pathname.includes("login")) {
      navigate('/login?next=' + path);
    }
  }

  const routeResult = useRoutes(state.user ? routes : publicRoutes)

  return (
    <ThemeProvider theme={theme}>
    <Container fluid>
    <Row>
    <Col xs="auto" className="pl-0">
    <Sidebar state={state} dispatch={dispatch} removeCookie={removeCookie} />
    </Col>
    <Col> 
      <Fragment>
        {routeResult || <PageNotFound />}
      </Fragment>
      </Col>
      </Row>
    </Container>
    </ThemeProvider>
  );
}

export default withCookies(Shelterly);
