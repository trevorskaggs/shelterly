import React, { Component, Fragment } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import ServiceRequestForm from "./ServiceRequestForm";

class ServiceRequestModal extends Component {
  state = {
    modal: false
  };

  toggle = () => {
    this.setState(previous => ({
      modal: !previous.modal
    }));
  };

  render() {
    const create = this.props.create;

    var title = "Editing Request";
    var button = <Button onClick={this.toggle}>Edit</Button>;
    if (create) {
      title = "New Service Request";

      button = (
        <Button
          color="primary"
          className="float-right"
          onClick={this.toggle}
          style={{ minWidth: "200px" }}
        >
          Create Service Request
        </Button>
      );
    }

    return (
      <Fragment>
        {button}
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{title}</ModalHeader>

          <ModalBody>
            <ServiceRequestForm
              resetState={this.props.resetState}
              toggle={this.toggle}
              service_request={this.props.service_request}
            />
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

export default ServiceRequestModal;