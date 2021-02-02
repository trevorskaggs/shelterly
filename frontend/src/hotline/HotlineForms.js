import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Field, Form, Formik } from 'formik';
import {
  CustomInput,
  Label,
  Fade,
} from 'reactstrap';

import {Button, ButtonGroup, Card, Col, Form as BootstrapForm, FormGroup, Modal, Row } from "react-bootstrap";
import * as Yup from 'yup';
import { Switch } from 'formik-material-ui';
import 'flatpickr/dist/themes/light.css';
import { AddressLookup, DateTimePicker, DropDown, TextInput } from '../components/Form';
import { AuthContext } from "../accounts/AccountsReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import {STATE_OPTIONS} from "../constants";

// Form for creating new Service Request objects.
export function ServiceRequestForm(props) {

  const { state, dispatch } = useContext(AuthContext);
  const id = props.id;

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  // Determine if this is from a first responder when creating a SR.
  var is_first_responder = window.location.pathname.includes("first_responder");

  // Track checkbox state with Fade.
  const [fadeIn, setFadeIn] = useState(props.state.steps.owner.address ? false : true);
  function handleChange() {
    setFadeIn(!fadeIn)
  }

  // Track duplicate request address error.
  const [error, setError] = useState({show:false, error:[]});
  const handleClose = () => setError({show:false, error:[]});

  // Initial ServiceRequest data.
  const [data, setData] = useState({
    owner: [],
    reporter: null,
    directions: '',
    address: props.state.steps.owner.address || '',
    apartment: props.state.steps.owner.apartment || '',
    city: props.state.steps.owner.city || '',
    state: props.state.steps.owner.state || '',
    zip_code: props.state.steps.owner.zip_code || '',
    latitude: props.state.steps.owner.latitude || null,
    longitude: props.state.steps.owner.longitude || null,
    verbal_permission: false,
    key_provided: false,
    accessible: false,
    turn_around: false,
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
            .max(2000, 'Must be 2000 characters or less'),
          verbal_permission: Yup.boolean(),
          key_provided: Yup.boolean(),
          accessible: Yup.boolean(),
          turn_around: Yup.boolean(),
          address: Yup.string()
            .required('Required'),
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
        onSubmit={ async (values, { setSubmitting }) => {
          if (is_workflow) {
            // Create Reporter
            let reporterResponse = [{data:{id:null}}];
            if (props.state.steps.reporter.first_name) {
              reporterResponse = await Promise.all([
                axios.post('/people/api/person/', props.state.steps.reporter)
              ]);
            }
            // Create Owner
            let ownerResponse = [{data:{id:null}}];
            if (props.state.steps.owner.first_name) {
              ownerResponse = await Promise.all([
                axios.post('/people/api/person/', props.state.steps.owner)
              ]);
            }
            // Create Animals
            props.state.steps.animals.forEach(animal => {
              // Add owner and reporter to animal data.
              animal['reporter'] = reporterResponse[0].data.id
              animal['new_owner'] = ownerResponse[0].data.id
              axios.post('/animals/api/animal/', animal)
              .catch(error => {
                console.log(error.response);
              });
            });
            // Create Service Request
            values['reporter'] = reporterResponse[0].data.id
            if (ownerResponse[0].data.id) {
              values['owner'] = [ownerResponse[0].data.id]
            }
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
          }
          else if (id) {
            axios.put('/hotline/api/servicerequests/' + id + '/', values)
            .then(function() {
              if (state.prevLocation) {
                navigate(state.prevLocation);
              }
              else {
                navigate('/hotline/servicerequest/' + id);
              }
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
      {formikProps => (
        <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
        <Card.Header as="h5">{id ?
          <span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('request', 'animals')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}{id ? "Update " : ""}Service Request{is_workflow ? " Information" :""}</Card.Header>
        <Card.Body>
        <BootstrapForm as={Form}>
          {props.state.steps.owner.address && !id ?
            <span className="form-row mb-2">
              <Label>&nbsp;&nbsp;Address Same as Owner: </Label>
              <CustomInput id="same_address" type="checkbox" className="ml-2" checked={!fadeIn} onChange={handleChange} />
            </span> : ""
          }
            <Fade in={fadeIn} hidden={!fadeIn}>
              <BootstrapForm.Row>
                <BootstrapForm.Group as={Col} xs="12">
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
                  label={is_first_responder ? "Address/Cross Streets*" : "Address*"}
                  name="address"
                  id="address"
                  xs="10"
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
                  xs="8"
                  disabled
                />
                <Col xs="2">
                  <DropDown
                    label="State"
                    name="state"
                    id="state"
                    options={STATE_OPTIONS}
                    value={formikProps.values.state || ''}
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
                  label="Directions"
                  name="directions"
                  id="directions"
                  xs="12"
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
          {is_workflow ?
            <Button className="btn btn-primary border" type="submit" onClick={() => { formikProps.submitForm()}}>Finish and Create Service Request</Button> :
            <Button type="submit" onClick={() => { formikProps.submitForm()}}>Save</Button>
          }
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
