import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'raviger';
import Moment from 'react-moment';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import Flatpickr from 'react-flatpickr';
import { Formik } from "formik";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faCar, faClipboardCheck, faDownload, faUpload, faEdit, faEnvelope, faHouseDamage,
  faKey, faMapMarkedAlt, faPlusSquare, faTimes, faTrailer, faUserPlus, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { faCalendarEdit, faHammerCrash, faHomeHeart, faRightLeft, faPhoneRotary } from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import History from '../components/History';
import { Checkbox } from '../components/Form';
import AnimalCards from '../components/AnimalCards';
import PhotoDocuments from '../components/PhotoDocuments';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';
import ShelterlyPrintifyButton from "../components/ShelterlyPrintifyButton";
import LoadingLink from "../components/LoadingLink";
import ActionsDropdown from '../components/ActionsDropdown';
import { useLocationWithRoutes } from '../hooks';
import { printServiceRequestSummary, printSrAnimalCareSchedules } from './Utils';

import '../assets/styles.css';

function ServiceRequestDetails({ id, incident, organization }) {

  const { state } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const { setShowSystemError } = useContext(SystemErrorContext);
  const { getFullLocationFromPath } = useLocationWithRoutes();
  const datetime = useRef(null);

  const [showTransfer, setShowTransfer] = useState(false);
  const handleCloseTransfer = () => setShowTransfer(false);
  const [transferData, setTransferData] = useState({'new_request_id':null, 'animal_ids':[]});

  const openCalendar = () => {
    setTimeout(() => datetime.current.flatpickr.open(), 0);
  }
  const priorityText = {1:'Highest', 2:'High', 3:'Medium', 4:'Low', 5:'Lowest'};

  const [showModal, setShowModal] = useState(false);
  const cancelServiceRequest = () => {
    setIsLoading(true);
    axios.patch('/hotline/api/servicerequests/' + data.id + '/', {status:'canceled'})
      .finally(() => setIsLoading(false));
    setData(prevState => ({ ...prevState, 'status':'Canceled', 'animals':prevState['animals'].map(animal => ({...animal, status:'CANCELED'}))}));
    setShowModal(false)
  }

  const clearDate = useCallback(() => {
    if (datetime.current) {
      datetime.current.flatpickr.clear();
      axios.patch('/hotline/api/servicerequests/' + data.id + '/', {followup_date:null})
      .catch(error => {
        setShowSystemError(true);
      });
    }
  }, [id, datetime]);

  const [data, setData] = useState({
    id: '',
    id_for_incident: '',
    animals: [],
    owners: [],
    owner_objects: [],
    reporter: '',
    reporter_object: {first_name:'', last_name:'', display_phone:''},
    directions: '',
    priority: '',
    address: '',
    full_address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    verbal_permission: false,
    key_provided: false,
    accessible: false,
    turn_around: false,
    followup_date: null,
    assigned_requests: [],
    status:'',
    images: [],
    action_history: [],
  });

  const [existingSRs, setExistingSRs] = useState({data:{}, options:[], fetching:true});

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  // Handle animal reunification submit.
  const handleSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/hotline/api/servicerequests/' + data.id + '/', {reunite_animals:true})
    .then(response => {
      setData(prevState => ({ ...prevState, "status":"Closed", "animals":prevState['animals'].map(animal => ({...animal, status:animal.status !== 'DECEASED' ? 'REUNITED' : 'DECEASED'})) }));
      handleClose()
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  function buildAnimalUrl(animal) {
    return getFullLocationFromPath(`/${organization}/${incident}/animals/${animal.id_for_incident}`)
  }

  const handleDownloadPdfClick = async () => {
    setIsLoading(true);
    // wait for 1 tick so spinner will set before the print button locks up the browser
    await new Promise(resolve => setTimeout(resolve, 0));
    printServiceRequestSummary(data)
      .finally(() => setIsLoading(false));
  }

  const handlePrintAllAnimalsClick = () => {
    setIsLoading(true);
    const animals = data.animals.map((animal) => ({
      ...animal,
      url: buildAnimalUrl(animal)
    }));
    return printSrAnimalCareSchedules(animals, id, setIsLoading);
  }

  const handleGeoJsonDownload = () => {
    setIsLoading(true);
    var fileDownload = require('js-file-download');
    axios.get('/hotline/api/servicerequests/' + data.id +'/download/', {
            responseType: 'blob',
        }).then(res => {
            fileDownload(res.data, 'SR-' + id + '.geojson');
        }).catch(err => {
        }).finally(() => setIsLoading(false));
  }

  const handleGeoJsonPush = () => {
    axios.get('/hotline/api/servicerequests/' + data.id + '/push/', {
            responseType: 'json',
        }).then(res => {
            console.log(res);
        }).catch(err => {
        }).finally(() => setIsLoading(false));
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    setIsLoading(true);

    const fetchServiceRequestData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/incident/' + (state ? state.incident.id : 'undefined')  + '/servicerequests/' + id + '/', {
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
      })
      .finally(() => setIsLoading(false));
    };
    fetchServiceRequestData();

    const fetchExistingSRData = async () => {
      // Fetch all owners data.
      await axios.get('/hotline/api/servicerequests/?light=true&incident=' + incident + '&organization=' + organization, {
        cancelToken: source.token,
      })
      .then(existingSRResponse => {
        if (!unmounted) {
          let options = [];
          existingSRResponse.data.filter(request => request.id_for_incident !== Number(id)).forEach(request => {
            options.push({id: request.id, label: 'SR#' + request.id_for_incident + ': ' + request.full_address})
          })
          setExistingSRs({data:existingSRResponse.data, options:options, fetching:false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    }
    fetchExistingSRData();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
      <Header>{`Service Request #${data.id_for_incident || ' - '}`}</Header>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Service Request Cancelation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this Service Request and associated animals?</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => cancelServiceRequest()}>
            Yes
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <hr/>
      <div className="row mb-2">
        <div className="col-6 d-flex">
          <Card className="mb-2 border rounded" style={{width:"100%"}}>
            <Card.Body style={{marginTop:"-10px"}}>
              <div className="d-flex justify-content-between" style={{marginBottom:"-10px"}}>
                <h4 style={{paddingTop:"12px"}}>Information&nbsp;
                  {data.verbal_permission ?
                  <OverlayTrigger
                    key={"verbal"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-verbal`}>
                        Forced entry permission granted
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faHammerCrash} size="sm" className="fa-move-up" transform={'shrink-2'} />
                  </OverlayTrigger> : ""
                  }
                  {data.key_provided ?
                  <OverlayTrigger
                    key={"key"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-key`}>
                        Key at staging
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faKey} size="sm" className="" transform={'shrink-2'} />
                  </OverlayTrigger> :
                  <OverlayTrigger
                    key={"no-key"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-no-key`}>
                        No key at staging
                      </Tooltip>
                    }
                  >
                    <span className="fa-layers" style={{marginLeft:"0px"}}>
                      <FontAwesomeIcon icon={faKey} size="sm" transform={'shrink-2'} />
                      <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-1'} />
                    </span>
                  </OverlayTrigger>
                  }
                  {data.accessible ?
                  <OverlayTrigger
                    key={"accessible"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-accessible`}>
                        Easily accessible
                      </Tooltip>
                    }
                  >
                    <span className="fa-layers">
                      <FontAwesomeIcon icon={faCar} size="sm" className="fa-move-down" />
                    </span>
                  </OverlayTrigger> :
                  <OverlayTrigger
                    key={"not-accessible"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-not-accessible`}>
                        Not easily accessible
                      </Tooltip>
                    }
                  >
                    <span className="fa-layers" style={{marginLeft:"2px"}}>
                      <FontAwesomeIcon icon={faCar} size="sm" className="fa-move-down" />
                      <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-1'} />
                    </span>
                  </OverlayTrigger>
                  }
                  {data.turn_around ?
                  <OverlayTrigger
                    key={"turnaround"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-turnaround`}>
                        Room to turn around
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faTrailer} size="sm" className="ml-2" />
                  </OverlayTrigger> :
                  <OverlayTrigger
                    key={"no-turnaround"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-no-turnaround`}>
                        No room to turn around
                      </Tooltip>
                    }
                  >
                    <span className="fa-layers ml-1">
                      <FontAwesomeIcon icon={faTrailer} size="sm" />
                      <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-1'} />
                    </span>
                  </OverlayTrigger>
                  }
                </h4>
                {isLoading ? (
                  <Spinner
                    className="align-self-center mr-3"
                    {...{
                      as: 'span',
                      animation: 'border',
                      size: undefined,
                      role: 'status',
                      'aria-hidden': 'true',
                      variant: 'light',
                      style: {
                        height: '1.5rem',
                        width: '1.5rem',
                        marginBottom: '0.75rem'
                      }
                    }}
                  />
                ) : (
                  <ActionsDropdown alignRight={true} variant="dark" title="Actions">
                    <LoadingLink
                      href={"/" + organization + "/" + incident + "/hotline/servicerequest/edit/" + data.id_for_incident}
                      isLoading={isLoading}
                      className="text-white d-block py-1 px-3"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" inverse />
                      Update Service Request
                    </LoadingLink>
                    <LoadingLink onClick={handleGeoJsonDownload} isLoading={isLoading} className="text-white d-block py-1 px-3">
                      <FontAwesomeIcon icon={faDownload} className="mr-1"  inverse />
                      Download Service Request as Geojson
                    </LoadingLink>
                    {state && state.incident.caltopo_map_id ?
                    <LoadingLink onClick={handleGeoJsonPush} isLoading={isLoading} className="text-white d-block py-1 px-3">
                      <FontAwesomeIcon icon={faUpload} className="mr-1"  inverse />
                      Push Service Request to CalTopo
                    </LoadingLink>
                    : ''}
                    <ShelterlyPrintifyButton
                      id="service-request-summary"
                      spinnerSize={2.0}
                      tooltipPlacement='right'
                      tooltipText='Print Service Request as PDF'
                      printFunc={handleDownloadPdfClick}
                      disabled={isLoading}
                      noOverlay={true}
                    />
                    <LoadingLink onClick={() => {setShowModal(true)}} isLoading={isLoading} className="text-white d-block py-1 px-3">
                      <FontAwesomeIcon icon={faTimes} className="mr-1" size="lg" style={{cursor:'pointer'}} inverse />
                      Cancel service request
                    </LoadingLink>
                  </ActionsDropdown>
                )}
              </div>
              <hr/>
              <ListGroup variant="flush">
                <ListGroup.Item style={{marginTop:"-13px"}}>
                  <div className="row">
                    <span className="col-6"><b>Priority: </b>{priorityText[data.priority]}</span>
                    <span className="col-6" style={{textTransform:"capitalize"}}><b>Status: </b>{data.status}</span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item><b>Address: </b>{data.full_address}</ListGroup.Item>
                <ListGroup.Item>
                  <b>Followup Date: </b>
                  <FontAwesomeIcon icon={faCalendarEdit} className="ml-1 mr-1" style={{cursor:'pointer'}} onClick={() => openCalendar()} />
                  {data.followup_date ?
                  <span>
                    <Moment format="ll">{data.followup_date}</Moment>
                  </span>
                  : "Set date"}
                  <Flatpickr
                    ref={datetime}
                    name="followup_date"
                    id="followup_date"
                    options={{clickOpens:false, altInput:true, altInputClass:"hide-input", altFormat:"F j, Y h:i K", minDate:new Date()}}
                    onChange={(date, dateStr) => {
                      setData(prevState => ({ ...prevState, "followup_date":dateStr }));
                      axios.patch('/hotline/api/servicerequests/' + data.id + '/', {followup_date:date[0]})
                      .catch(error => {
                        setShowSystemError(true);
                      });
                    }}
                    value={data.followup_date || null}>
                  </Flatpickr>
                </ListGroup.Item>
                <ListGroup.Item style={{marginBottom:"-13px"}}><b>Instructions for Field Team:</b> {data.directions||"None"}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <div className="col-6 d-flex pl-0">
          <Card className="mb-2 border rounded" style={{width:"100%"}}>
            <Card.Body>
              <Card.Title>
                <h4 className="mb-0">Contacts
                  <OverlayTrigger
                    key={"add-owner"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-add-owner`}>
                        Add an owner to this service request and its animals
                      </Tooltip>
                    }
                  >
                    <Link href={"/" + organization + "/" + incident + "/people/owner/new?servicerequest_id=" + data.id}><FontAwesomeIcon icon={faUserPlus} size="sm" className="ml-1" inverse /></Link>
                  </OverlayTrigger>
                </h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-20px"}}>
                {data.owner_objects.map(owner => (
                  <ListGroup.Item key={owner.id}><b>Owner: </b><Link href={"/" + organization + "/" + incident + "/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
                    {owner.display_phone ?
                    <OverlayTrigger
                      key={"owner-phone"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-owner-phone`}>
                          Phone: {owner.display_phone}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faPhoneRotary} className="ml-1" inverse />
                    </OverlayTrigger>
                    : ""}
                    {owner.email ?
                    <OverlayTrigger
                      key={"owner-email"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-owner-email`}>
                          Email: {owner.email}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="ml-1" inverse />
                    </OverlayTrigger>
                    : ""}
                  </ListGroup.Item>
                ))}
                {data.reporter ?
                <ListGroup.Item>
                  <b>Reporter: </b><Link href={"/" + organization + "/" + incident + "/people/reporter/" + data.reporter} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.reporter_object.first_name} {data.reporter_object.last_name}</Link>
                  {data.reporter_object.agency ? <span className="ml-1">({data.reporter_object.agency})</span> : "" }
                  {data.reporter_object.display_phone ?
                  <OverlayTrigger
                    key={"reporter-phone"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-reporter-phone`}>
                        Phone: {data.reporter_object.display_phone}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faPhoneRotary} className="ml-1" inverse />
                  </OverlayTrigger>
                  : ""}
                </ListGroup.Item> : ""}
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="col-12 d-flex">
          <Card className="border rounded d-flex" style={{width:"100%"}}>
            <Card.Body style={{marginTop:"-10px", marginBottom:"-15px"}}>
              <div className="d-flex justify-content-between" style={{marginBottom:"-10px"}}>
                <h4 style={{paddingTop:"12px"}}>
                    Animals
                </h4>
                {isLoading ? (
                    <Spinner
                      className="align-self-center mr-3"
                      {...{
                        as: 'span',
                        animation: 'border',
                        size: undefined,
                        role: 'status',
                        'aria-hidden': 'true',
                        variant: 'light',
                        style: {
                          height: '1.5rem',
                          width: '1.5rem',
                          marginBottom: '0.75rem'
                        }
                      }}
                    />
                  ) : (
                    <ActionsDropdown alignRight={true} variant="dark" title="Actions">
                      {data.animals.length > 0 ?
                        <ShelterlyPrintifyButton
                          id="animal-details-all-animal-care-schedules"
                          spinnerSize={2.0}
                          tooltipPlacement='right'
                          tooltipText='Print All Animal Care Schedules'
                          printFunc={handlePrintAllAnimalsClick}
                          disabled={isLoading}
                          noOverlay={true}
                        />
                      : ""}
                      <LoadingLink
                        href={"/" + organization + "/" + incident + "/animals/new?servicerequest_id=" + data.id}
                        isLoading={isLoading}
                        className="text-white d-block py-1"
                        style={{marginLeft:"18px"}}
                      >
                        <FontAwesomeIcon icon={faPlusSquare} className="mr-1" inverse />
                        Add an Animal
                      </LoadingLink>
                      {data.status.toLowerCase() !== 'closed' ?
                        <LoadingLink onClick={() => setShow(true)} isLoading={isLoading} className="text-white d-block py-1 px-3">
                          <FontAwesomeIcon icon={faHomeHeart} className="mr-1" style={{cursor:'pointer'}} inverse />
                          Reunite All Animals
                        </LoadingLink>
                      : ""}
                      <LoadingLink onClick={() => setShowTransfer(true)} isLoading={isLoading} className="text-white d-block py-1 px-3">
                        <FontAwesomeIcon icon={faRightLeft} className="mr-1" style={{cursor:'pointer'}} inverse />
                        Transfer Animals
                      </LoadingLink>
                    </ActionsDropdown>
                  )}
              </div>
              <hr />
              <AnimalCards animals={data.animals} show_owner={false} show_status={true} organization={organization} incident={"/" + incident} />
              {data.animals.length < 1 ? <div className="mb-3">Service Request does not have any animals assigned.</div> : ""}
            </Card.Body>
          </Card>
        </div>
      </div>
      <PhotoDocuments setData={setData} data={data} id={data.id} object="service request" url={'/hotline/api/servicerequests/' + data.id + '/'} />
      <div className="row mt-3">
        <div className="col-12 d-flex">
          <Card className="border rounded" style={{width:"100%"}}>
            <Card.Body>
              <Card.Title>
                <h4 className="mb-0">Visit Log
                  {["open", "assigned"].includes(data.status) ? <OverlayTrigger
                    key={"add-to-dispatch"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-add-to-dispatch`}>
                        {data.assigned_requests.filter(assigned_request => !assigned_request.dispatch_assignment.end_time).length ? "Reassign" : "Assign"} service request to an open dispatch assignment
                      </Tooltip>
                    }
                  >
                    <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + id + "/assign"}><FontAwesomeIcon icon={faMapMarkedAlt} className="ml-1" inverse /></Link>
                  </OverlayTrigger> : ""}
                </h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", marginLeft:"-15px"}}>
                {data.assigned_requests.filter(assigned_request => !assigned_request.dispatch_assignment.end_time).map(assigned_request => (
                  <ListGroup.Item key={assigned_request.id}>
                    <b>Active Dispatch Assignment:</b>
                    &nbsp;<Link href={"/" + organization + "/" + incident + "/dispatch/summary/" + assigned_request.dispatch_assignment.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}><Moment format="LL">{assigned_request.dispatch_assignment.start_time}</Moment></Link>&nbsp;|&nbsp;
                    {assigned_request.dispatch_assignment.team_name}
                    <OverlayTrigger
                      key={"team-names"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-team-names`}>
                          {assigned_request.dispatch_assignment.team_member_names}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faUsers} className="ml-1 fa-move-down" />
                    </OverlayTrigger>
                    <OverlayTrigger
                      key={"resolve-dispatch-assignment"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-resolve-dispatch-assignment`}>
                          Resolve dispatch assignment
                        </Tooltip>
                      }
                    >
                      <Link href={"/" + organization + "/" + incident + "/dispatch/resolution/" + assigned_request.dispatch_assignment.id_for_incident}><FontAwesomeIcon icon={faClipboardCheck} className="ml-1" inverse /></Link>
                    </OverlayTrigger>
                  </ListGroup.Item>
                ))}
                {data.assigned_requests.filter(assigned_request => assigned_request.visit_note && assigned_request.visit_note.date_completed).map((assigned_request) => (
                  <ListGroup.Item key={assigned_request.id}>
                    <b>Dispatch Assignment:</b>
                    &nbsp;<Link href={"/" + organization + "/" + incident + "/dispatch/summary/" + assigned_request.visit_note.dispatch_assignment} className="text-link" style={{textDecoration:"none", color:"white"}}><Moment format="LL">{assigned_request.visit_note.date_completed}</Moment></Link>
                    {assigned_request.visit_note.forced_entry ?
                      <OverlayTrigger
                        key={"forced"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-forced`}>
                            Forced entry
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faHouseDamage} size="sm" className="ml-1" style={{marginBottom:"1px"}} />
                      </OverlayTrigger>
                    : ""}
                    &nbsp;|&nbsp;
                    {assigned_request.dispatch_assignment.team_name}
                    <OverlayTrigger
                      key={"team-names-"+id}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-team-names` + id}>
                          {assigned_request.dispatch_assignment.team_member_names}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faUsers} className="ml-1 fa-move-down" />
                    </OverlayTrigger>
                    <OverlayTrigger
                      key={"edit-visit-note"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-edit-visit-note`}>
                          Update visit note
                        </Tooltip>
                      }
                    >
                      <Link href={"/" + organization + "/" + incident + "/dispatch/assignment/note/" + assigned_request.visit_note.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                    </OverlayTrigger>
                    <div className="mt-1 mb-0" style={{whiteSpace:"pre-line"}}><b>Outcome:</b> {assigned_request.visit_note.notes||"No visit information available."}</div>
                    {assigned_request.owner_contact ?
                    <span>
                      {assigned_request.owner_contact.owner_name ? <div className="mt-1 mb-0"><b>Owner Contacted:</b> {assigned_request.owner_contact.owner_name} {assigned_request.owner_contact.owner_contact_time ? <span>on <Moment format="LLL">{assigned_request.owner_contact.owner_contact_time}</Moment></span> : ""}</div> : ""}
                      <div className="mt-1 mb-0" style={{whiteSpace:"pre-line"}}><b>Contact Notes:</b> {assigned_request.owner_contact.owner_contact_note||"No contact information available."}</div>
                    </span>
                    : ""}
                  </ListGroup.Item>
                ))}
                {data.assigned_requests.length < 1 ? <div className="mt-2 mb-1 ml-3">Service Request has not been visited yet.</div> : ""}
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
      </div>
      <History action_history={data.action_history} />
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Animal Reunification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Have all of the animals in this service request been reunited with their owner?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>Yes</Button>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Formik
      initialValues={transferData}
      enableReinitialize={true}
      // validationSchema={Yup.object({
      // })}
      onSubmit={(values, { setSubmitting }) => {
        axios.patch('/hotline/api/servicerequests/' + data.id + '/', values)
        .then(response => {
          setData(prevState => ({ ...prevState, animals:response.data.animals.filter(animal => !values.animal_ids.includes(animal.id))}));
          setTransferData(prevState => ({ ...prevState, animal_ids:transferData.animal_ids.filter(id => (!values.animal_ids.includes(id)))}));
          setShowTransfer(false);
        })
        .catch(error => {
          setShowSystemError(true);
        });
      }}
    >
      {formikProps => (
      <Modal show={showTransfer} onHide={handleCloseTransfer}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Animals Between SRs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data.animals.map((animal, index) => (
            <div key={animal.id}>
              <Checkbox
                name={`animal_ids`}
                checked={formikProps.values.animal_ids.includes(animal.id) || false}
                onChange={() => {
                  if (formikProps.values.animal_ids.includes(animal.id)) {
                    let newItems = [...transferData.animal_ids];
                    newItems = newItems.filter(id => id !== animal.id);
                    setTransferData(prevState => ({...prevState, animal_ids: newItems}))
                    formikProps.setFieldValue(`animal_ids`, newItems);
                  }
                  else {
                    let newItems = [...transferData.animal_ids];
                    newItems.push(animal.id);
                    setTransferData(prevState => ({...prevState, animal_ids: newItems}));
                    formikProps.setFieldValue(`animal_ids`, newItems);
                  }
                }}
                style={{
                  transform: "scale(1.5)",
                  marginTop: "-4px"
                }}
              />
              A#{animal.id_for_incident} - {animal.species_string} - {animal.name||"Unknown"}</div>
          ))}
          <label className="mt-3">To SR:</label>
          <Typeahead
            id="new_request_id"
            onChange={(values) => {
              if (values.length) {
                setTransferData(prevState => ({...prevState, 'new_request_id':values[0].id}));
                // setData(existingSRs.data.filter(request => request.id === values[0].id)[0])
              }
              else {
                setTransferData(prevState => ({...prevState, 'new_request_id':null}));
              }
            }}
            options={existingSRs.options}
            placeholder={existingSRs.fetching ? "Loading..." : "Search..."}
            disabled={existingSRs.fetching ? true : false}
            emptyLabel="No matches found."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {formikProps.submitForm();}} disabled={!transferData.new_request_id || transferData.animal_ids.length === 0}>Transfer</Button>
          <Button variant="secondary" onClick={handleCloseTransfer}>Close</Button>
        </Modal.Footer>
      </Modal>
      )}
    </Formik>
    </>
  );
};

export default ServiceRequestDetails;
