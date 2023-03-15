import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Field, Formik } from 'formik';
import { Switch } from 'formik-material-ui';
import {
  Form as BootstrapForm,
  ButtonGroup,
  Card,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { TextInput } from '.././components/Form.js';
import ButtonSpinner from '../components/ButtonSpinner.js';
import { SystemErrorContext } from '../components/SystemError';

const UserForm = ({ id, incident }) => {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cell_phone: '',
    agency_id: '',
    user_perms: false,
    incident_perms: false,
    email_notification: false,
  })

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchUserData = async () => {
        // Fetch User data.
        await axios.get('/accounts/api/user/' + id + '/', {
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
      fetchUserData();
    }
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
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
        email: Yup.string()
          .max(50, 'Must be 50 characters or less')
          .required('Required'),
        cell_phone: Yup.string()
          .matches(phoneRegex, "Phone number is not valid")
          .required('Required'),
        agency_id: Yup.string().nullable(),
        user_perms: Yup.boolean(),
        incident_perms: Yup.boolean(),
        email_notification: Yup.boolean(),
      })}
      onSubmit={(values, { setFieldError, setSubmitting }) => {
        setTimeout(() => {
          if (id) {
            axios.put('/accounts/api/user/' + id + '/', values)
            .then(function () {
              navigate('/' + incident + '/accounts/user_management');
            })
            .catch(error => {
              setSubmitting(false);
              setShowSystemError(true);
            });
          }
          else {
            axios.post('/accounts/api/user/', values)
            .then(function () {
              navigate('/' + incident + '/accounts/user_management');
            })
            .catch(error => {
              if (error.response.data.email[0].includes('shelterly user with this email already exists')) {
                setFieldError("email", "A user with this email address already exists.");
              }
              setSubmitting(false);
              setShowSystemError(true);
            });
          }
        }, 500);
      }}
    >
      {form => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{id ? "Edit" : "New"} User</Card.Header>
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
                  label="Email*"
                  name="email"
                  id="email"
                  xs="6"
                />
                <TextInput
                  type="text"
                  label="Phone*"
                  name="cell_phone"
                  id="cell_phone"
                  xs="3"
                  value={form.values.cell_phone || ''}
                />
                <TextInput
                  type="text"
                  label="Agency ID"
                  name="agency_id"
                  id="agency_id"
                  xs="3"
                  value={form.values.agency_id || ''}
                />
              </BootstrapForm.Row>
              <BootstrapForm.Label htmlFor="user_perms">User Permissions</BootstrapForm.Label>
              <Field component={Switch} name="user_perms" id="user_perms" type="checkbox" color="primary" />
              <BootstrapForm.Label htmlFor="incident_perms">Incident Permissions</BootstrapForm.Label>
              <Field component={Switch} name="incident_perms" id="incident_perms" type="checkbox" color="primary" />
              <BootstrapForm.Label htmlFor="email_notification">SR Email Notification</BootstrapForm.Label>
              <Field component={Switch} name="email_notification" id="email_notification" type="checkbox" color="primary" />
            </BootstrapForm>
          </Card.Body>
          <ButtonGroup size="lg">
            <ButtonSpinner isSubmitting={form.isSubmitting} isSubmittingText="Saving..." onClick={() => { form.submitForm() }}>Save</ButtonSpinner>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default UserForm;
