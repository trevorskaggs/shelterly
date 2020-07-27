import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from 'formik';
import {
  CustomInput,
  Label,
  Fade,
} from 'reactstrap';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, FormGroup, Row } from "react-bootstrap";
import * as Yup from 'yup';
import { Switch } from 'formik-material-ui';
import 'flatpickr/dist/themes/light.css';
import { DateTimePicker, DropDown, TextInput } from '../components/Form';
import styled from 'styled-components';


const state_options = [{ value: 'AL', label: "AL" }, { value: 'AK', label: "AK" }, { value: 'AZ', label: "AZ" }, { value: 'AR', label: "AR" }, { value: 'CA', label: "CA" }, { value: 'CO', label: "CO" }, { value: 'CT', label: "CT" },
{ value: 'DE', label: "DE" }, { value: 'FL', label: "FL" }, { value: 'GA', label: "GA" }, { value: 'HI', label: "HI" }, { value: 'ID', label: "ID" }, { value: 'IL', label: "IL" }, { value: 'IN', label: "IN" },
{ value: 'IA', label: "IA" }, { value: 'KS', label: "KS" }, { value: 'KY', label: "KY" }, { value: 'LA', label: "LA" }, { value: 'ME', label: "ME" }, { value: 'MD', label: "MD" }, { value: 'MA', label: "MA" },
{ value: 'MI', label: "MI" }, { value: 'MN', label: "MN" }, { value: 'MS', label: "MS" }, { value: 'MO', label: "MO" }, { value: 'MT', label: "MT" }, { value: 'NE', label: "NE" }, { value: 'NV', label: "NV" },
{ value: 'NH', label: "NH" }, { value: 'NJ', label: "NJ" }, { value: 'NM', label: "NM" }, { value: 'NY', label: "NY" }, { value: 'NC', label: "NC" }, { value: 'ND', label: "ND" }, { value: 'OH', label: "OH" },
{ value: 'OK', label: "OK" }, { value: 'PA', label: "PA" }, { value: 'RI', label: "RI" }, { value: 'SC', label: "SC" }, { value: 'SD', label: "SD" }, { value: 'TN', label: "TN" }, { value: 'TX', label: "TX" },
{ value: 'VA', label: "VA" }, { value: "VT", label: "VT" }, { value: 'WA', label: "WA" }, { value: 'WV', label: "WV" }, { value: 'WI', label: "WI" }, { value: 'WY', label: "WY" },]

// Form for creating new owner and reporter Person objects.
export const PersonForm = ({ id }) => {

  // Determine if this is an owner or reporter when creating a Person.
  var is_owner = window.location.pathname.includes("owner")

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/
  const nameRegex = /^[a-z ,.'-]+$/i
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Initial Person data.
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    best_contact: '',
    drivers_license: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Whether or not to skip Owner creation.
  const [skipOwner, setSkipOwner] = useState(false);

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
        await axios.get('/people/api/person/' + id + '/', {
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
            .matches(nameRegex, "Name is not valid"),
          phone: Yup.string()
            .matches(phoneRegex, "Phone number is not valid"),
          email: Yup.string()
            .max(200, 'Must be 200 characters or less')
            .matches(emailRegex, "Email is not valid"),
          best_contact: Yup.string(),
          // drivers_license: Yup.string(),
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
            axios.put('/people/api/person/' + id + '/', values)
            .then(function() {
              // If we have an SR ID, redirect back to the SR.
              if (servicerequest_id) {
                navigate('/hotline/servicerequest/' + servicerequest_id);
              }
              // Else return to the Person details.
              else if (is_owner) {
                navigate('/hotline/owner/' + id);
              }
              else {
                navigate('/hotline/reporter/' + id);
              }
            })
            .catch(error => {
              console.log(error.response);
            });
          }
          else {
            axios.post('/people/api/person/', values)
            .then(response => {
              // If SR already exists, update it with owner info and redirect to the SR details.
              if (servicerequest_id) {
                axios.patch('/hotline/api/servicerequests/' + servicerequest_id + '/', {owner:response.data.id})
                .then(function() {
                  navigate('/hotline/servicerequest/' + servicerequest_id);
                })
                .catch(error => {
                  console.log(error.response);
                });
              }
              // If we have a reporter ID, redirect to create a new Animal with owner + reporter IDs.
              else if (reporter_id) {
                navigate('/animals/animal/new?owner_id=' + response.data.id + '&reporter_id=' + reporter_id);
              }
              // If we're creating an owner without a reporter ID, redirect to create new Animal with owner ID.
              else if (is_owner) {
                navigate('/animals/animal/new?owner_id=' + response.data.id);
              }
              // If we're creating a reporter and choose to skip owner, redirect to create new Animal with reporter ID.
              else if (skipOwner) {
                navigate('/animals/animal/new?reporter_id=' + response.data.id);
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
        {props => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5">{is_owner ? "Owner" : "Reporter"} Information</Card.Header>
          <Card.Body>
          <BootstrapForm noValidate>
            <BootstrapForm.Row>
                <TextInput
                  xs="5"
                  type="text"
                  label="First Name*"
                  name="first_name"
                />
                <TextInput
                  xs="5"
                  type="text"
                  label="Last Name*"
                  name="last_name"
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
                <TextInput
                  xs="3"
                  type="text"
                  label="Phone"
                  name="phone"
                />
                <TextInput
                  xs="7"
                  type="text"
                  label="Email"
                  name="email"
                />
              {/* <Col xs="3">
                    <TextInput
                      type="text"
                      label="Drivers License"
                      name="drivers_license"
                      id="drivers_license"
                    />
                  </Col> */}
            </BootstrapForm.Row>
            <BootstrapForm.Row>
                <TextInput
                  xs="10"
                  as="textarea"
                  label="Best Contact"
                  name="best_contact"
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!is_owner}>
                <TextInput
                  xs="8"
                  type="text"
                  label="Address"
                  name="address"
                />
                <TextInput
                  xs="2"
                  type="text"
                  label="Apartment"
                  name="apartment"
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!is_owner}>
                <TextInput
                  xs="6"
                  type="text"
                  label="City"
                  name="city"
                />
                <Col xs="2">
                <DropDown
                  label="State"
                  name="state"
                  id="state"
                  options={state_options}
                  value={props.values.state || ''}
                />
                </Col>
                <TextInput
                  xs="2"
                  type="text"
                  label="Zip Code"
                  name="zip_code"
                />
            </BootstrapForm.Row>
          </BootstrapForm>
          </Card.Body>
            <ButtonGroup size="lg" >
              <Button type="button" onClick={() => { setSkipOwner(false); props.submitForm() }}>{!is_owner ? <span>{!id ? "Add Owner" : "Save"}</span> : <span>{!id ? "Add Animal(s)" : "Save"}</span>}</Button>
              {!is_owner & !id ? <button type="button" className="btn btn-primary mr-1 border" onClick={() => { setSkipOwner(true); props.submitForm() }}>Add Animal(s)</button> : ""}
              <Button variant="secondary" type="button">Reset</Button>
              <Button as={Link} variant="info" href="/hotline">Back</Button>
            </ButtonGroup>
          </Card>
        )}
      </Formik>
    </>
  );
};

// Form for creating new Service Request objects.
export function ServiceRequestForm({ id }) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = null,
    reporter_id = null
  } = queryParams;

  // Track checkbox state with Fade.
  const [fadeIn, setFadeIn] = useState(true);
  function handleChange() {
    setFadeIn(!fadeIn)
  }

  // Initial ServiceRequest data.
  const [data, setData] = useState({
    owner: owner_id,
    reporter: reporter_id,
    directions: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
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
        await axios.get('/hotline/api/servicerequests/' + id + '/', {
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
    else if (owner_id) {
      const fetchOwnerData = async () => {
        // Fetch Owner data.
        await axios.get('/people/api/person/' + owner_id + '/', {
          cancelToken: source.token,
        })
          .then(response => {
            // Update relevant address fields.
            setData(Object.assign(data, { 'address': response.data.address, 'apartment': response.data.apartment, 'city': response.data.city, 'state': response.data.state, 'zip_code': response.data.zip_code }))
            setFadeIn(response.data.address ? false : true)
          })
          .catch(error => {
            console.log(error.response);
          });
      };
      fetchOwnerData();
    }
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [id, owner_id, data]);

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
          address: Yup.string(),
          apartment: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          city: Yup.string(),
          state: Yup.string()
            .nullable(),
          zip_code: Yup.string()
            .max(10, 'Must be 10 characters or less'),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('/hotline/api/servicerequests/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + id);
            })
            .catch(error => {
              console.log(error.response);
            });
            setSubmitting(false);
          }
          else {
            axios.post('/hotline/api/servicerequests/', values)
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
        <Card border="secondary" className="mt-5">
        <Card.Header as="h5">Service Request Form</Card.Header>
        <Card.Body>
        <BootstrapForm as={Form}>
          <Field type="hidden" value={owner_id || ""} name="owner" id="owner"></Field>
          <Field type="hidden" value={reporter_id || ""} name="reporter" id="reporter"></Field>
          <BootstrapForm.Row hidden={!id}>
                <TextInput
                  as="textarea"
                  rows={5}
                  label="Outcome"
                  name="outcome"
                  id="outcome"
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id}>
                <TextInput
                  as="textarea"
                  rows={5}
                  label="Owner Notification Notes"
                  name="owner_notification_notes"
                  id="owner_notification_notes"
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id} className="mt-1">
              <Label htmlFor="forced_entry" className="mt-3 ml-3">Forced Entry</Label>
              <Field component={Switch} name="forced_entry" type="checkbox" color="primary" className="mt-2" />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id}>
                <DateTimePicker
                  label="Recovery Time"
                  name="recovery_time"
                  id="recovery_time"
                  onChange={(date, dateStr) => {
                    props.setFieldValue("recovery_time", dateStr)
                  }}
                  value={data.recovery_time || null}
                />
                <DateTimePicker
                  label="Owner Notified"
                  name="owner_notification_tstamp"
                  id="owner_notification_tstamp"
                  onChange={(date, dateStr) => {
                    props.setFieldValue("owner_notification_tstamp", dateStr)
                  }}
                  value={data.owner_notification_tstamp || null}
                />
            </BootstrapForm.Row>
          {data.address ?
            <span className="form-row">
              <Label>Address Same as Owner: </Label>
              <CustomInput id="same_address" type="checkbox" className="ml-2" checked={!fadeIn} onChange={handleChange} />
            </span> : ""
          }
          <FormGroup>
            <Fade in={fadeIn} hidden={!fadeIn}>
              <BootstrapForm.Row>
                <Col xs="8">
                  <TextInput
                    type="text"
                    label="Address"
                    name="address"
                    id="address"
                  />
                </Col>
                <Col xs="2">
                  <TextInput
                    type="text"
                    label="Apartment"
                    name="apartment"
                    id="apartment"
                  />
                </Col>
              </BootstrapForm.Row>
              <BootstrapForm.Row>
                <Col xs="6">
                  <TextInput
                    type="text"
                    label="City"
                    name="city"
                    id="city"
                  />
                </Col>
                <Col xs="2">
                  <DropDown
                    label="State"
                    name="state"
                    id="state"
                    options={state_options}
                    value={props.values.state || ''}
                  />
                </Col>
                <Col xs="2">
                  <TextInput
                    type="text"
                    label="Zip Code"
                    name="zip_code"
                    id="zip_code"
                  />
                </Col>
              </BootstrapForm.Row>
            </Fade>
            <BootstrapForm.Row>
              <Col xs="10">
                <TextInput
                  as="textarea"
                  rows={5}
                  label="Directions*"
                  name="directions"
                  id="directions"
                />
              </Col>
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <Col>
                <Label htmlFor="verbal_permission">Verbal Permission</Label>
                <Field component={Switch} name="verbal_permission" type="checkbox" color="primary"/>

                <Label htmlFor="key_provided">Key Provided</Label>
                <Field component={Switch} name="key_provided" type="checkbox" color="primary" />

                <Label htmlFor="accessible">Accessible</Label>
                <Field component={Switch} name="accessible" type="checkbox" color="primary" />

                <Label htmlFor="turn_around">Turn Around</Label>
                <Field component={Switch} name="turn_around" type="checkbox" color="primary" />
              </Col>
            </BootstrapForm.Row>
          </FormGroup>


        </BootstrapForm>
        </Card.Body>
        <ButtonGroup size="lg">
            <Button type="submit" onClick={() => { props.submitForm()}}>Save</Button>
            <Button as={Link} href="/hotline/" variant="info">Cancel</Button>
          </ButtonGroup>
        </Card>
      )}
    </Formik>
  );
}
