import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Formik } from "formik";
import axios from 'axios';
import * as Yup from 'yup';
import { ImageUploader, TextInput } from '../components/Form.js';

const DispatchDuplicateSRModal = (props) => {

  return (
    <>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Duplicate Service Requests Assigned</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The following service requests already have an open dispatch assignment:
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

const DispatchAlreadyAssignedTeamModal = (props) => {

  return (
    <>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Team Members Already Dispatched</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The following team members are already assigned to an active dispatch:
          </p>
          <p>
            {props.team_options.filter(team_member => team_member.is_assigned === true && !team_member.label.includes(":") && props.team_members.includes(team_member.id[0])).map(team_member => (
              <li key={team_member.id[0]} style={{marginLeft:"10px"}}><span style={{position:"relative", left:"-8px"}}>{team_member.label}</span></li>
            ))}
          </p>
          <p style={{marginBottom:"-5px"}}>
            Are you sure you still want to proceed?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>Go Back and Reselect</Button>
          <Button variant="primary" onClick={() => {props.setProceed(true);props.handleSubmit();}}>Yes</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const AnimalDeleteModal = (props) => {

  return (
    <>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Animal Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you would like to cancel animal {props.name || "Unknown"}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={props.handleSubmit}>Yes</Button>
          <Button variant="secondary" onClick={props.handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const PhotoDocumentModal = (props) => {

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
    <Formik
      initialValues={{name:'', images:[]}}
      enableReinitialize={true}
      validationSchema={Yup.object({
        name: Yup.string()
          .max(25, 'Must be 25 characters or less.'),
        images: Yup.mixed().required(),
      })}
      onSubmit={ async (values, { resetForm }) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', props.images[0].file, props.images[0].file.name);
        formData.append('name', values.name);
        await axios.patch(props.url, formData)
        .then(response => {
          props.setData(prevState => ({ ...prevState, "images":response.data.images}));
          props.handleClose();
          resetForm();
          setIsSubmitting(false);
        })
        .catch(error => {
          setIsSubmitting(false);
        });
      }}
      >
      {formikProps => (
        <Modal show={props.show} onHide={props.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add Photo Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TextInput
              id="name"
              name="name"
              type="text"
              xs="8"
              label="Display Name"
            />
            <div className="ml-3">
              <span>Photo Document</span>
              <ImageUploader
                value={props.images}
                id="image"
                name="image"
                parentStateSetter={props.setImages}
                maxNumber={1}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => { formikProps.submitForm() }} disabled={!isSubmitting && props.images && props.images.length ? false : true}>Yes</Button>
            <Button variant="secondary" onClick={props.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
    </>
  );
};

const PhotoDocumentRemovalModal = (props) => {

  return (
    <>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Photo Document Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you would like to remove photo document {props.image.name||props.image.url.split('/').pop().split('.')[0]}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={props.handleSubmit}>Yes</Button>
          <Button variant="secondary" onClick={props.handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export { AnimalDeleteModal, DispatchAlreadyAssignedTeamModal, DispatchDuplicateSRModal, PhotoDocumentModal, PhotoDocumentRemovalModal };
