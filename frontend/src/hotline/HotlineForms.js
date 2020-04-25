import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from 'formik';
import {
  Button,
  Col,
  FormGroup,
  Label,
  Row,
  Container,
} from 'reactstrap';
import { ReactstrapInput } from 'reactstrap-formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from 'yup';
import { Switch } from 'formik-material-ui';
// import { useQueryParam, NumberParam, StringParam } from 'use-query-params';

// Form for creating new owner and reporter Person objects.
export const PersonForm = ({id}) => {

  // Identify if this is an owner or reporter.
  var person_type = window.location.pathname.split("/hotline/")[1].split("/new")[0];

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

  const [queryParams] = useQueryParams();

  const {
    // Use object destructuring and a default value
    // if the param is not yet present in the URL.
    reporter_id = '',
    servicerequest_id = ''
  } = queryParams;

  console.log(queryParams);

  // Hook for initializing data.
  useEffect(() => {
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
        enableReinitialize={true}
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
          if (id) {
            axios.put('http://localhost:3000/people/api/person/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + servicerequest_id);
            })
            .catch(e => {
              console.log(e);
            });
          }
          else {
            axios.post('http://localhost:3000/people/api/person/', values)
            .then(response => {
              // If SR already exists, update it with owner info and redirect to the SR details.
              if (servicerequest_id) {
                axios.put('http://localhost:3000/hotline/api/servicerequests/' + servicerequest_id + '/', {owner:response.data.id})
                navigate('/hotline/servicerequests/' + servicerequest_id);
              }
              // If we have a reporter ID, redirect to create a new SR with owner + reporter IDs.
              else if (reporter_id) {
                console.log(reporter_id);
                navigate('/hotline/servicerequest/new?owner_id=' + response.data.id + '&reporter_id=' + reporter_id);
              }
              // If we're creating an owner without a reporter ID, redirect to create new SR with owner ID.
              else if (person_type === "owner") {
                navigate('/hotline/servicerequest/new?owner_id=' + response.data.id);
              }
              // Else create a reporter and redirect to create an owner.
              else {
                navigate('/hotline/owner/new?reporter_id=' + response.data.id);
              }
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
            {reporter_id ? <Link href={"/hotline/servicerequest/new?reporter_id=" + reporter_id} className="btn btn-primary mr-1">Skip Owner</Link> : ""}
            <Link className="btn btn-secondary" href="/hotline">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
};

// Form for creating new Service Request objects.
export function ServiceRequestForm({id}) {

  const [queryParams] = useQueryParams();

  const {
    owner_id = '',
    reporter_id = ''
  } = queryParams;

  console.log(queryParams)

  const [data, setData] = useState({
    owner: parseInt(owner_id),
    reporter: parseInt(reporter_id),
    directions: '',
    verbal_permission: false,
    key_provided: false,
    accessible: false,
    turn_around: false,
  });

  // Hook for initializing data.
  useEffect(() => {
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
        enableReinitialize={true}
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
          console.log(values);
          if (id) {
            axios.put('http://localhost:3000/hotline/api/servicerequests/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + id);
            })
            .catch(e => {
              console.log(e);
            });
            setSubmitting(false);
          }
          else {
            axios.post('http://localhost:3000/hotline/api/servicerequests/', values)
            .then(response => {
              navigate('/hotline/servicerequest/' + response.data.id);
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
              <Field type="hidden" value={owner_id||""} name="owner" id="owner"></Field>
              <Field type="hidden" value={reporter_id||""} name="reporter" id="reporter"></Field>
              <Field
                type="textarea"
                rows={5}
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
            <Link className="btn btn-secondary" href="/hotline">Cancel</Link>
          </Container>
        </Form>
      </Formik>
    </>
  );
}
