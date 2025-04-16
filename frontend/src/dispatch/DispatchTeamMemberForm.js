import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Formik } from 'formik';
import {
  Form as BootstrapForm,
  Button,
  ButtonGroup,
  Card,
  Modal,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { TextInput } from '.././components/Form.js';
import ButtonSpinner from '../components/ButtonSpinner.js';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

const DispatchTeamMemberForm = ({ id, incident, organization }) => {

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);

  // Track whether or not to add another evac team member after saving.
  const [addAnother, setAddAnother] = useState(false);
  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    agency_id: '',
    incident: state ? state.incident.id : 'undefined',
  })

  const handleConfirm = () => {
    axios.delete(`/evac/api/evacteammember/${id}/`)
      .then(() => {
        navigate('/' + organization + '/' + incident + '/dispatch/teammanagement');
      })
      .catch(error => {
        setShowSystemError(true);
      });
  };

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchTeamMember = async () => {
        // Fetch Visit Note data.
        await axios.get('/evac/api/evacteammember/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData(response.data);
          }
        })
        .catch(error => {
          if (!unmounted) {
            setShowSystemError(true);
          }
        });
      };
      fetchTeamMember();
    };
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        first_name: Yup.string()
          .max(50, 'Must be 50 characters or less')
          .required('Required'),
        last_name: Yup.string()
          .max(50, 'Must be 50 characters or less')
          .required('Required'),
        phone: Yup.string()
          .matches(phoneRegex, "Phone number is not valid")
          .required('Required'),
        agency_id: Yup.string()
          .max(20, 'Must be 20 characters or less'),
      })}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        if (id) {
          axios.put('/evac/api/evacteammember/' + id + '/', values)
          .then(function () {
            navigate('/' + organization + '/' + incident + '/dispatch/teammanagement');
          })
          .catch(error => {
            setSubmitting(false);
            setShowSystemError(true);
          });
        }
        else {
          axios.post('/evac/api/evacteammember/', values)
          .then(function () {
            if (addAnother) {
              resetForm();
            }
            else {
              navigate('/' + organization + '/' + incident + '/dispatch/teammanagement');
            }
          })
          .catch(error => {
            setSubmitting(false);
            setShowSystemError(true);
          });
        }
      }}
    >
      {form => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3">
            <span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{ id ? "Edit" : "New"} Team Member
            <OverlayTrigger
              key={"delete-team-member"}
              placement="left"
              overlay={
                <Tooltip id={`tooltip-delete-team-member`}>
                  Permanently delete team member
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faTimes} className="float-right" size="lg" onClick={() => {setShowModal(true);}} style={{cursor:'pointer'}} inverse />
            </OverlayTrigger>
          </Card.Header>
          <Card.Body>
            <BootstrapForm>
              <BootstrapForm.Row>
                <TextInput
                  type="text"
                  label="First Name*"
                  name="first_name"
                  id="first_name"
                  xs="6"
                />
                <TextInput
                  type="text"
                  label="Last Name*"
                  name="last_name"
                  id="last_name"
                  xs="6"
                />
              </BootstrapForm.Row>
              <BootstrapForm.Row>
                <TextInput
                  type="text"
                  label="Phone*"
                  name="phone"
                  id="phone"
                  xs="6"
                />
                <TextInput
                  type="text"
                  label="Agency ID"
                  name="agency_id"
                  id="agency_id"
                  xs="6"
                />
              </BootstrapForm.Row>
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            { !id ? <ButtonSpinner isSubmitting={form.isSubmitting && addAnother} isSubmittingText="Saving..." onClick={() => { setAddAnother(true); form.submitForm() }}>Add Another</ButtonSpinner> : ""}
            <ButtonSpinner isSubmitting={form.isSubmitting && !addAnother} isSubmittingText="Saving..." className="btn btn-primary border" onClick={() => { setAddAnother(false); form.submitForm() }} style={{paddingLeft:"78px"}}>Save</ButtonSpinner>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Team Member Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        This action will permanently delete this team member. Are you sure you want to proceed?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleConfirm}>
          Yes
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          No
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default DispatchTeamMemberForm;
