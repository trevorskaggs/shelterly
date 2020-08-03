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

  // Determine if this is a first responder when creating a Person.
  var is_first_responder = window.location.pathname.includes("first_responder")

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
    showAgency: is_first_responder,
    agency: '',
    // drivers_license: '',
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
          showAgency: Yup.boolean(),
          agency: Yup.string().when('showAgency', {
              is: true,
              then: Yup.string().required('Required')}),
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
                navigate('/animals/animal/new?reporter_id=' + response.data.id + '&first_responder=' + is_first_responder);
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
            <BootstrapForm.Row hidden={is_first_responder}>
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
            <BootstrapForm.Row hidden={is_first_responder || data.agency}>
              <TextInput
                xs="10"
                as="textarea"
                label="Best Contact"
                name="best_contact"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!is_first_responder && !data.agency}>
              <TextInput
                xs="10"
                as="textarea"
                label="Agency*"
                name="agency"
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
              {!is_first_responder ? <Button type="button" onClick={() => { setSkipOwner(false); props.submitForm() }}>{!is_owner ? <span>{!id ? "Add Owner" : "Save"}</span> : <span>{!id ? "Add Animal(s)" : "Save"}</span>}</Button> : ""}
              {!is_owner && !id ? <button type="button" className="btn btn-primary mr-1 border" onClick={() => { setSkipOwner(true); props.submitForm() }}>Add Animal(s)</button> : ""}
              <Button variant="secondary" type="button">Reset</Button>
              <Button as={Link} variant="info" href="/hotline">Back</Button>
            </ButtonGroup>
          </Card>
        )}
      </Formik>
    </>
  );
};
