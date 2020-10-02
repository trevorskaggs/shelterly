import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from 'formik';
import {
  CustomInput,
  Label,
  Fade,
} from 'reactstrap';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, Modal } from "react-bootstrap";
import * as Yup from 'yup';
import { Switch } from 'formik-material-ui';
import 'flatpickr/dist/themes/light.css';
import { AddressLookup, DateTimePicker, DropDown, TextInput } from '../components/Form';

const state_options = [{ value: 'AL', label: "AL" }, { value: 'AK', label: "AK" }, { value: 'AZ', label: "AZ" }, { value: 'AR', label: "AR" }, { value: 'CA', label: "CA" }, { value: 'CO', label: "CO" }, { value: 'CT', label: "CT" },
{ value: 'DE', label: "DE" }, { value: 'FL', label: "FL" }, { value: 'GA', label: "GA" }, { value: 'HI', label: "HI" }, { value: 'ID', label: "ID" }, { value: 'IL', label: "IL" }, { value: 'IN', label: "IN" },
{ value: 'IA', label: "IA" }, { value: 'KS', label: "KS" }, { value: 'KY', label: "KY" }, { value: 'LA', label: "LA" }, { value: 'ME', label: "ME" }, { value: 'MD', label: "MD" }, { value: 'MA', label: "MA" },
{ value: 'MI', label: "MI" }, { value: 'MN', label: "MN" }, { value: 'MS', label: "MS" }, { value: 'MO', label: "MO" }, { value: 'MT', label: "MT" }, { value: 'NE', label: "NE" }, { value: 'NV', label: "NV" },
{ value: 'NH', label: "NH" }, { value: 'NJ', label: "NJ" }, { value: 'NM', label: "NM" }, { value: 'NY', label: "NY" }, { value: 'NC', label: "NC" }, { value: 'ND', label: "ND" }, { value: 'OH', label: "OH" },
{ value: 'OK', label: "OK" }, { value: 'PA', label: "PA" }, { value: 'RI', label: "RI" }, { value: 'SC', label: "SC" }, { value: 'SD', label: "SD" }, { value: 'TN', label: "TN" }, { value: 'TX', label: "TX" },
{ value: 'VA', label: "VA" }, { value: "VT", label: "VT" }, { value: 'WA', label: "WA" }, { value: 'WV', label: "WV" }, { value: 'WI', label: "WI" }, { value: 'WY', label: "WY" },]

// Form for creating new Service Request objects.
export function ServiceRequestForm({ id }) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    owner_id = null,
    reporter_id = null,
    first_responder = 'false'
  } = queryParams;

  // Determine if this is from a first responder when creating a SR.
  var is_first_responder = (first_responder === 'true');

  // Track checkbox state with Fade.
  const [fadeIn, setFadeIn] = useState(true);
  function handleChange() {
    setFadeIn(!fadeIn)
  }

  // Track duplicate request address error.
  const [error, setError] = useState({show:false, error:[]});
  const handleClose = () => setError({show:false, error:[]});

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
    latitude: null,
    longitude: null,
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
            setData(Object.assign(data, { 'address': response.data.address, 'apartment': response.data.apartment, 'city': response.data.city, 'state': response.data.state, 'zip_code': response.data.zip_code, 'latitude': response.data.latitude, 'longitude': response.data.longitude }))
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
  }, []);

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
          latitude: Yup.number()
            .nullable(),
          longitude: Yup.number()
            .nullable(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (id) {
            axios.put('/hotline/api/servicerequests/' + id + '/', values)
            .then(function() {
              navigate('/hotline/servicerequest/' + id);
            })
            .catch(error => {
              console.log(error.response);
              if (error.response.data && error.response.data[0].includes('same address')) {
                setError({show:true, error:error.response.data});
              }
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
              if (error.response.data && error.response.data[0].includes('same address')) {
                setError({show:true, error:error.response.data});
              }
            });
          setSubmitting(false);
        }
      }}
    >
      {props => (
        <Card border="secondary" className="mt-5" style={{width:"auto"}}>
        <Card.Header as="h5">Service Request Form</Card.Header>
        <Card.Body>
        <BootstrapForm as={Form}>
          <Field type="hidden" value={owner_id || ""} name="owner" id="owner"></Field>
          <Field type="hidden" value={reporter_id || ""} name="reporter" id="reporter"></Field>
          <Field type="hidden" value={data.latitude || ""} name="latitude" id="latitude"></Field>
          <Field type="hidden" value={data.longitude || ""} name="longitude" id="longitude"></Field>
          <BootstrapForm.Row hidden={!id}>
            <TextInput
              as="textarea"
              rows={5}
              label="Outcome"
              name="outcome"
              id="outcome"
              xs="10"
            />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id}>
              <TextInput
                as="textarea"
                rows={5}
                label="Owner Notification Notes"
                name="owner_notification_notes"
                id="owner_notification_notes"
                xs="10"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id} className="mb-2">
              <Label htmlFor="forced_entry" className="mt-2 ml-1">Forced Entry</Label>
              <Field component={Switch} name="forced_entry" type="checkbox" color="primary" />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id}>
                <DateTimePicker
                  label="Recovery Time"
                  name="recovery_time"
                  id="recovery_time"
                  xs="3"
                  onChange={(date, dateStr) => {
                    props.setFieldValue("recovery_time", dateStr)
                  }}
                  value={data.recovery_time || null}
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!id}>
                <DateTimePicker
                  label="Owner Notified"
                  name="owner_notification_tstamp"
                  id="owner_notification_tstamp"
                  xs="3"
                  onChange={(date, dateStr) => {
                    props.setFieldValue("owner_notification_tstamp", dateStr)
                  }}
                  value={data.owner_notification_tstamp || null}
                />
            </BootstrapForm.Row>
          {data.address && !id ?
            <span className="form-row mb-2">
              <Label>&nbsp;&nbsp;Address Same as Owner: </Label>
              <CustomInput id="same_address" type="checkbox" className="ml-2" checked={!fadeIn} onChange={handleChange} />
            </span> : ""
          }
            <Fade in={fadeIn} hidden={!fadeIn}>
              <BootstrapForm.Row>
                <BootstrapForm.Group as={Col} xs="10">
                  <AddressLookup
                    label="Search"
                    style={{width: '100%'}}
                    className="form-control"
                  />
                </BootstrapForm.Group>
              </BootstrapForm.Row>
              <BootstrapForm.Row>
                <TextInput
                  type="text"
                  label={!is_first_responder ? "Address" : "Address/Cross Streets"}
                  name="address"
                  id="address"
                  xs="8"
                  disabled
                />
                <TextInput
                  type="text"
                  label="Apartment"
                  name="apartment"
                  id="apartment"
                  xs="2"
                />
              </BootstrapForm.Row>
              <BootstrapForm.Row>
                <TextInput
                  type="text"
                  label="City"
                  name="city"
                  id="city"
                  xs="6"
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
                    type="text"
                    label="Zip Code"
                    name="zip_code"
                    id="zip_code"
                    xs="2"
                    disabled
                  />
              </BootstrapForm.Row>
            </Fade>
            <BootstrapForm.Row>
                <TextInput
                  as="textarea"
                  rows={5}
                  label="Directions*"
                  name="directions"
                  id="directions"
                  xs="10"
                />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
                <span hidden={is_first_responder}><Label htmlFor="verbal_permission" className="ml-1">Verbal Permission</Label>
                <Field component={Switch} name="verbal_permission" type="checkbox" color="primary"/>

                <Label htmlFor="key_provided">Key Provided</Label>
                <Field component={Switch} name="key_provided" type="checkbox" color="primary" /></span>

                <span><Label htmlFor="accessible">Accessible</Label>
                <Field component={Switch} name="accessible" type="checkbox" color="primary" />

                <Label htmlFor="turn_around">Turn Around</Label>
                <Field component={Switch} name="turn_around" type="checkbox" color="primary" /></span>
            </BootstrapForm.Row>
        </BootstrapForm>
        </Card.Body>
        <ButtonGroup size="lg">
            <Button type="submit" onClick={() => { props.submitForm()}}>Save</Button>
            <Button as={Link} href="/hotline/" variant="info">Cancel</Button>
          </ButtonGroup>
          <Modal show={error.show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Duplicate Request Address Found</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>
                {error && error.error[0]}
                &nbsp;Click <Link href={'/hotline/servicerequest/' + error.error[1]} target="_blank">here</Link> to view this Request.
              </p>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
          </Modal>
        </Card>
      )}
    </Formik>
  );
}
