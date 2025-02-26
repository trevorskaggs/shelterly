import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useNavigationPrompt, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, Modal } from "react-bootstrap";
import * as Yup from 'yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import Scrollbar from '../components/Scrollbars';
import { AddressSearch, Checkbox, TextInput } from '../components/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

// Form for owner and reporter Person objects.
const AddressForm = (props) => {

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  useNavigationPrompt(true, "Are you sure you would like to leave the animal intake workflow? No data will be saved.");

  // Identify any query param data.
  // const [queryParams] = useQueryParams();
  // const {
  // } = queryParams;


  // Track duplicate owner error.
  // const [error, setError] = useState({show:false, error:[]});
  // const [dupeOwner, setDupeOwner] = useState(false);
  // const handleErrorClose = () => {setError({show:false, error:[]}); setDupeOwner(null);}

  // const handleDuplicateOwner = (dupe_id, formikProps) => {
  //   if (is_workflow) {
  //     setDupeOwner(true);
  //     formikProps.submitForm();
  //   }
  //   else {
  //     axios.patch('/people/api/person/' + dupe_id + '/', formikProps.values)
  //     .then(response => {
  //       // If SR already exists, redirect to the SR details.
  //       if (servicerequest_id) {
  //         navigate('/' + props.organization + incident + '/hotline/servicerequest/' + response.data.requests.filter(request => request.id === servicerequest_id)[0].id_for_incident);
  //       }
  //       // If adding from an animal, redirect to the Animal details.
  //       else if (animal_id) {
  //         navigate('/' + props.organization + incident + '/animals/' + animal_id);
  //       }
  //       // Otherise redirect to the duplicate Owner details.
  //       else {
  //         navigate('/' + props.organization + incident + '/people/owner/' + response.data.id);
  //       }
  //     })
  //     .catch(error => {
  //       setShowSystemError(true);
  //     });
  //   }
  // }

  // Initial Person data.
  const [data, setData] = useState(props.state.steps.initial);

  const [existingOwners, setExistingOwners] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchExistingServiceRequestData = async () => {
      axios.get('/hotline/api/servicerequests/?incident=' + props.incident + '&light=true')
      .then(existingRequestsResponse => {
        if (!unmounted) {
          console.log(existingRequestsResponse.data)
          setExistingRequests(existingRequestsResponse.data);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    }
    fetchExistingServiceRequestData();

    const fetchExistingOwnerData = async () => {
      // Fetch all owners data.
      await axios.get('/people/api/person/?light=true&incident=' + props.incident + '&organization=' + props.organization +'&training=' + state.incident.training, {
        cancelToken: source.token,
      })
      .then(existingOwnersResponse => {
        if (!unmounted) {
          // let options = [];
          // existingOwnersResponse.data.forEach(owner => {
          //   options.push({id: owner.id, label: owner.first_name + ' ' + owner.last_name + ' ' + owner.display_phone})
          // })
          console.log(existingOwnersResponse.data)
          setExistingOwners(existingOwnersResponse.data);
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
          // do something
        }}
      >
        {formikProps => (
          <Card border="secondary" className={"mt-3"}>
            <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Lookup Address</Card.Header>
            <Card.Body>
              <BootstrapForm noValidate>
                <AddressSearch formikProps={formikProps} label="Search for Address" incident={props.incident} show_apt={true} error="Address was not selected." />
              </BootstrapForm>
              <h4>Matching Service Requests</h4>
              <Col xs={9} className="border rounded" style={{marginLeft:"1px", height:existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "59px" : "279px", overflowY:"auto", paddingRight:"-1px"}}>
                <Scrollbar no_shadow="true" style={{height:existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "57px" : "277px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).map(service_request => (
                    <span key={service_request.id}>
                    <div className="mt-1 mb-1">
                      <div className="card-header rounded">
                        <Checkbox
                          id={String(service_request.id)}
                          name={String(service_request.id)}
                          // checked={mapState[service_request.id] ? mapState[service_request.id].checked : false}
                          style={{
                            transform: "scale(1.25)",
                            marginLeft: "-14px",
                            marginTop: "-5px",
                            marginBottom: "-5px"
                          }}
                          // onChange={() => handleMapState(service_request.id)}
                        />
                        <Link href={"/" + props.organization +"/" + props.incident + "/hotline/servicerequest/" + service_request.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>SR#{service_request.id_for_incident} - {service_request.full_address}</Link>
                      </div>
                    </div>
                    </span>
                  ))}
                  <div className="card-header mt-1 mb-1 rounded" hidden={existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0}>
                    No matching Service Requests found.
                  </div>
                </Scrollbar>
              </Col>
              <h4 className="mt-3">Matching Owners</h4>
              <Col xs={9} className="border rounded" style={{marginLeft:"1px", height:"277px", overflowY:"auto", paddingRight:"-1px"}}>
                <Scrollbar no_shadow="true" style={{height:"275px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {existingOwners.filter(owner => data.address && owner.address === data.address && owner.city === data.city).map(owner => (
                    <span key={owner.id}>
                    <div className="mt-1 mb-1">
                      <div className="card-header rounded">
                        <Checkbox
                          id={String(owner.id)}
                          name={String(owner.id)}
                          // checked={mapState[service_request.id] ? mapState[service_request.id].checked : false}
                          style={{
                            transform: "scale(1.25)",
                            marginLeft: "-14px",
                            marginTop: "-5px",
                            marginBottom: "-5px"
                          }}
                          // onChange={() => handleMapState(service_request.id)}
                        />
                        <Link href={"/" + props.organization +"/" + props.incident + "/hotline/servicerequest/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name} - {owner.display_phone}</Link>
                      </div>
                    </div>
                    </span>
                  ))}
                  <div className="card-header mt-1 mb-1 rounded" hidden={existingOwners.length === 0}>
                    No matching Owners found.
                  </div>
                </Scrollbar>
              </Col>
            </Card.Body>
            <ButtonGroup size="lg" >
              {/* form save buttons */}
              {/* {!is_first_responder && !is_workflow ?
                <ButtonSpinner isSubmitting={formikProps.isSubmitting && !skipOwner} isSubmittingText="Saving..." type="button" onClick={() => { setSkipOwner(false); formikProps.submitForm() }}>
                  {!isOwner && !is_intake ? <span>{!id ? "Add Owner" : "Save"}</span> : "Save"}
                </ButtonSpinner> : ""}
              {is_workflow && !isOwner ?
                <ButtonSpinner isSubmitting={formikProps.isSubmitting && !skipOwner} isSubmittingText="Saving..." type="button" onClick={() => { setSkipOwner(false); formikProps.submitForm(); }}>
                  {props.state.steps.owner.first_name ? "Change Owner" : "Add Owner"}
                </ButtonSpinner> : ""} */}
                <ButtonSpinner isSubmitting={formikProps.isSubmitting} isSubmittingText="Loading..." type="button" className="btn btn-primary border" onClick={() => { formikProps.submitForm(); }}>
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
