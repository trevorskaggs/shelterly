import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Field, Form, Formik } from 'formik';
import { Button, ButtonGroup, Card, Col, Form as BootstrapForm, Modal } from "react-bootstrap";
import * as Yup from 'yup';
import { Switch } from 'formik-material-ui';
import 'flatpickr/dist/themes/light.css';
import { AddressSearch, DropDown, TextInput } from '../components/Form';
import { AuthContext } from "../accounts/AccountsReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { priorityChoices } from '../constants';

// Form for Service Request objects.
function ServiceRequestForm(props) {

  const { state } = useContext(AuthContext);
  const id = props.id;
  const incident = props.incident;

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  // Determine if this is from a first responder when creating a SR.
  var is_first_responder = window.location.pathname.includes("first_responder");

  // Track duplicate request address error.
  const [skip, setSkip] = useState(false);
  const [SRs, setSRs] = useState([]);
  const [dupeSRs, setDupeSRs] = useState([]);
  const handleClose = () => setDupeSRs([]);

  // is submitting state for save/next workflow buttons
  const [isButtonSubmitting, setIsButtonSubmitting] = useState(false);

  // Initial ServiceRequest data.
  const [data, setData] = useState({
    owners: [],
    reporter: null,
    directions: props.state.steps.request.directions || '',
    priority: props.state.steps.request.priority || 2,
    address: props.state.steps.request.address || props.state.steps.owner.address || '',
    apartment: props.state.steps.request.apartment || props.state.steps.owner.apartment || '',
    city: props.state.steps.request.city || props.state.steps.owner.city || '',
    state: props.state.steps.request.state || props.state.steps.owner.state || '',
    zip_code: props.state.steps.request.zip_code || props.state.steps.owner.zip_code || '',
    latitude: props.state.steps.request.latitude || props.state.steps.owner.latitude || null,
    longitude: props.state.steps.request.longitude || props.state.steps.owner.longitude || null,
    verbal_permission: props.state.steps.request.verbal_permission || false,
    key_provided: props.state.steps.request.key_provided || false,
    accessible: props.state.steps.request.accessible || false,
    turn_around: props.state.steps.request.turn_around || false,
    incident_slug: props.incident,
  });

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchServiceRequestData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/hotline/api/servicerequests/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData(response.data);
          }
        })
        .catch(error => {
        });
      };
      fetchServiceRequestData();
    }

    axios.get('/hotline/api/servicerequests/?incident=' + incident + '&map=true')
    .then(response => {
      if (!unmounted) {
        setSRs(response.data);
      }
    })
    .catch(error => {
    });
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        priority: Yup.number(),
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
        setIsButtonSubmitting(true);
        if (SRs.filter(sr => (sr.address === values.address && sr.city === values.city && sr.state === values.state)).length > 0 && !skip) {
          setDupeSRs(SRs.filter(sr => (sr.address === values.address && sr.city === values.city && sr.state === values.state)));
          setIsButtonSubmitting(false);
        }
        else {
          if (is_workflow) {
            // Create Reporter
            let reporterResponse = [{data:{id:props.state.steps.reporter.id}}];
            if (props.state.steps.reporter.first_name && !props.state.steps.reporter.id) {
              reporterResponse = await Promise.all([
                axios.post('/people/api/person/', props.state.steps.reporter)
              ]);
            }
            // Create Owner
            let ownerResponse = [{data:{id:props.state.steps.owner.id}}];
            if (props.state.steps.owner.first_name && !props.state.steps.owner.id) {
              ownerResponse = await Promise.all([
                axios.post('/people/api/person/', props.state.steps.owner)
              ]);
            }
            // Create Service Request
            values['reporter'] = reporterResponse[0].data.id
            if (ownerResponse[0].data.id) {
              values['owners'] = [ownerResponse[0].data.id]
            }
            axios.post('/hotline/api/servicerequests/?incident=' + incident, values)
            .then(response => {
              // Create Animals
              let promises = props.state.steps.animals.map(async (animal) => {
                // Add owner and reporter to animal data.
                if (reporterResponse[0].data.id) {
                  animal.append('reporter', reporterResponse[0].data.id);
                }
                if (ownerResponse[0].data.id) {
                  animal.append('new_owner', ownerResponse[0].data.id);
                }
                animal.append('request', response.data.id);
                return axios.post('/animals/api/animal/', animal)
              });
              Promise.all(promises)
              .then((results) => {
                navigate('/' + incident + '/hotline/servicerequest/' + response.data.id);
              })
            })
            .catch(error => {
              setIsButtonSubmitting(false);
            });
          }
          else if (id) {
            axios.put('/hotline/api/servicerequests/' + id + '/?incident=' + incident, values)
            .then(function() {
              if (state.prevLocation) {
                navigate(state.prevLocation);
              }
              else {
                navigate('/' + incident + '/hotline/servicerequest/' + id);
              }
            })
            .catch(error => {
              setIsButtonSubmitting(false);
            });
          }
        }
      }}
    >
      {formikProps => (
        <>
        <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
        <Card.Header as="h5">{id ?
          <span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('request', 'animals', formikProps.values)}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}{id ? "Update " : ""}Service Request{is_workflow ? " Information" :""}
        </Card.Header>
        <Card.Body>
          <BootstrapForm as={Form}>
            <AddressSearch formikProps={formikProps} label="Search for Service Request Address" show_apt={true} show_same={props.state.steps.owner.address} incident={props.incident} error="Service Request Address was not selected." />
            <BootstrapForm.Row className="mb-3">
              <Col xs={"2"}>
                <DropDown
                  label="Priority"
                  id="priorityDropdown"
                  name="priority"
                  type="text"
                  key={`my_unique_priority_select_key__${formikProps.values.priority}`}
                  options={priorityChoices}
                  value={formikProps.values.priority||data.priority}
                  isClearable={false}
                  onChange={(instance) => {
                    formikProps.setFieldValue("priority", instance === null ? '' : instance.value);
                  }}
                />
              </Col>
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <TextInput
                as="textarea"
                rows={5}
                label="Additional Information"
                name="directions"
                id="directions"
                xs="12"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <span hidden={is_first_responder}><BootstrapForm.Label htmlFor="verbal_permission" className="ml-1">Verbal Permission</BootstrapForm.Label>
              <Field component={Switch} name="verbal_permission" type="checkbox" color="primary"/>

              <BootstrapForm.Label htmlFor="key_provided">Key Provided</BootstrapForm.Label>
              <Field component={Switch} name="key_provided" type="checkbox" color="primary" /></span>

              <span><BootstrapForm.Label htmlFor="accessible">Accessible</BootstrapForm.Label>
              <Field component={Switch} name="accessible" type="checkbox" color="primary" />

              <BootstrapForm.Label htmlFor="turn_around">Turn Around</BootstrapForm.Label>
              <Field component={Switch} name="turn_around" type="checkbox" color="primary" /></span>
            </BootstrapForm.Row>
          </BootstrapForm>
        </Card.Body>
        <ButtonGroup size="lg">
          {is_workflow ?
            <ButtonSpinner isSubmitting={isButtonSubmitting} isSubmittingText="Saving..." className="btn btn-primary border" type="submit" onClick={() => { formikProps.submitForm()}}>
              Finish and Create Service Request
            </ButtonSpinner> :
            <ButtonSpinner isSubmitting={isButtonSubmitting} isSubmittingText="Saving..." type="submit" onClick={() => { formikProps.submitForm()}}>Save</ButtonSpinner>
          }
        </ButtonGroup>
      </Card>
      <Modal show={dupeSRs.length > 0} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Duplicate Service Request Address Found</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The following Service Requests have a duplicate address:
            {dupeSRs.map(sr =>
              <li style={{marginLeft:"10px"}}><span style={{position:"relative", left:"-5px"}}>SR#{sr.id} - Click <Link target="_blank" href={"/" + incident + "/hotline/servicerequest/" + sr.id} style={{color:"#8d99d4"}}>here</Link> to view this Service Request.</span></li>
            )}
            <br/>Proceed with creating a new Service Request?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {setSkip(true);formikProps.submitForm()}}>Yes</Button>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
      </>
      )}
    </Formik>
  );
}

export default ServiceRequestForm;
