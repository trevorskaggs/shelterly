import React, { Fragment, useContext } from "react";
import axios from "axios";
import { useRoutes } from 'raviger';
import routes, { publicRoutes } from "./router";
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import PageNotFound from "./components/PageNotFound";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./components/Sidebar";
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator} from '@aws-amplify/ui-react';
Amplify.configure(awsconfig);

function Shelterly() {


  const routeResult = useRoutes(routes)
  Auth.currentSession().then(res=>{
    let accessToken = res.getIdToken()
    let jwt = accessToken.getJwtToken()
    //You can print them to see the full objects
    console.log(`myAccessToken: ${JSON.stringify(accessToken)}`)
    console.log(`myJwt: ${jwt}`)
    axios.defaults.headers.common['Authorization'] = `JWT ${jwt}`;
  })

  return (
    <ThemeProvider theme={theme}>
      <Container fluid>
        <Row>
          <Col xs="auto" className="pl-0">
            <Sidebar/>
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

export default withAuthenticator(Shelterly);
