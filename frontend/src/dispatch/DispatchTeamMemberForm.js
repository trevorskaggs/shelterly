import React, { useState } from 'react';
import axios from "axios";
import { navigate } from "raviger";
import { Formik, } from 'formik';
import {
  Form as BootstrapForm,
  Button,
  ButtonGroup,
  Card,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { TextInput } from '.././components/Form.js';

const DispatchTeamMemberForm = () => {

  // Track whether or not to add another evac team member after saving.
  const [addAnother, setAddAnother] = useState(false);
  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  return (
    <Formik
      initialValues={{
        first_name: '',
        last_name: '',
        phone: '',
        agency_id: '',
      }}
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
        agency_id: Yup.string(),
      })}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        setTimeout(() => {
          axios.post('/evac/api/evacteammember/', values)
          .then(function () {
            if (addAnother) {
              resetForm();
            }
            else {
              navigate('/dispatch');
            }
          })
          .catch(error => {
            console.log(error.response);
          });
          setSubmitting(false);
        }, 500);
      }}
    >
      {form => (
        <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{ cursor: 'pointer' }} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>New Team Member</Card.Header>
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
            <Button onClick={() => { setAddAnother(true); form.submitForm() }}>Add Another</Button>
            <Button className="btn btn-primary border" onClick={() => { setAddAnother(false); form.submitForm() }} style={{paddingLeft:"78px"}}>Save</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default DispatchTeamMemberForm;
