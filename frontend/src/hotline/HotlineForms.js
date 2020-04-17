import React from 'react';
import axios from "axios";
import { A, navigate } from "hookrouter";
import { Field, Form, useField, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Label,
  Row,
  Input,
  Container,
} from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from 'yup';

// No longer used but may still provide a good example for the time being.
export const NewOwnerForm = () => {
    return (
      <>
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            phone: '',
            best_contact: '',
            drivers_license: '',
            address: '',
            apartment: '',
            city: '',
            state: '',
            zip_code: '',
          }}
          validationSchema={Yup.object({
            first_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            last_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            phone: Yup.string(),
            best_contact: Yup.string(),
            drivers_license: Yup.string(),
            address: Yup.string(),
            apartment: Yup.string(),
            city: Yup.string(),
            state: Yup.string(),
            zip_code: Yup.string(),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              axios.post('http://localhost:3000/people/api/person/', values)
              .then(function() {
                navigate('/hotline');
              })
              .catch(e => {
                console.log(e);
              });
              setSubmitting(false);
            }, 500);
          }}
        >
          <Form>
            <Container>
              <FormGroup>
                <Row>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="First Name*"
                      name="first_name"
                      id="first_name"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="Last Name*"
                      name="last_name"
                      id="last_name"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="Phone"
                      name="phone"
                      id="phone"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="Drivers License"
                      name="drivers_license"
                      id="drivers_license"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="10">
                    <Field
                      type="textarea"
                      label="Best Contact"
                      name="best_contact"
                      id="best_contact"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="8">
                    <Field
                      type="text"
                      label="Address"
                      name="address"
                      id="address"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="2">
                    <Field
                      type="text"
                      label="Apartment"
                      name="apartment"
                      id="apartment"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="5">
                    <Field
                      type="text"
                      label="City"
                      name="city"
                      id="city"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="3">
                    <Field
                      type="text"
                      label="State"
                      name="state"
                      id="state"
                      component={ReactstrapInput}
                    />
                  </Col>
                  <Col xs="2">
                    <Field
                      type="text"
                      label="Zip Code"
                      name="zip_code"
                      id="zip_code"
                      component={ReactstrapInput}
                    />
                  </Col>
                </Row>
              </FormGroup>

              <Button type="submit" className="btn-success mr-1">Save</Button>
              <A className="btn btn-secondary" href="/evac">Cancel</A>
            </Container>
          </Form>
        </Formik>
      </>
    );
  };
