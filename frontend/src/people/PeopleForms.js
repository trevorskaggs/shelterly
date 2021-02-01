import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { navigate, useQueryParams } from 'raviger';
import { Field, Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, FormGroup, Modal, Row } from "react-bootstrap";
import * as Yup from 'yup';
import { AddressLookup, DateTimePicker, DropDown, TextInput } from '../components/Form';
import { AuthContext } from "../accounts/AccountsReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { STATE_OPTIONS } from '../constants'

// Form for creating new owner and reporter Person objects.
export const PersonForm = (props) => {

  const { state, dispatch } = useContext(AuthContext);
  const id = props.id;

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  // Determine if this is an owner or reporter when creating a Person.

  let is_owner = window.location.pathname.includes("owner")

  // Determine if this is an intake workflow.
  let is_intake = window.location.pathname.includes("intake")

  // Determine if this is a first responder when creating a Person.
  let is_first_responder = window.location.pathname.includes("first_responder")

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    reporter_id = '',
    servicerequest_id = '',
    animal_id = '',
    owner_id = '',
  } = queryParams;

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/
  const nameRegex = /^[a-z ,.'-]+$/i
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  // Whether or not to skip Owner creation.
  const [skipOwner, setSkipOwner] = useState(false);
  const [isOwner, setIsOwner] = useState(props.state.stepIndex > 0 || is_owner);

  // Modal for exiting workflow.
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const goBack = () => navigate('/hotline');

  // Control Agency display.
  const [showAgency, setShowAgency] = useState(props.state.stepIndex === 0 && is_first_responder);

  const initialData = {
    first_name: '',
    last_name: '',
    phone: '',
    alt_phone: '',
    email: '',
    comments: '',
    show_agency: showAgency,
    agency: '',
    drivers_license: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    request: servicerequest_id,
    animal: animal_id,
    owner: owner_id,
    latitude: null,
    longitude: null,
    change_reason: '',
  }
  let current_data = initialData;
  if (is_workflow) {
    if (isOwner) {
      current_data = props.state.steps.owner
    }
    else {
      current_data = props.state.steps.reporter
    }
    current_data['show_agency'] = showAgency;
  }

  // Initial Person data.
  const [data, setData] = useState(current_data);

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
            // Set phone field to be the pretty version.
            response.data['phone'] = response.data['display_phone']
            response.data['alt_phone'] = response.data['display_alt_phone']
            // Initialize change_reason on fetch to avoid warning.
            response.data['change_reason'] = '';
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
          alt_phone: Yup.string()
            .matches(phoneRegex, "Phone number is not valid"),
          email: Yup.string()
            .max(200, 'Must be 200 characters or less')
            .matches(emailRegex, "Email is not valid"),
          comments: Yup.string(),
          show_agency: Yup.boolean(),
          agency: Yup.string().when('show_agency', {
              is: true,
              then: Yup.string().required('Required')}),
          drivers_license: Yup.string(),
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
          change_reason: Yup.string()
            .max(50, 'Must be 50 characters or less'),
        })}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          if (is_workflow) {
            if (isOwner) {
              props.onSubmit('owner', values, 'animals');
            }
            else {
              if (skipOwner) {
                props.onSubmit('reporter', values, 'animals');
              }
              else {
                props.onSubmit('reporter', values, 'owner');
                setIsOwner(true);
                setShowAgency(false);
                resetForm({values:props.state.steps.owner});
              }
            }
          }
          else if (id) {
            axios.put('/people/api/person/' + id + '/', values)
            .then(function() {
              if (state.prevLocation) {
                navigate(state.prevLocation);
              }
              else if (isOwner) {
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
              // If adding from an animal, redirect to the Animal details.
              else if (animal_id) {
                navigate('/animals/' + animal_id);
              }
              // If adding from an owner, redirect to the new Owner details.
              else if (owner_id) {
                navigate('/hotline/owner/' + response.data.id);
              }
              // If we have a reporter ID, redirect to create a new Animal with owner + reporter IDs.
              else if (reporter_id) {
                navigate('/hotline/animal/new?owner_id=' + response.data.id + '&reporter_id=' + reporter_id);
              }
            })
            .catch(error => {
              console.log(error.response);
            });
            setSubmitting(false);
          }
        }}
      >
        {formikProps => (
          <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
            {id ?
              <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Update {isOwner ? "Owner" : "Reporter"}</Card.Header>
              :
              <Card.Header as="h5" className="pl-3">{props.state.stepIndex === 0 ?
                <span style={{cursor:'pointer'}} onClick={() => {setShow(true)}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
                :
                <span style={{cursor:'pointer'}} onClick={() => {setIsOwner(false); setShowAgency(is_first_responder); formikProps.resetForm({values:props.state.steps.reporter}); props.handleBack('owner', 'reporter')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}
          {isOwner ? "Owner" : "Reporter"}{is_workflow ? " Information" : ""}
          </Card.Header>}
          <Card.Body>
          <BootstrapForm noValidate>
            <Field type="hidden" value={data.latitude || ""} name="latitude" id="latitude"></Field>
            <Field type="hidden" value={data.longitude || ""} name="longitude" id="longitude"></Field>
            <BootstrapForm.Row>
              <TextInput
                xs="6"
                type="text"
                label="First Name*"
                name="first_name"
              />
              <TextInput
                xs="6"
                type="text"
                label="Last Name*"
                name="last_name"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <TextInput
                xs={isOwner ? "2" : "3"}
                type="text"
                label="Phone"
                name="phone"
              />
              <TextInput
                xs={isOwner ? "2" : "3"}
                type="text"
                label="Alternate Phone"
                name="alt_phone"
              />
              <TextInput hidden={!isOwner}
                xs="2"
                type="text"
                label="Drivers License"
                name="drivers_license"
                id="drivers_license"
              />
              <TextInput
                xs="6"
                type="text"
                label="Email"
                name="email"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={(is_first_responder && !isOwner) || (data.agency && id)}>
              <TextInput
                xs="12"
                as="textarea"
                label="Comments"
                name="comments"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!showAgency && (!data.agency || !id)}>
              <TextInput
                xs="12"
                as="textarea"
                label="Agency*"
                name="agency"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!isOwner}>
              <BootstrapForm.Group as={Col} xs="12">
                <AddressLookup
                  label="Search"
                  style={{width: '100%'}}
                  className="form-control"
                />
              </BootstrapForm.Group>
            </BootstrapForm.Row>
            <BootstrapForm.Row hidden={!isOwner}>
              <TextInput
                xs="10"
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
            <BootstrapForm.Row hidden={!isOwner}>
              <TextInput
                xs="8"
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
                options={STATE_OPTIONS}
                value={formikProps.values.state || ''}
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
            <BootstrapForm.Row hidden={!id || !isOwner}>
              <TextInput
                xs="12"
                type="text"
                label="Change Reason"
                name="change_reason"
              />
            </BootstrapForm.Row>
          </BootstrapForm>
          </Card.Body>
            <ButtonGroup size="lg" >
              {/* form save buttons */}
              {!is_first_responder && !is_workflow ? <Button type="button" onClick={() => { setSkipOwner(false); formikProps.submitForm() }}>{!isOwner && !is_intake ? <span>{!id ? "Add Owner" : "Save"}</span> : "Save"}</Button> : ""}
              {/* workflow buttons */}
              {is_workflow && !isOwner ? <Button type="button" onClick={() => { setSkipOwner(false); formikProps.submitForm(); }}>{props.state.steps.owner.first_name ? "Change Owner" : "Add Owner"}</Button> : ""}
              {is_workflow ? <button type="button" className="btn btn-primary mr-1 border" onClick={() => { setSkipOwner(true); formikProps.submitForm() }}>Next Step</button> : ""}
            </ButtonGroup>
          </Card>
        )}
      </Formik>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Leave Service Request Creation Workflow?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you would like to leave the Service Request creation workflow?&nbsp;&nbsp;No data will be saved.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={goBack}>Yes</Button>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const OwnerContactForm = ({id}) => {

  const [queryParams] = useQueryParams();
  var url;
  var axios_method;

  const {
    owner = null,
  } = queryParams;

    const [data, setData] = useState({
      owner_name: '',
      owner_contact_time: '',
      owner_contact_note: '',
      owner: owner,
    })

    useEffect(() => {
      let source = axios.CancelToken.source();
      if (id) {
        // Get OwnerContact if editing existing
        const fetchOwnerContact = async () => {
          // Fetch Owner Contact data.
          await axios.get('/people/api/ownercontact/' + id + '/', {
            cancelToken: source.token,
          })
          .then(response => {
            setData(response.data);
            console.log(response.data)
          })
          .catch(error => {
            console.log(error.response);
          });
        };
        fetchOwnerContact();
      }
      else {
        // Get Owner details for new OwnerContact
        const fetchOwner = async () => {
        // Fetch Owner Data.
        axios.get('/people/api/person/' + owner +'/', {
          cancelToken: source.token,
        })
          .then(response => {
            setData(prevState => ({ ...prevState, ["owner_name"]:response.data['first_name'] + ' ' + response.data['last_name'] }));
          })
          .catch(error => {
            console.log(error.response);
          });
        }
        fetchOwner();
      };
      return () => {
        source.cancel();
      };
    }, [id]);

    return (
        <Formik
          initialValues={data}
          enableReinitialize={true}
          validationSchema={Yup.object({
            owner_contact_time: Yup.date().required(),
            owner_contact_note: Yup.string().required(),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              if (id) {
                url = url + values.id
                axios_method = axios.patch
              }
              else {
                url = '/people/api/ownercontact/'
                axios_method = axios.post
              }
              axios_method(url, values)
              .then(
                  navigate('/hotline/owner/' + values.owner)
              )
              .catch(error => {
                console.log(error.response);
              });
            setSubmitting(false);
            }, 500);
          }}
        >
        {form => (
          <Card border="secondary" className="mt-5">
          <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>{ data.owner_name } - {!id ? "New" : "Update"} Owner Contact</Card.Header>
          <Card.Body>
          <BootstrapForm>
              <FormGroup>
                <Row>
                  <Col >
                  <DateTimePicker
                    label="Owner Contact Time"
                    name="owner_contact_time"
                    id="owner_contact_time"
                    xs="7"
                    clearable={false}
                    data-enable-time={true}
                    onChange={(date, dateStr) => {
                      form.setFieldValue("owner_contact_time", dateStr)
                    }}
                    value={form.values.owner_contact_time||null}
                  />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col >
                    <TextInput
                      as="textarea"
                      label="Owner Contact Note"
                      name="owner_contact_note"
                      id="owner_contact_note"
                      xs="7"
                      rows={5}
                    />
                  </Col>
                </Row>
              </FormGroup>
          </BootstrapForm>
          </Card.Body>
          <ButtonGroup>
            <Button type="button" className="btn btn-primary" onClick={() => {form.submitForm()}}>Save</Button>
          </ButtonGroup>
          </Card>
          )}
        </Formik>
    );
};
