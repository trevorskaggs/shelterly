import React from 'react';
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
          <Modal.Title>Confirm Animal Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you would like to remove animal {props.name || "Unknown"}?
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

  return (
    <>
    <Formik
      initialValues={{name:'', images:[]}}
      enableReinitialize={true}
      validationSchema={Yup.object({
        name: Yup.string()
          .max(50, 'Must be 20 characters or less.'),
        images: Yup.mixed(),
      })}
      onSubmit={ async (values, { setSubmitting, resetForm }) => {
        const formData = new FormData();
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        }
        formData.append('image', props.images[0].file, props.images[0].file.name);
        await axios.patch(props.url, formData)
        .then(response => {
          props.setData(prevState => ({ ...prevState, "images":response.data.images}));
          props.handleClose();
          resetForm();
        })
        .catch(error => {
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
              id="filename"
              name="filename"
              type="text"
              xs="8"
              label="Filename"
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
            <Button variant="primary" onClick={() => { formikProps.submitForm() }} disabled={props.images.length ? false : true}>Yes</Button>
            <Button variant="secondary" onClick={props.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
    </>
  );
};

export { AnimalDeleteModal, DispatchAlreadyAssignedTeamModal, DispatchDuplicateSRModal, PhotoDocumentModal };
