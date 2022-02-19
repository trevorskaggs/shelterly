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

// Form for Service Request objects.
function ServiceRequestForm(props) {

  const { state } = useContext(AuthContext);
  const id = props.id;

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  // Determine if this is from a first responder when creating a SR.
  var is_first_responder = window.location.pathname.includes("first_responder");

  // Track duplicate request address error.
  const [error, setError] = useState({show:false, error:[]});
  const handleClose = () => setError({show:false, error:[]});

  // Initial ServiceRequest data.
  const [data, setData] = useState({
    owners: [],
    reporter: null,
    directions: '',
    priority: 2,
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

  const priorityChoices = [
    { value: 1, label: 'Highest' },
    { value: 2, label: 'High' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'Low' },
    { value: 5, label: 'Lowest' }
  ]

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
            // Create Service Request
            values['reporter'] = reporterResponse[0].data.id
            if (ownerResponse[0].data.id) {
              values['owners'] = [ownerResponse[0].data.id]
            }
            axios.post('/hotline/api/servicerequests/', values)
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
                navigate('/hotline/servicerequest/' + response.data.id);
              })
            })
            .catch(error => {
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
              if (error.response.data && error.response.data[0].includes('same address')) {
                setError({show:true, error:error.response.data});
              }
            });
            setSubmitting(false);
          }
      }}
    >
      {formikProps => (
        <>
        <Card border="secondary" className={is_workflow ? "mt-3" : "mt-5"}>
        <Card.Header as="h5">{id ?
          <span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>
          :
          <span style={{cursor:'pointer'}} onClick={() => {props.handleBack('request', 'animals')}} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>}{id ? "Update " : ""}Service Request{is_workflow ? " Information" :""}
        </Card.Header>
        <Card.Body>
          <BootstrapForm as={Form}>
            <AddressSearch formikProps={formikProps} label="Search for Service Request Address" show_apt={true} show_same={props.state.steps.owner.address} />
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
                label="Directions"
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
            <Button className="btn btn-primary border" type="submit" onClick={() => { formikProps.submitForm()}}>Finish and Create Service Request</Button> :
            <Button type="submit" onClick={() => { formikProps.submitForm()}}>Save</Button>
          }
        </ButtonGroup>
      </Card>
      <Modal show={error.show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Duplicate Service Request Address Found</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {error && error.error[0]}
            &nbsp;Click <Link href={'/hotline/servicerequest/' + error.error[1]} style={{color:"#8d99d4"}}>here</Link> to view this Service Request.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
      </>
      )}
    </Formik>
  );
}

export default ServiceRequestForm;
