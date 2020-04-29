import React, { useEffect, useState } from 'react';
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
import 'flatpickr/dist/themes/light.css';
import { FlatpickrField } from '../components/Form';

// Form for creating new owner and reporter Person objects.
export const PersonForm = ({id}) => {

  // Determine if this is an owner or reporter when creating a Person.
  var is_owner = window.location.pathname.includes("owner")

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/
  const nameRegex = /^[a-z ,.'-]+$/i

  // Initial Person data.
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

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    reporter_id = '',
    servicerequest_id = ''
  } = queryParams;

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    if (id) {
      const fetchPersonData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('http://localhost:3000/people/api/person/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          console.log(error.response);
        });
      };
      fetchPersonData();
    }
    // Cleanup.
    return () => {
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
            .matches(nameRegex, "Name is not valid")
            .required('Required'),
          last_name: Yup.string()
            .max(50, 'Must be 50 characters or less')
            .matches(nameRegex, "Name is not valid")
            .required('Required'),
          phone: Yup.string()
            .matches(phoneRegex, "Phone number is not valid"),
          best_contact: Yup.string(),
          drivers_license: Yup.string(),
          address: Yup.string(),
          apartment: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          city: Yup.string(),
          state: Yup.string(),
          zip_code: Yup.string()
            .max(10, 'Must be 10 characters or less'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('http://localhost:3000/people/api/person/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + servicerequest_id);
            })
            .catch(error => {
              console.log(error.response);
            });
          }
          else {
            axios.post('http://localhost:3000/people/api/person/', values)
            .then(response => {
              // If SR already exists, update it with owner info and redirect to the SR details.
              if (servicerequest_id) {
                axios.patch('http://localhost:3000/hotline/api/servicerequests/' + servicerequest_id + '/', {owner:response.data.id})
                .then(function() {
                  navigate('/hotline/servicerequest/' + servicerequest_id);
                })
                .catch(error => {
                  console.log(error.response);
                });
              }
              // If we have a reporter ID, redirect to create a new SR with owner + reporter IDs.
              else if (reporter_id) {
                navigate('/hotline/servicerequest/new?owner_id=' + response.data.id + '&reporter_id=' + reporter_id);
              }
              // If we're creating an owner without a reporter ID, redirect to create new SR with owner ID.
              else if (is_owner) {
                navigate('/hotline/servicerequest/new?owner_id=' + response.data.id);
              }
              // Else create a reporter and redirect to create an owner.
              else {
                navigate('/hotline/owner/new?reporter_id=' + response.data.id);
              }
            })
            .catch(error => {
              console.log(error.response);
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

  // Determines if this is a brand new SR to control which fields to display.
  var is_new = window.location.pathname.includes("new")

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = '',
    reporter_id = ''
  } = queryParams;

  // Initial ServiceRequest data.
  const [data, setData] = useState({
    owner: owner_id,
    reporter: reporter_id,
    directions: '',
    verbal_permission: false,
    key_provided: false,
    accessible: false,
    turn_around: false,
    forced_entry: false,
    outcome: '',
    owner_notification_notes: '',
    recovery_time: null,
    owner_notification_tstamp: null,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    if (id) {
      const fetchServiceRequestData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('http://localhost:3000/hotline/api/servicerequests/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          console.log(error.response);
        });
      };
      fetchServiceRequestData();
    }
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [id]);

  return (
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
          forced_entry: Yup.boolean(),
          outcome: Yup.string()
            .max(2000, 'Must be 2000 characters or less'),
          owner_notification_notes: Yup.string()
            .max(2000, 'Must be 2000 characters or less'),
          recovery_time: Yup.date()
           .nullable(),
          owner_notification_tstamp: Yup.date()
            .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('http://localhost:3000/hotline/api/servicerequests/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + id);
            })
            .catch(error => {
              console.log(error.response);
            });
            setSubmitting(false);
          }
          else {
            axios.post('http://localhost:3000/hotline/api/servicerequests/', values)
            .then(response => {
              navigate('/hotline/servicerequest/' + response.data.id);
            })
            .catch(error => {
              console.log(error.response);
            });
            setSubmitting(false);
          }
        }}
      >
        {props => (
        <Form>
          <Container>
            <Field type="hidden" value={owner_id||""} name="owner" id="owner"></Field>
            <Field type="hidden" value={reporter_id||""} name="reporter" id="reporter"></Field>
            <FormGroup hidden={is_new}>
              <Field
                type="textarea"
                rows={5}
                label="Outcome"
                name="outcome"
                id="outcome"
                component={ReactstrapInput}
                value={data.outcome||""}
              />
              <Field
                type="textarea"
                rows={5}
                label="Owner Notification Notes"
                name="owner_notification_notes"
                id="owner_notification_notes"
                component={ReactstrapInput}
                value={data.owner_notification_notes||""}
              />
              <Row>
                <Label htmlFor="forced_entry">Forced Entry</Label>
                <Field component={Switch} name="forced_entry" type="checkbox" color="primary" />
              </Row>
              <Row>
                <FlatpickrField
                  label="Recovery Time"
                  name="recovery_time"
                  id="recovery_time"
                  onChange={(date, dateStr) => {
                    props.setFieldValue("recovery_time", dateStr)
                  }}
                  value={data.recovery_time||null}
                />
              </Row>
              <Row>
                <FlatpickrField
                  label="Owner Notified"
                  name="owner_notification_tstamp"
                  id="owner_notification_tstamp"
                  onChange={(date, dateStr) => {
                    props.setFieldValue("owner_notification_tstamp", dateStr)
                  }}
                  value={data.owner_notification_tstamp||null}
                />
              </Row>
              <hr/>
            </FormGroup>
            <FormGroup>
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
        )}
      </Formik>
  );
}
