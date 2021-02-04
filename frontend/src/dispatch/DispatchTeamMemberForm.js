import React, { useState } from 'react';
import axios from "axios";
import { Link, navigate } from "raviger";
import { Form, Formik, } from 'formik';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  FormGroup,
  Row,
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
  const phoneRegex = /^[0-9]{10}$/

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
            <Form>
              <FormGroup>
                <Row>
                  <Col>
                    <TextInput
                      type="text"
                      label="First Name*"
                      name="first_name"
                      id="first_name"
                    />
                  </Col>
                  <Col>
                    <TextInput
                      type="text"
                      label="Last Name*"
                      name="last_name"
                      id="last_name"
                    />
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col>
                    <TextInput
                      type="text"
                      label="Phone*"
                      name="phone"
                      id="phone"
                    />
                  </Col>
                  <Col>
                    <TextInput
                      type="text"
                      label="Agency ID"
                      name="agency_id"
                      id="agency_id"
                    />
                  </Col>
                </Row>
              </FormGroup>
            </Form>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary mr-1" onClick={() => { setAddAnother(false); form.submitForm() }}>Save</Button>
            <Button type="button" className="btn btn-success mr-1" onClick={() => { setAddAnother(true); form.submitForm() }}>Add Another</Button>
            <Link className="btn btn-secondary" href="/dispatch">Cancel</Link>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
};

export default DispatchTeamMemberForm;
