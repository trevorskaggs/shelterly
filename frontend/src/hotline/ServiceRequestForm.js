import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate, useNavigationPrompt } from 'raviger';
import { Field, Form, Formik } from 'formik';
import { Button, ButtonGroup, Card, Col, Form as BootstrapForm, OverlayTrigger, Tooltip, Modal, Row } from "react-bootstrap";
import * as Yup from 'yup';
import { Switch } from 'formik-material-ui';
import 'flatpickr/dist/themes/light.css';
import { Map, Marker, Tooltip as MapTooltip, TileLayer } from "react-leaflet";
import { AddressSearch, DateTimePicker, DropDown, TextInput } from '../components/Form';
import { Legend, pinMarkerIcon } from "../components/Map";
import { AuthContext } from "../accounts/AccountsReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { priorityChoices } from '../constants';
import { SystemErrorContext } from '../components/SystemError';
import moment from 'moment';

// Form for Service Request objects.
function ServiceRequestForm(props) {

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const markerRef = useRef(null);
  const mapRef = useRef(null);

  const id = props.id;
  const incident = props.incident;
  const initial_coordinates = state?.incident?.coordinates ?? [0, 0];

  // Determine if we're in the hotline workflow.
  var is_workflow = window.location.pathname.includes("workflow");

  // Determine if this is from a first responder when creating a SR.
  var is_first_responder = window.location.pathname.includes("first_responder");

  // Check user navigating away when in workflow.
  const [redirectCheck, setRedirectCheck] = useState(is_workflow);
  useNavigationPrompt(redirectCheck, "Are you sure you would like to leave the animal intake workflow? No data will be saved.");

  // Is submitting state for save/next workflow buttons.
  const [isButtonSubmitting, setIsButtonSubmitting] = useState(false);

  const [initialLatLon, setInitialLatLon] = useState(state.incident.coordinates);

  const updatePosition = (formikProps) => {
    const marker = markerRef.current;
    const map = mapRef.current
    if (marker !== null) {
      const latLon = marker.leafletElement.getLatLng();
      // Preserve the original map center LatLon.
      if (initialLatLon[0] === 0) {
        setInitialLatLon([formikProps.values.latitude, formikProps.values.longitude])
      }
      formikProps.setFieldValue("latitude", +(Math.round(latLon.lat + "e+4") + "e-4"));
      formikProps.setFieldValue("longitude", +(Math.round(latLon.lng + "e+4") + "e-4"));
      map.leafletElement.setView(latLon);
    }
}

  // Initial ServiceRequest data.
  const [data, setData] = useState({
    owners: [],
    reporter: null,
    id: props.state.steps.request.id || null,
    directions: props.state.steps.request.directions || '',
    priority: props.state.steps.request.priority || 2,
    followup_date: props.state.steps.request.followup_date || new Date().toJSON().slice(0, 10),
    address: props.state.steps.request.address || props.state.steps.initial.address || '',
    apartment: props.state.steps.request.apartment || props.state.steps.initial.apartment || '',
    city: props.state.steps.request.city || props.state.steps.initial.city || '',
    state: props.state.steps.request.state || props.state.steps.initial.state || '',
    zip_code: props.state.steps.request.zip_code || props.state.steps.initial.zip_code || '',
    latitude: props.state.steps.request.latitude || props.state.steps.initial.latitude || null,
    longitude: props.state.steps.request.longitude || props.state.steps.initial.longitude || null,
    verbal_permission: props.state.steps.request.verbal_permission || false,
    key_provided: props.state.steps.request.key_provided || false,
    accessible: props.state.steps.request.accessible || false,
    turn_around: props.state.steps.request.turn_around || false,
    incident_slug: props.incident,
    organization_slug: props.organization,
  });

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    if (id) {
      const fetchServiceRequestData = async () => {
        // Fetch ServiceRequest data.
        await axios.get('/hotline/api/incident/' + state.incident.id + '/servicerequests/' + id + '/', {
          cancelToken: source.token,
        })
        .then(response => {
          if (!unmounted) {
            setData(response.data);
          }
        })
        .catch(error => {
          if (!unmounted) {
            setShowSystemError(true);
          }
        });
      };
      fetchServiceRequestData();
    }

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <Formik
      initialValues={data}
      enableReinitialize={true}
      validationSchema={Yup.object({
        priority: Yup.number(),
        followup_date: Yup.date().required('Followup date is required'),
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
        if (is_workflow) {
          setRedirectCheck(false);
          // Create Reporter
          let reporterResponse = [{data:{id:props.state.steps.reporter.id}}];
          if (props.state.steps.reporter.first_name && !props.state.steps.reporter.id) {
            reporterResponse = await Promise.all([
              axios.post('/people/api/person/', props.state.steps.reporter)
            ]);
          }
          else if (props.state.steps.reporter.first_name && props.state.steps.reporter.id) {
            reporterResponse = await Promise.all([
              axios.put('/people/api/person/' + props.state.steps.reporter.id + '/', props.state.steps.reporter)
            ]);
          }
          // Create Owner
          let promises = [];
          props.state.steps.owners.forEach(owner => {
            if (owner.first_name && !owner.id) {
              promises.push(
                axios.post('/people/api/person/', owner)
              );
            }
            else if (owner.first_name && owner.id) {
              promises.push(
                axios.put('/people/api/person/' + owner.id + '/', owner)
              );
            }
          });

          let owners = [];
          Promise.all(promises)
          .then( async (ownerResponse) => {
            owners = ownerResponse.map(response => response.data.id);
            values['owners'] = owners;
            values['reporter'] = reporterResponse[0].data.id

            // Set status to open if it was closed.
            values['status'] = props.state.steps.request.status === 'closed' ? 'open' : props.state.steps.request.status;
            let requestResponse = [{data:{id:props.state.steps.request.id}}];
            // Update Service Request if it already exists.
            if (props.state.steps.request.id) {
              requestResponse = await Promise.all([
                axios.put('/hotline/api/servicerequests/' + props.state.steps.request.id + '/', values)
                .catch(error => {
                  setIsButtonSubmitting(false);
                  setRedirectCheck(true);
                  setShowSystemError(true);
                })
              ])
            }
            else {
              // Create Service Request
              requestResponse = await Promise.all([
                axios.post('/hotline/api/servicerequests/?incident=' + incident, values)
                .catch(error => {
                  setIsButtonSubmitting(false);
                  setRedirectCheck(true);
                  setShowSystemError(true);
                })
              ])
            }
            // Create Animals
            let animal_promises = props.state.steps.animals.map(async (animal, index) => {
              // Add owner and reporter to animal data.
              if (reporterResponse[0].data.id) {
                animal instanceof FormData ? animal.append('reporter', reporterResponse[0].data.id) : animal['reporter'] = reporterResponse[0].data.id;
              }
              if (owners.length) {
                animal instanceof FormData ? animal.append('new_owners', owners) : animal['new_owners'] = owners;
              }
              animal instanceof FormData ? animal.append('request', requestResponse[0].data.id) : animal['request'] = requestResponse[0].data.id;
              let animal_id = animal instanceof FormData ? animal.get('id') : animal.id
              if (animal_id) {
                return new Promise(resolve => {
                  setTimeout(() => resolve(axios.put('/animals/api/animal/' + animal_id + '/', animal)), 500 * index)
                })
              }
              else {
                return new Promise(resolve => {
                  setTimeout(() => resolve(axios.post('/animals/api/animal/', animal)), 500 * index)
                })
              }
            });
            await Promise.all(animal_promises)
            .finally((results) => {
              navigate('/' + props.organization + '/' + incident + '/hotline/servicerequest/' + requestResponse[0].data.id_for_incident);
            })
            .catch(error => {
              setIsButtonSubmitting(false);
              setRedirectCheck(true);
              setShowSystemError(true);
            });
          })
          .catch(error => {
            setIsButtonSubmitting(false);
            setShowSystemError(true);
            setRedirectCheck(true);
          });
        }
        else if (id) {
          axios.put('/hotline/api/servicerequests/' + data.id + '/?incident=' + incident + '&organization=' + props.organization, values)
          .then(function() {
            if (state.prevLocation) {
              navigate(state.prevLocation);
            }
            else {
              navigate('/' + props.organization + '/' + incident + '/hotline/servicerequest/' + id);
            }
          })
          .catch(error => {
            setIsButtonSubmitting(false);
            setShowSystemError(true);
          });
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
            {is_workflow ?
              <span>
                <Col className="pr-0 pl-0 mb-3" xs="6" style={{marginTop:"0px"}}>
                  <b>Service Request Address: </b>{formikProps.values.address}{formikProps.values.apartment ? <span> Apt #{formikProps.values.apartment}</span> : ""}, {formikProps.values.city}, {formikProps.values.state}
                  <br />
                  <BootstrapForm.Label className="mt-2">Refine Exact Lat/Lon Point</BootstrapForm.Label>
                  <Map zoom={15} ref={mapRef} center={[initialLatLon[0] || formikProps.values.latitude || 0, initialLatLon[1] || formikProps.values.longitude || 0]} className="animal-search-leaflet-container border rounded" >
                    <Legend position="bottomleft" metric={false} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {formikProps.values.latitude && formikProps.values.longitude ?
                    <Marker
                      draggable={true}
                      onDragEnd={() => {updatePosition(formikProps)}}
                      autoPan={true}
                      position={[formikProps.values.latitude, formikProps.values.longitude]}
                      icon={pinMarkerIcon}
                      ref={markerRef}
                    >
                      <MapTooltip autoPan={false} direction="top">
                        <div>
                          {formikProps.values.full_address}
                        </div>
                        <div>
                          Lat: {formikProps.values.latitude}, Lon: {formikProps.values.longitude}
                        </div>
                      </MapTooltip>
                    </Marker>
                    : ""}
                  </Map>
                </Col>
              </span>
            :
              <AddressSearch formikProps={formikProps} label="Search for Service Request Address" show_apt={true} disabled={is_workflow ? true : false} incident={props.incident} initial_coordinates={initial_coordinates} error="Service Request Address was not selected." />
            }
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
            <BootstrapForm.Row className="mt-3 mb-3">
              <DateTimePicker
                label="Service Request Followup Date"
                name={`followup_date`}
                id={`followup_date`}
                // more_options={{minDate:'today'}}
                clearable={false}
                xs="4"
                data-enable-time={false}
                onChange={(date, dateStr) => {
                  formikProps.setFieldValue(`followup_date`, dateStr)
                }}
                value={formikProps.values.followup_date||data.followup_date}
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
              <TextInput
                as="textarea"
                rows={5}
                label="Instructions for Field Team"
                name="directions"
                id="directions"
                xs="12"
              />
            </BootstrapForm.Row>
            <BootstrapForm.Row>
                <span hidden={is_first_responder}><BootstrapForm.Label htmlFor="verbal_permission" className="ml-1">
                Verbal Liability Release
                { state.organization.verbal_liability_release != '' ?
                  <OverlayTrigger
                  key={"verbal"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-verbal`}>
                      { state.organization.verbal_liability_text }
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="lg" className="fa-move-up" transform={'shrink-2'} />
                </OverlayTrigger> : ""
                }
              </BootstrapForm.Label>
              <Field component={Switch} name="verbal_permission" type="checkbox" color="primary"/>
 

              <BootstrapForm.Label htmlFor="key_provided">Key at Staging</BootstrapForm.Label>
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
              Finish and {props.state.steps.request.id ? 'Update' : 'Create'} Service Request
            </ButtonSpinner> :
            <ButtonSpinner isSubmitting={isButtonSubmitting} isSubmittingText="Saving..." type="submit" onClick={() => { formikProps.submitForm()}}>Save</ButtonSpinner>
          }
        </ButtonGroup>
      </Card>
      </>
      )}
    </Formik>
  );
}

export default ServiceRequestForm;
