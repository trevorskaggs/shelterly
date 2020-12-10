import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from 'raviger';
import { Field, Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col } from "react-bootstrap";
import * as Yup from 'yup';
import { AddressLookup, DropDown, TextInput } from '../components/Form';
import { AuthContext } from "../accounts/AccountsReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';

const state_options = [{ value: 'AL', label: "AL" }, { value: 'AK', label: "AK" }, { value: 'AZ', label: "AZ" }, { value: 'AR', label: "AR" }, { value: 'CA', label: "CA" }, { value: 'CO', label: "CO" }, { value: 'CT', label: "CT" },
{ value: 'DE', label: "DE" }, { value: 'FL', label: "FL" }, { value: 'GA', label: "GA" }, { value: 'HI', label: "HI" }, { value: 'ID', label: "ID" }, { value: 'IL', label: "IL" }, { value: 'IN', label: "IN" },
{ value: 'IA', label: "IA" }, { value: 'KS', label: "KS" }, { value: 'KY', label: "KY" }, { value: 'LA', label: "LA" }, { value: 'ME', label: "ME" }, { value: 'MD', label: "MD" }, { value: 'MA', label: "MA" },
{ value: 'MI', label: "MI" }, { value: 'MN', label: "MN" }, { value: 'MS', label: "MS" }, { value: 'MO', label: "MO" }, { value: 'MT', label: "MT" }, { value: 'NE', label: "NE" }, { value: 'NV', label: "NV" },
{ value: 'NH', label: "NH" }, { value: 'NJ', label: "NJ" }, { value: 'NM', label: "NM" }, { value: 'NY', label: "NY" }, { value: 'NC', label: "NC" }, { value: 'ND', label: "ND" }, { value: 'OH', label: "OH" },
{ value: 'OK', label: "OK" }, { value: 'PA', label: "PA" }, { value: 'RI', label: "RI" }, { value: 'SC', label: "SC" }, { value: 'SD', label: "SD" }, { value: 'TN', label: "TN" }, { value: 'TX', label: "TX" },
{ value: 'VA', label: "VA" }, { value: "VT", label: "VT" }, { value: 'WA', label: "WA" }, { value: 'WV', label: "WV" }, { value: 'WI', label: "WI" }, { value: 'WY', label: "WY" },]

// Form for creating new owner and reporter Person objects.
export const PersonForm = ({ id }) => {

  const { state, dispatch } = useContext(AuthContext);

  // Determine if this is an owner or reporter when creating a Person.
  var is_owner = window.location.pathname.includes("owner")

  // Determine if this is an intake workflow.
  var is_intake = window.location.pathname.includes("intake")

  // Determine if this is a first responder when creating a Person.
  var is_first_responder = window.location.pathname.includes("first_responder")

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    reporter_id = '',
    servicerequest_id = ''
  } = queryParams;

  // Regex validators.
  const phoneRegex = /^[0-9]{10}$/
  const nameRegex = /^[a-z ,.'-]+$/i
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Initial Person data.
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    best_contact: '',
    show_agency: is_first_responder,
    agency: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    request: servicerequest_id,
    latitude: null,
    longitude: null,
  });

  // Whether or not to skip Owner creation.
  const [skipOwner, setSkipOwner] = useState(false);

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
            .matches(nameRegex, "Name is not valid")
            .required('Required'),
          phone: Yup.string()
            .matches(phoneRegex, "Phone number is not valid"),
          email: Yup.string()
            .max(200, 'Must be 200 characters or less')
            .matches(emailRegex, "Email is not valid"),
          best_contact: Yup.string(),
          show_agency: Yup.boolean(),
          agency: Yup.string().when('show_agency', {
              is: true,
              then: Yup.string().required('Required')}),
          address: Yup.string(),
          apartment: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          city: Yup.string(),
          state: Yup.string(),
          zip_code: Yup.string()
            .max(10, 'Must be 10 characters or less'),
          latitude: Yup.number()
            .nullable(),
          longitude: Yup.number()
            .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('/people/api/person/' + id + '/', values)
            .then(function() {
              if (state.prevLocation) {
                navigate(state.prevLocation);
              }
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
              // If SR already exists, redirect to the SR details.
              if (servicerequest_id) {
                navigate('/hotline/servicerequest/' + servicerequest_id);
              }
              // If we have a reporter ID, redirect to create a new Animal with owner + reporter IDs.
              else if (reporter_id) {
                navigate('/hotline/animal/new?owner_id=' + response.data.id + '&reporter_id=' + reporter_id);
              }
              // If we're creating a person for intake, redirect to create new intake Animal with proper ID.
              else if (is_intake) {
                if (is_owner) {
                  navigate('/intake/animal/new?owner_id=' + response.data.id);
                }
                else {
                  navigate('/intake/animal/new?reporter_id=' + response.data.id);
                }
              }
              // If we're creating an owner without a reporter ID, redirect to create new Animal with owner ID.
              else if (is_owner) {
                navigate('/hotline/animal/new?owner_id=' + response.data.id);
              }
              // If we're creating a reporter and choose to skip owner, redirect to create new Animal with reporter ID.
              else if (skipOwner) {
                navigate('/hotline/animal/new?reporter_id=' + response.data.id + '&first_responder=' + is_first_responder);
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
          <Card.Header as="h5" className="pl-3"> {!is_owner || (is_owner && (id || !reporter_id)) ? <span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span> : ""}
{is_owner ? "Owner" : "Reporter"} Information</Card.Header>
          <Card.Body>
          <BootstrapForm noValidate>
            <Field type="hidden" value={data.latitude || ""} name="latitude" id="latitude"></Field>
            <Field type="hidden" value={data.longitude || ""} name="longitude" id="longitude"></Field>
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
              <BootstrapForm.Group as={Col} xs="10">
                <AddressLookup
                  label="Search"
                  style={{width: '100%'}}
                  className="form-control"
                />
              </BootstrapForm.Group>
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!is_owner}>
              <TextInput
                xs="8"
                type="text"
                label="Address"
                name="address"
                disabled
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
                disabled
              />
              <Col xs="2">
              <DropDown
                label="State"
                name="state"
                id="state"
                options={state_options}
                value={props.values.state || ''}
                placeholder=''
                disabled
              />
              </Col>
              <TextInput
                xs="2"
                type="text"
                label="Zip Code"
                name="zip_code"
                disabled
              />
            </BootstrapForm.Row>
          </BootstrapForm>
          </Card.Body>
            <ButtonGroup size="lg" >
              {/* form save buttons */}
              {!is_first_responder ? <Button type="button" onClick={() => { setSkipOwner(false); props.submitForm() }}>{!is_owner && !is_intake ? <span>{!id ? "Add Owner" : "Save"}</span> : <span>{!id && !servicerequest_id ? "Add Animal(s)" : "Save"}</span>}</Button> : ""}
              {/* reporter form save buttons to skip owner */}
              {!is_owner && !id && !is_intake ? <button type="button" className="btn btn-primary mr-1 border" onClick={() => { setSkipOwner(true); props.submitForm() }}>Add Animal(s)</button> : ""}
              <Button variant="secondary" type="button" onClick={() => {props.resetForm(data)}}>Reset</Button>
            </ButtonGroup>
          </Card>
        )}
      </Formik>
    </>
  );
};
