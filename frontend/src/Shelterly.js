import React, { Fragment, useContext } from "react";
import { useRoutes } from 'raviger';
import routes, { publicRoutes } from "./router";
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import PageNotFound from "./components/PageNotFound";
import { useCookies, withCookies } from 'react-cookie';
import { AuthContext } from "./accounts/AccountsReducer";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./components/Sidebar";

function Shelterly() {

  // Initial state.
  const { state, dispatch } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  const routeResult = useRoutes(state.user ? routes : publicRoutes)

  return (
    <ThemeProvider theme={theme}>
      <Container fluid>
        <Row>
          <Col xs="auto" className="pl-0">
            <Sidebar state={state} dispatch={dispatch} removeCookie={removeCookie} />
          </Col>
          <Col className='d-flex flex-column'>
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
