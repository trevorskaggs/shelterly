import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate, useNavigationPrompt, useQueryParams } from 'raviger';
import { Formik } from 'formik';
import { Form as BootstrapForm, Button, ButtonGroup, Card, Col, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as Yup from 'yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import Scrollbar from '../components/Scrollbars';
import { AddressSearch, Checkbox, TextInput } from '../components/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import ButtonSpinner from '../components/ButtonSpinner';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

// Form for owner and reporter Person objects.
const AddressForm = (props) => {

  // Determine if this is an owner or reporter when creating a Person.
  let is_owner = window.location.pathname.includes("owner");

  const { state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  useNavigationPrompt(true, "Are you sure you would like to leave the animal intake workflow? No data will be saved.");

  const [data, setData] = useState(props.state.steps.initial);
  const [existingOwner, setExistingOwner] = useState({id:''});
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
          if (existingOwner.id && is_owner) {
            props.onSubmit('initial', existingOwner, 'animals');
          }
          else if (existingOwner.id && !is_owner) {
            props.onSubmit('initial', existingOwner, 'reporter');
          }
          else {
            props.onSubmit('initial', values, is_owner ? 'owner' : 'reporter');
          }
        }}
      >
        {formikProps => (
          <Card border="secondary" className={"mt-3"}>
            <Card.Header as="h5" className="pl-3"><span style={{cursor:'pointer'}} onClick={() => window.history.back()} className="mr-3"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="lg" inverse /></span>Lookup Address</Card.Header>
            <Card.Body>
              <BootstrapForm noValidate>
                <AddressSearch formikProps={formikProps} initialData={props.state.steps.initial} label="Search for Service Request Address" incident={props.incident} show_apt={true} error="Address was not selected." />
              </BootstrapForm>
              <h4>Matching Service Requests</h4>
              <Col xs={9} className="border rounded" style={{marginLeft:"1px", height:existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "59px" : "169px", overflowY:"auto", paddingRight:"-1px"}}>
                <Scrollbar no_shadow="true" style={{height:existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "57px" : "167px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).map(service_request => (
                    <span key={service_request.id}>
                    <div className="mt-1 mb-1">
                      <div className="card-header rounded pl-2">
                        <OverlayTrigger
                          key={"request-details"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-request-details`}>
                              Service request details
                            </Tooltip>
                          }
                        >
                          <Link href={"/" + props.organization +"/" + props.incident + "/hotline/servicerequest/" + service_request.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}><FontAwesomeIcon icon={faDotCircle} className="mr-2" size="lg" inverse />SR#{service_request.id_for_incident} - {service_request.full_address}</Link>
                        </OverlayTrigger>
                      </div>
                    </div>
                    </span>
                  ))}
                  {!formikProps.values.address || existingRequests.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? <div className="card-header mt-1 mb-1 rounded">
                    No matching Service Requests found.
                  </div> : ""}
                </Scrollbar>
              </Col>
              <h4 className="mt-3">Matching Owners</h4>
              <Col xs={9} className="border rounded" style={{marginLeft:"1px", height:existingOwners.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "59px" : "169px", overflowY:"auto", paddingRight:"-1px"}}>
                <Scrollbar no_shadow="true" style={{height:existingOwners.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ? "57px" : "167px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {existingOwners.filter(owner => formikProps.values.address && owner.address === formikProps.values.address && owner.city === formikProps.values.city && owner.state === formikProps.values.state).map(owner => (
                    <span key={owner.id}>
                    <div className="mt-1 mb-1">
                      <div className="card-header rounded pl-3">
                        <Checkbox
                          id={String(owner.id)}
                          name={String(owner.id)}
                          checked={existingOwner.id === owner.id}
                          style={{
                            transform: "scale(1.25)",
                            marginLeft: "-14px",
                            marginTop: "-5px",
                            marginBottom: "-5px"
                          }}
                          onChange={() => setExistingOwner(owner)}
                        />
                        <Link href={"/" + props.organization +"/" + props.incident + "/hotline/servicerequest/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name} - {owner.display_phone}</Link>
                      </div>
                    </div>
                    </span>
                  ))}
                  {!formikProps.values.address || existingOwners.filter(request => formikProps.values.address && request.address === formikProps.values.address && request.city === formikProps.values.city && request.state === formikProps.values.state).length === 0 ?<div className="card-header mt-1 mb-1 rounded">
                    No matching Owners found.
                  </div> : ""}
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
