import React, { Fragment, useContext } from "react";
import { useRoutes } from 'raviger';
import routes, { publicRoutes } from "./router";
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import PageNotFound from "./components/PageNotFound";
import { useCookies, withCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { Container, Row } from "react-bootstrap";
import Sidebar from "./components/Sidebar";

function Shelterly() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  const routeResult = useRoutes(state.user ? routes : publicRoutes);

  const style = state.user ? {position:"absolute", marginLeft:"335px"} : {position:"absolute", maxWidth:"100%"}

  return (
    <ThemeProvider theme={theme}>
      <Container fluid>
        <Row>
          {state.user ?
          <span>
            <Sidebar state={state} dispatch={dispatch} removeCookie={removeCookie} />
          </span>
          : ""}
          <span className='d-flex flex-column col-9 h-100' style={style}>
            <Fragment>
              {routeResult || <PageNotFound />}
            </Fragment>
          </span>
        </Row>
      </Container>
    </ThemeProvider>
  );
}

export default withCookies(Shelterly);
