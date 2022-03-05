import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import * as Yup from 'yup';
import { AddressSearch, TextInput } from '../components/Form';
import { AuthContext } from "../accounts/AccountsReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';

// Form for owner and reporter Person objects.
const PersonForm = (props) => {

  const { state } = useContext(AuthContext);
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

  // Track duplicate owner error.
  const [error, setError] = useState({show:false, error:[]});
  const handleErrorClose = () => setError({show:false, error:[]});

  const handleDuplicateOwner = (dupe_id, values) => {
    axios.patch('/people/api/person/' + dupe_id + '/', values)
    .then(response => {
      // If SR already exists, redirect to the SR details.
      if (servicerequest_id) {
        navigate('/hotline/servicerequest/' + servicerequest_id);
      }
      // If adding from an animal, redirect to the Animal details.
      else if (animal_id) {
        navigate('/animals/' + animal_id);
      }
      // Otherise redirect to the duplicate Owner details.
      else {
        navigate('/people/owner/' + response.data.id);
      }
    })
    .catch(error => {
    });
  }

  const checkOwner = (formikProps) => {
    // Check to see if owner data already exists.
    axios.get('/people/api/person/?search=' + formikProps.values.first_name +  ' ' + formikProps.values.last_name + ' ' + formikProps.values.phone)
    .then(response => {
      if (response.data.length > 0) {
        setError({show:true, error:['a duplicate owner with the same name and phone number already exists.', response.data[0].id]});
      }
      else {
        setSkipOwner(true);
        formikProps.submitForm();
      }
    })
    .catch(error => {
    });
  }

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
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchPersonData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/people/api/person/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            // Set phone field to be the pretty version.
            response.data['phone'] = response.data['display_phone']
            response.data['alt_phone'] = response.data['display_alt_phone']
            // Initialize change_reason on fetch to avoid warning.
            response.data['change_reason'] = '';
            setData(response.data);
          }
        })
        .catch(error => {
        });
      };
      fetchPersonData();
    }
    // Cleanup.
    return () => {
      unmounted = true;
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
            .matches(phoneRegex, "Phone number is not valid")
            .required('Required'),
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
                navigate('/people/owner/' + id);
              }
              else {
                navigate('/people/reporter/' + id);
              }
            })
            .catch(error => {
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
              else {
                navigate('/people/owner/' + response.data.id);
              }
            })
            .catch(error => {
              if (error.response.data && error.response.data[0].includes('duplicate owner')) {
                setError({show:true, error:error.response.data});
              }
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
                label="Phone*"
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
                label="Comments / Alternate Contact"
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
            <AddressSearch formikProps={formikProps} label="Search for Contact Address" show_apt={true} hidden={!isOwner}/>
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
              {is_workflow ? <button type="button" className="btn btn-primary border" onClick={() => { checkOwner(formikProps); }}>Next Step</button> : ""}
            </ButtonGroup>
            <Modal show={error.show} onHide={handleErrorClose}>
              <Modal.Header closeButton>
                <Modal.Title>Duplicate Owner Found</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <span>This person cannot be created because</span> {error && error.error[0]}
                  <div className="mt-1 mb-1">Click <Link href={'/people/owner/' + error.error[1]} style={{color:"#8d99d4"}}>here</Link> to view this owner.</div>
                  {!is_workflow ? <div>Would you like to use the existing owner instead?</div> : ""}
                </div>
              </Modal.Body>
              <Modal.Footer>
                {!is_workflow ? <Button variant="primary" onClick={() => {handleDuplicateOwner(error.error[1], formikProps.values)}}>Yes</Button> : ""}
                <Button variant="secondary" onClick={handleErrorClose}>Close</Button>
              </Modal.Footer>
            </Modal>
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

export default PersonForm;
