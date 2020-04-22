import React, {useEffect, useState} from 'react';
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
import { Switch } from 'formik-material-ui';
import { TextInput, Checkbox } from '.././components/Form';

// Form for creating new owner and reporter Person objects.
export const PersonForm = ({id}) => {

  const [data, setData] = useState({
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
  });

  // Hook for initializing data.
  useEffect(() => {
    console.log(id);
    if (id) {
      let source = axios.CancelToken.source();
      const fetchPersonData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('http://localhost:3000/people/api/person/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
        })
        .catch(e => {
          console.log(e);
        });
      };
      fetchPersonData();
    }
  }, []);

  return (
    <>
      <Formik
        initialValues={data}
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
            <A className="btn btn-secondary" href="/hotline">Cancel</A>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

// Form for creating new owner and reporter Person objects.
export function ServiceRequestForm({id}) {

  const [data, setData] = useState({
    directions: '',
    verbal_permission: false,
    key_provided: false,
    accessible: false,
    turn_around: false,
  });

  // Hook for initializing data.
  useEffect(() => {
    console.log(id);
    if (id) {
      let source = axios.CancelToken.source();
      const fetchServiceRequestData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('http://localhost:3000/hotline/api/servicerequests/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
        })
        .catch(e => {
          console.log(e);
        });
      };
      fetchServiceRequestData();
    }
  }, []);

  return (
    <>
      <Formik
        initialValues={data}
        validationSchema={Yup.object({
          directions: Yup.string()
            .required('Required')
            .max(2000, 'Must be 2000 characters or less'),
          verbal_permission: Yup.boolean(),
          key_provided: Yup.boolean(),
          accessible: Yup.boolean(),
          turn_around: Yup.boolean(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('http://localhost:3000/hotline/api/servicerequests/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + id + '/');
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }
          else {
            console.log(values);
            axios.post('http://localhost:3000/hotline/api/servicerequests/', values)
            .then(response => {
              navigate('/hotline/servicerequest/' + response.data.id + '/');
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }
        }}
      >
        <Form>
          <Container>
            <FormGroup>
              <Field
                type="textarea"
                label="Directions*"
                name="directions"
                id="directions"
                component={ReactstrapInput}
              />
              <Row>
              <Label htmlFor="verbal_permission">Verbal Permission</Label>
              <Field component={Switch} name="verbal_permission" type="checkbox" color="primary" />
              </Row>
              <Row>
              <Label htmlFor="key_provided">Key Provided</Label>
              <Field component={Switch} name="key_provided" type="checkbox" color="primary" />
              </Row>
              <Row>
              <Label htmlFor="accessible">Accessible</Label>
              <Field component={Switch} name="accessible" type="checkbox" color="primary" />
              </Row>
              <Row>
              <Label htmlFor="turn_around">Turn Around</Label>
              <Field component={Switch} name="turn_around" type="checkbox" color="primary" />
              </Row>
            </FormGroup>

            <Button type="submit" className="btn-success mr-1">Save</Button>
            <A className="btn btn-secondary" href="/hotline">Cancel</A>
          </Container>
        </Form>
      </Formik>
    </>
  );
}
