import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate, useNavigationPrompt, useQueryParams } from 'raviger';
import { Formik, useFormikContext } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import * as Yup from 'yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import { AddressSearch, TextInput } from '../components/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

// Form for owner and reporter Person objects.
const PersonForm = (props) => {

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const existingOwnerRef = useRef(null);

  const id = props.id;
  const incident = "/" + props.incident

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  // Determine if this is an owner or reporter when creating a Person.
  let is_owner = window.location.pathname.includes("owner");

  // Determine if this is an intake workflow.
  let is_intake = window.location.pathname.includes("intake");

  // Determine if this is a first responder when creating a Person.
  let is_first_responder = window.location.pathname.includes("first_responder");

  useNavigationPrompt(is_workflow, "Are you sure you would like to leave the animal intake workflow? No data will be saved.");

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
  const [isOwner, setIsOwner] = useState(props.state.stepIndex > 1 || is_owner);

  const [existingOwner, setExistingOwner] = useState(props.state.steps.owner.id ? true : false);
  const [existingReporter, setExistingReporter] = useState(props.state.steps.reporter.id ? true : false);

  // Control Agency display.
  const [showAgency, setShowAgency] = useState(props.state.stepIndex === 1 && is_first_responder);

  const initialData = {
    existing_owner: '',
    has_id: false,
    first_name: '',
    last_name: '',
    phone: '',
    alt_phone: '',
    email: '',
    comments: '',
    show_agency: showAgency,
    agency: '',
    drivers_license: '',
    address: props.state ? props.state.steps.initial.address : '',
    apartment: props.state ? props.state.steps.initial.apartment : '',
    city: props.state ? props.state.steps.initial.city : '',
    state: props.state ? props.state.steps.initial.state : '',
    zip_code: props.state ? props.state.steps.initial.zip_code : '',
    request: servicerequest_id,
    animal: animal_id,
    owner: owner_id,
    latitude: props.state ? props.state.steps.initial.latitude : null,
    longitude: props.state ? props.state.steps.initial.longitude : null,
    change_reason: '',
    incident: state.incident.id
  }
  let current_data = initialData;
  if (is_workflow) {
    if (isOwner) {
      current_data = props.state.steps.owner.first_name ? props.state.steps.owner : props.state.steps.initial;
    }
    else {
      current_data = props.state.steps.reporter.first_name ? props.state.steps.reporter : props.state.steps.initial;
    }
    current_data['show_agency'] = showAgency;
    current_data['incident'] = state.incident.id;
  }

  // Initial Person data.
  const [data, setData] = useState(current_data);

  const [existingOwners, setExistingOwners] = useState({data:{}, options:[], fetching:true});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchPersonData = async () => {
        // Fetch Person data.
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
            response.data['has_id'] = id && isOwner ? true : false;
            setData(response.data);
          }
        })
        .catch(error => {
          if (!unmounted) {
            setShowSystemError(true);
          }
        });
      };
      fetchPersonData();
    }
    const fetchExistingOwnerData = async () => {
      // Fetch all owners data.
      await axios.get('/people/api/person/?light=true&incident=' + props.incident + '&organization=' + props.organization +'&training=' + state.incident.training, {
        cancelToken: source.token,
      })
      .then(existingOwnersResponse => {
        if (!unmounted) {
          let options = [];
          existingOwnersResponse.data.forEach(owner => {
            options.push({id: owner.id, label: owner.first_name + ' ' + owner.last_name + ' ' + owner.display_phone})
          })
          setExistingOwners({data:existingOwnersResponse.data, options:options, fetching:false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    }
    fetchExistingOwnerData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, isOwner]);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
          has_id: Yup.boolean(),
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
            .min(10, "Phone number is not valid")
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
            .when('has_id', {
              is: true,
              then: Yup.string().required('Required').max(50, 'Must be 50 characters or less')}),
        })}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          if (is_workflow) {
            // Check to see if owner data already exists.
            axios.get('/people/api/person/?search=' + values.first_name +  ' ' + values.last_name + ' ' + values.phone.replace(/\D/g, "")  + '&incident=' + props.incident + '&organization=' + props.organization +'&training=' + (state && state.incident.training))
            .then(response => {
              // If we have a dupe owner then use it.
              // if (!existingOwner && dupeOwner) {
              //   values['id'] = response.data[0].id;
              // }
              // if (response.data.length > 0 && !existingOwner && !dupeOwner) {
              //   // Throw error if duplicate owner found.
              //   if (isOwner) {
              //     setError({show:true, error:['a duplicate owner with the same name and phone number already exists.', response.data[0].id]});
              //     setSubmitting(false);
              //   }
              //   // Use existing person object if duplicate reporter found.
              //   else {
              //     values['id'] = response.data[0].id;
              //   }
              // }
              // Only continue on from owner if there are no errors.
              if (isOwner) {
                props.onSubmit('owner', values, 'animals');
              }
              // Always continue on if reporter.
              else {
                if (skipOwner) {
                  props.onSubmit('reporter', values, 'animals');
                }
                else {
                  props.onSubmit('reporter', values, 'owner');
                  setIsOwner(true);
                  setShowAgency(false);
                  setExistingOwner(props.state.steps.owner.id ? true : false);
                  if (props.state.steps.owner.first_name){
                    resetForm({values:props.state.steps.owner});
                  }
                  else {
                    existingOwnerRef.current.clear();
                    resetForm({values:initialData});
                  }
                }
              }
            })
            .catch(error => {
              setSubmitting(false);
              setShowSystemError(true);
            });
          }
          else if (id) {
            axios.put('/people/api/person/' + id + '/', values)
            .then(function() {
              if (isOwner) {
                navigate('/' + props.organization + incident + '/people/owner/' + id);
              }
              else {
                navigate('/' + props.organization + incident + '/people/reporter/' + id);
              }
            })
            .catch(error => {
              setSubmitting(false);
              setShowSystemError(true);
            });
          }
          else {
            values['incident_slug'] = props.incident;
            axios.post('/people/api/person/', values)
            .then(response => {
              // If SR already exists, redirect to the SR details.
              if (servicerequest_id) {
                navigate('/' + props.organization + incident + '/hotline/servicerequest/' + response.data.requests.filter(request => Number(request.id) === Number(servicerequest_id))[0].id_for_incident);
              }
              // If adding from an animal, redirect to the Animal details.
              else if (animal_id) {
                navigate('/' + props.organization + incident + '/animals/' + animal_id);
              }
              // If adding from an owner, redirect to the new Owner details.
              else {
                navigate('/' + props.organization + incident + '/people/owner/' + response.data.id);
              }
            })
            .catch(error => {
              setShowSystemError(true);
              setSubmitting(false);
            });
          }
        }}
      >
        {formikProps => (
          <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
            {id ?
              <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Update {isOwner ? "Owner" : "Reporter"}</Card.Header>
              :
              <Card.Header as="h5" className="pl-3">
                <span style={{cursor:'pointer'}} onClick={() => {
                  if (!isOwner) {
                    props.handleBack('reporter', 'initial')
                  }
                  else if (props.state.steps.reporter.first_name) {
                    setIsOwner(false);
                    setShowAgency(is_first_responder);
                    formikProps.resetForm({values:props.state.steps.reporter});
                    props.handleBack('owner', 'reporter')
                  }
                  else {
                    props.handleBack('owner', 'initial')
                  }
                }} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          {isOwner ? "Owner" : "Reporter"}{is_workflow ? " Information" : ""}
          </Card.Header>}
          <Card.Body>
          <BootstrapForm noValidate>
            {/* Only show existing owner if owner and in a workflow/intake */}
            <span hidden={!(is_workflow || is_intake)}>
              <label>Use Existing {isOwner ? "Owner" : "Reporter"}</label>
              <Typeahead
                id="existing_owner"
                className="mb-3"
                ref={existingOwnerRef}
                onChange={(values) => {
                  if (values.length) {
                    setData(existingOwners.data.filter(owner => owner.id === values[0].id)[0]);
                    if (isOwner) {
                      setExistingOwner(true);
                    }
                    else {
                      setExistingReporter(true);
                    }
                  }
                  else {
                    setData({...initialData, ...props.state.steps.initial});
                    if (isOwner) {
                      setExistingOwner(false);
                    }
                    else {
                      setExistingReporter(false);
                    }
                  }
                }}
                options={existingOwners.options}
                placeholder={existingOwners.fetching ? "Loading..." : "Search..."}
                disabled={existingOwners.fetching ? true : false}
                emptyLabel="No matches found. Please fill out the form below."
              />
            </span>
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
            <AddressSearch formikProps={formikProps} label="Search for Contact Address" incident={props.incident} show_apt={true} show_same={true} hidden={id || !isOwner} initialData={props.state.steps.initial} error="Contact Address was not selected." existingOwner={isOwner ? existingOwner : existingReporter} />
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
              {!is_first_responder && !is_workflow ?
                <ButtonSpinner isSubmitting={formikProps.isSubmitting && !skipOwner} isSubmittingText="Saving..." type="button" onClick={() => { setSkipOwner(false); formikProps.submitForm() }}>
                  {!isOwner && !is_intake ? <span>{!id ? "Add Owner" : "Save"}</span> : "Save"}
                </ButtonSpinner> : ""}
              {/* workflow buttons */}
              {is_workflow && !isOwner ?
                <ButtonSpinner isSubmitting={formikProps.isSubmitting && !skipOwner} isSubmittingText="Saving..." type="button" onClick={() => { setSkipOwner(false); formikProps.submitForm(); }}>
                  {props.state.steps.owner.first_name ? "Change Owner" : "Add Owner"}
                </ButtonSpinner> : ""}
              {is_workflow ?
                <ButtonSpinner isSubmitting={formikProps.isSubmitting && skipOwner} isSubmittingText="Loading..." type="button" className="btn btn-primary border" onClick={() => { setSkipOwner(true); formikProps.submitForm(); }}>
                  Next Step
                </ButtonSpinner> : ""}
            </ButtonGroup>
          </Card>
        )}
      </Formik>
    </>
  );
};

export default PersonForm;
