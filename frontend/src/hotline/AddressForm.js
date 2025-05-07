import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useNavigationPrompt, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as Yup from 'yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import Scrollbar from '../components/Scrollbars';
import { AddressSearch, Checkbox, Radio, TextInput } from '../components/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft, faUserAlt, faUserAltSlash } from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { capitalize } from '../utils/formatString';
import ButtonSpinner from '../components/ButtonSpinner';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

// Form for owner and reporter Person objects.
const AddressForm = (props) => {

  // Determine if this is an owner or reporter when creating a Person.
  let is_owner = window.location.pathname.includes("owner");

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  const initial_coordinates = state?.incident?.coordinates ?? [0, 0];

  useNavigationPrompt(true, "Are you sure you would like to leave the animal intake workflow? No data will be saved.");

  const [data, setData] = useState(props.state.steps.initial);
  const [existingOwner, setExistingOwner] = useState({id:''});
  const [existingRequest, setExistingRequest] = useState({id:''});
  const [existingOwners, setExistingOwners] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchExistingServiceRequestData = async () => {
      let service_requests = [];
      if (!unmounted) {
        let nextUrl = '/hotline/api/servicerequests/?page=1&page_size=100&incident=' + props.incident + '&organization='+ props.organization + '&exclude_status=canceled&light=true';
        do {
          const response = await axios.get(nextUrl, {
            cancelToken: source.token,})
          .catch(error => {
            if (error.response) {
              setShowSystemError(true);
            }
          });

          service_requests.push(...response.data.results);
          nextUrl = response.data.next;
          if (nextUrl) {
            nextUrl = '/hotline/' + response.data.next.split('/hotline/')[1];
          }
        } while(nextUrl != null)

        setExistingRequests(service_requests);
      }
    }
    fetchExistingServiceRequestData();

    const fetchExistingOwnerData = async () => {
      // Fetch all owners data.
      let owners = [];
      if (!unmounted) {
        let nextUrl = '/people/api/person/?page=1&page_size=100&light=true&incident=' + props.incident + '&organization=' + props.organization +'&training=' + state.incident.training;
        do {
          const response = await axios.get(nextUrl, {
            cancelToken: source.token,
          })
          .catch(error => {
            if (error.response) {
              setShowSystemError(true);
            }
          });

          owners.push(...response.data.results);
          nextUrl = response.data.next;
          if (nextUrl) {
            nextUrl = '/people/' + response.data.next.split('/people/')[1];
          }
        } while(nextUrl != null)

        setExistingOwners(owners);
      }
    }
    fetchExistingOwnerData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize={true}
        validationSchema={Yup.object({
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
        onSubmit={(values, { setSubmitting, resetForm }) => {
          if (existingRequest.id) {
            axios.get('/hotline/api/incident/' + state.incident.id + '/servicerequests/' + existingRequest.id_for_incident + '/', {
            })
            .then(response => {
              props.onSubmit('initial', values, is_owner ? 'owners' : 'reporter', response.data);
            })
            .catch(error => {
              setShowSystemError(true);
            });
          }
          else if (existingOwner.id) {
            props.onSubmit('initial', existingOwner, is_owner ? 'owners' : 'reporter');
          }
          else {
            props.onSubmit('initial', values, is_owner ? 'owners' : 'reporter');
          }
        }}
      >
        {formikProps => (
          <Card border="secondary" className={"mt-3"}>
            <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Lookup Address</Card.Header>
            <Card.Body>
              <BootstrapForm noValidate>
                <AddressSearch formikProps={formikProps} initialData={props.state.steps.initial} label="Search for Service Request Address" incident={props.incident} initial_coordinates={initial_coordinates} show_apt={true} address_form={true} error="Address was not selected." />
              </BootstrapForm>
              <h4>Use Matching Service Request</h4>
              <Col xs={9} className="border rounded" style={{marginLeft:"1px", height:existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "59px" : "169px", overflowY:"auto", paddingRight:"-1px"}}>
                <Scrollbar no_shadow="true" style={{height:existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "57px" : "167px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).map(service_request => (
                    <div key={service_request.id} className="mt-1 mb-1" style={{height:"50px"}}>
                      <div className="card-header rounded" style={{paddingLeft:"12px", height:"50px"}}>
                        <Radio
                          id={String(service_request.id)}
                          name={String(service_request.id)}
                          checked={existingRequest.id === service_request.id}
                          style={{
                            transform: "scale(1.25)",
                            marginLeft: "-14px",
                            marginTop: "-7px",
                            marginBottom: "-5px"
                          }}
                          onChange={(e) => {
                            setExistingRequest(existingRequest.id === service_request.id ? {id:''} : service_request);
                            setExistingOwner({id:''});
                          }}
                        />
                        SR#{service_request.id_for_incident} - {capitalize(service_request.status)} - {service_request.full_address}
                        {service_request.owner_names.length === 0 ?
                          <OverlayTrigger
                            key={"stray"}
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-stray`}>
                                Animal is stray
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faUserAltSlash} className="ml-1 mr-1" size="sm" />
                          </OverlayTrigger> :
                          <OverlayTrigger
                            key={"owners"}
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-owners`}>
                                Owners:
                                {service_request.owner_names.map(owner_name => (
                                  <div key={owner_name}>{owner_name}</div>
                                ))}
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faUserAlt} className="ml-1 mr-1" size="sm" />
                          </OverlayTrigger>
                        }
                        ({service_request.animal_count || 0} Animal{service_request.animal_count === 1 ? '' : 's'})
                      </div>
                    </div>
                  ))}
                  {!formikProps.values.address || existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? <div className="card-header mt-1 mb-1 rounded">
                    No matching Service Requests found.
                  </div> : ""}
                </Scrollbar>
              </Col>
              {is_owner ? <>
              <h4 className="mt-3">Use Matching Owner</h4>
              <Col xs={9} className="border rounded" style={{marginLeft:"1px", height:existingOwners.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "59px" : "169px", overflowY:"auto", paddingRight:"-1px"}}>
                <Scrollbar no_shadow="true" style={{height:existingOwners.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "57px" : "167px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {existingOwners.filter(owner => formikProps.values.address && owner.address === formikProps.values.address && owner.city === formikProps.values.city && owner.state === formikProps.values.state).map(owner => (
                    <span key={owner.id}>
                    <div className="mt-1 mb-1">
                      <div className="card-header rounded" style={{paddingLeft:"12px", height:"50px"}}>
                        <Radio
                          id={String(owner.id)}
                          name={String(owner.id)}
                          checked={Number(existingOwner.id) === owner.id}
                          style={{
                            transform: "scale(1.25)",
                            marginLeft: "-14px",
                            marginTop: "-7px",
                            marginBottom: "-5px"
                          }}
                          onChange={() => {
                            setExistingOwner(existingOwner.id === owner.id ? {id:''} : owner);
                            setExistingRequest({id:''})}}
                        />
                        {owner.first_name} {owner.last_name} - {owner.display_phone}
                      </div>
                    </div>
                    </span>
                  ))}
                  {!formikProps.values.address || existingOwners.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ?<div className="card-header mt-1 mb-1 rounded">
                    No matching Owners found.
                  </div> : ""}
                </Scrollbar>
              </Col>
              </>: ""}
            </Card.Body>
            <ButtonGroup size="lg" >
              <ButtonSpinner isSubmitting={formikProps.isSubmitting} disabled={!formikProps.values.address} isSubmittingText="Loading..." type="button" className="btn btn-primary border" onClick={() => { formikProps.submitForm(); }}>
                Next Step
              </ButtonSpinner>
            </ButtonGroup>
          </Card>
        )}
      </Formik>
    </>
  );
};

export default AddressForm;
