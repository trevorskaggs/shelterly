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
          {state.user ?
          <span>
            {/* <Col xs="auto" className="pl-0"> */}
              <Sidebar state={state} dispatch={dispatch} removeCookie={removeCookie} />
            {/* </Col> */}
          </span>
          : ""}
          <span className='d-flex flex-column col-9' style={{position:"absolute", marginLeft:"335px"}}>
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
