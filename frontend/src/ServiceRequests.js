import React, { Component } from "react";
import { Col, Container, Row } from "reactstrap";
import ServiceRequestList from "./ServiceRequestList";
import ServiceRequestModal from "./ServiceRequestModal";

import axios from "axios";

class ServiceRequests extends Component {
  state = {
    service_requests: []
  };

  componentDidMount() {
    this.resetState();
  }

  getServiceRequests = () => {
    axios.get("http://localhost:8000/hotline/api/servicerequests/").then(res => this.setState({ service_requests: res.data })).catch((error) => {
        console.log(error) //Logs a string: Error: Request failed with status code 404
    });
  };

  resetState = () => {
    this.getServiceRequests();
  };

  render() {
    return (
      <Container style={{ marginTop: "20px" }}>
        <Row>
          <Col>
            <ServiceRequestList
              service_requests={this.state.service_requests}
              resetState={this.resetState}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <ServiceRequestModal create={true} resetState={this.resetState} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default ServiceRequests;