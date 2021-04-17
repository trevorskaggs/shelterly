import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const DispatchDuplicateSRModal = (props) => {

  return (
    <>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Duplicate Service Requests Assigned</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The following service requests have already had a team deployed to them:
          </p>
          <p>
            {props.dupe_list.map(service_request => (
              <li key={service_request.id} style={{marginLeft:"10px"}}><span style={{position:"relative", left:"-8px"}}>{service_request.full_address}</span></li>
            ))}
          </p>
          <p style={{marginBottom:"-5px"}}>
            Please choose from the following options:
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleReselect}>Go Back and Reselect</Button>
          <Button variant="primary" onClick={props.handleSubmit} disabled={props.sr_list.length === props.dupe_list.length ? true : false}>Continue Without Duplicates</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export { DispatchDuplicateSRModal };
