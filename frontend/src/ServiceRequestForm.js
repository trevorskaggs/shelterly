import React from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";

import axios from "axios";

class ServiceRequestForm extends React.Component {
  state = {
    pk: 0,
    address: ""
  };

  componentDidMount() {
    if (this.props.service_request) {
      const { pk, address} = this.props.service_request;
      this.setState({ pk, address});
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  createServiceRequest = e => {
    e.preventDefault();
    axios.post("http://localhost:8000/hotline/api/servicerequests/", this.state).then(() => {
      this.props.resetState();
      this.props.toggle();
    }).catch((error) => {
        console.log(error) //Logs a string: Error: Request failed with status code 404
    });
  };

  editServiceRequest = e => {
    e.preventDefault();
    axios.put("http://localhost:8000/hotline/api/servicerequests/" + this.state.pk, this.state).then(() => {
      this.props.resetState();
      this.props.toggle();
    }).catch((error) => {
        console.log(error) //Logs a string: Error: Request failed with status code 404
    });
  };

  defaultIfEmpty = value => {
    return value === "" ? "" : value;
  };

  render() {
    return (
      <Form onSubmit={this.props.service_request ? this.ediServiceRequest : this.createServiceRequest}>
        <FormGroup>
          <Label for="address">Address:</Label>
          <Input
            type="text"
            name="address"
            onChange={this.onChange}
            value={this.defaultIfEmpty(this.state.address)}
          />
        </FormGroup>
        <Button>Send</Button>
      </Form>
    );
  }
}

export default ServiceRequestForm;