import React, { useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { Formik } from "formik";
import axios from 'axios';
import * as Yup from 'yup';
import { FileUploader, TextInput } from '../components/Form.js';
import ButtonSpinner from './ButtonSpinner';
import { isImageFile } from '../utils/files.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const SystemErrorModal = (props) => {

  return (
    <>
    <Modal show={props.showSystemError} onHide={() => {props.setShowSystemError(false)}}>
      <Modal.Header closeButton>
        <Modal.Title>System Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Shelterly has encountered an unexpected error. If the problem persists please contact a system administrator for help.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => {props.setShowSystemError(false)}}>Ok</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

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
          <Modal.Title>Confirm Animal Cancelation</Modal.Title>
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
          .max(25, 'Name must be 25 characters or less.'),
        images: Yup.mixed().required(),
      })}
      onSubmit={ async (values, { resetForm }) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', props.images[0], props.images[0].name);
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
              label="Name"
            />
            <div className="ml-3">
              <span>Photo Document</span>
              <FileUploader
                value={props.images}
                id="image"
                name="image"
                parentStateSetter={props.setImages}
                maxNumber={1}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            {/* <Button variant="primary" onClick={() => { formikProps.submitForm() }} disabled={!isSubmitting && props.images && props.images.length ? false : true}>Save</Button> */}
            <ButtonSpinner isSubmitting={formikProps.isSubmitting} isSubmittingText="Saving..."  variant="primary" onClick={() => { formikProps.submitForm() }} disabled={!isSubmitting && props.images && props.images.length ? false : true}>Save</ButtonSpinner>
            <Button variant="secondary" onClick={props.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
    </>
  );
};

const PhotoDocumentEditModal = (props) => {

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
    <Formik
      initialValues={{name:props.image.name||props.image.url.split('/').pop().split('.')[0]}}
      enableReinitialize={true}
      validationSchema={Yup.object({
        name: Yup.string()
          .max(25, 'Name must be 25 characters or less.'),
      })}
      onSubmit={ async (values, { resetForm }) => {
        setIsSubmitting(true);
        await axios.patch(props.url, { "id":props.image.id, "edit_image": values.name })
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
            <Modal.Title>Edit Photo Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TextInput
              id="name"
              name="name"
              type="text"
              xs="8"
              label="Name"
            />
            <div className="ml-3">
              <span>Photo Document</span>
              <Card className="border rounded" style={{width:"153px", whiteSpace:"nowrap", overflow:"hidden" }}>
                {isImageFile(props.image.url) ? (
                      <Card.Img
                        className="border-bottom animal-hover-div"
                        variant="top"
                        src={props.image.url || "/static/images/image-not-found.png"}
                        style={{
                          width: "153px",
                          height: "153px",
                          objectFit: "cover",
                          overflow: "hidden",
                        }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        size="10x"
                        style={{ height: "153px", margin: "0 auto" }}
                      />
                    )}
              </Card>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => { formikProps.submitForm() }} disabled={isSubmitting}>Save</Button>
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

export { AnimalDeleteModal, DispatchAlreadyAssignedTeamModal, DispatchDuplicateSRModal, PhotoDocumentModal, PhotoDocumentEditModal, PhotoDocumentRemovalModal, SystemErrorModal };
