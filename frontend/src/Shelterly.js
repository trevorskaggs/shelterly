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
  const [, , removeCookie] = useCookies(['token']);

  const routeResult = useRoutes(state.user ? routes : publicRoutes);

  const path = window.location.pathname;
  const organization = path.split('/')[1]

  const style = state.user && path !== '/' && path !== '/' + organization && !path.includes('/incident/') && !path.includes('accounts/user') && !path.includes('/reset_password') && !path.includes('/signup') ? {position:"absolute", marginLeft:"335px"} : {position:"absolute", maxWidth:"100%"};

  return (
    <ThemeProvider theme={theme}>
      <Container fluid>
        <Row>
          {state.user && path !== '/' && path !== '/' + organization && !path.includes('/incident/') && !path.includes('accounts/user') && !path.includes('/reset_password') && !path.includes('/signup') ?
          <span>
            <Sidebar state={state} dispatch={dispatch} removeCookie={removeCookie} />
          </span>
          : ""}
          <span className='d-flex flex-column col-9 pl-0 pr-0' style={style}>
            <Fragment>
              {routeResult || <PageNotFound state={state} />}
            </Fragment>
          </span>
        </Row>
      </Container>
    </ThemeProvider>
  );
}

export default withCookies(Shelterly);
