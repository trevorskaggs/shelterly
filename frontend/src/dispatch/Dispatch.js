import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, Col, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullhorn, faCircle, faExclamationCircle, faMapMarkedAlt, faSearch, faTimesCircle, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle as faQuestionCircleDuo, faChevronCircleDown, faChevronCircleUp } from '@fortawesome/pro-duotone-svg-icons';
import { faHomeAlt as faHomeAltReg } from '@fortawesome/pro-regular-svg-icons';
import { faCircleBolt, faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import Map, { prettyText, reportedMarkerIcon, reportedEvacMarkerIcon, reportedSIPMarkerIcon, SIPMarkerIcon, UTLMarkerIcon, finishedMarkerIcon } from "../components/Map";
import Header from "../components/Header";
import Scrollbar from '../components/Scrollbars';
import { SystemErrorContext } from '../components/SystemError';
import { AddressLookup } from '../components/Map';

function Dispatch({ incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showActive, setShowActive] = useState(true);
  const [showPreplanned, setShowPreplanned] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [initialBounds, setInitialBounds] = useState(L.latLngBounds([[0,0]]));

  const handleClose = () => {setShowAddressModal(false);}

  // Counts the number of size/species matches for a service request by status.
const countMatches = (animal_dict) => {
  var matches = {};
  var status_matches = {'REPORTED':{}, 'SHELTERED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}};

  Object.keys(animal_dict).forEach((animal) => {
    if (['REPORTED', 'SHELTERED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'].indexOf(animal_dict[animal]['status']) > -1) {
      if (!matches[[animal_dict[animal]['species']]]) {
        matches[[animal_dict[animal]['species']]] = 1;
      }
      else {
        matches[[animal_dict[animal]['species']]] += 1;
      }
      if (!status_matches[animal_dict[animal]['status']][[animal_dict[animal]['species']]]) {
        status_matches[animal_dict[animal]['status']][[animal_dict[animal]['species']]] = 1;
      }
      else {
        status_matches[animal_dict[animal]['status']][[animal_dict[animal]['species']]] += 1;
      }
    }
  });
  return [matches, status_matches]
}

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchDispatchAssignments = async () => {
      setData({dispatch_assignments: [], isFetching: true, bounds:L.latLngBounds([[0,0]])});
      // Fetch open DA data.
      axios.get('/evac/api/evacassignment/', {
        params: {
          status: 'open',
          incident: incident,
          map: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          const map_dict = {};
          const bounds = [];
          response.data.forEach((dispatch_assignment, index) => {
            let sr_dict = {}
            for (const assigned_request of dispatch_assignment.assigned_requests) {
              const matches = countMatches(assigned_request.animals)[0];
              sr_dict[assigned_request.service_request_object.id] = {id:assigned_request.service_request_object.id, matches:matches, latitude:assigned_request.service_request_object.latitude, longitude:assigned_request.service_request_object.longitude, full_address:assigned_request.service_request_object.full_address};
              bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
            }
            map_dict[dispatch_assignment.id] = {service_requests:sr_dict}
          });
          setMapState(map_dict);
          setData({dispatch_assignments: response.data.sort((a, b) => a.team_object.name.localeCompare(b.team_object.name)), isFetching: false, bounds:bounds.length > 0 ? bounds : L.latLngBounds([[0,0]])});
          setInitialBounds(bounds);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({dispatch_assignments: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
          setShowSystemError(true);
        }
      });
    };

    fetchDispatchAssignments();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [incident]);

  return (
    <>
    <Header>Dispatch
      <OverlayTrigger
        key={"address-finder"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-address-finder`}>
            Search for an address to zoom the map to.
          </Tooltip>
        }
      >
        <Button className="ml-1 fa-move-up" onClick={() => setShowAddressModal(true)}>
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </OverlayTrigger>
    </Header>
    <hr/>
    <Row className="ml-0 mr-0 pl-0 pr-0 mb-0">
      <Col xs={4} className="pl-0 pr-0">
        <Link href={"/" + organization + "/" + incident + "/dispatch/deploy"} style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}}><FontAwesomeIcon icon={faBullhorn} className="mr-1 fa-move-up" inverse />DEPLOY TEAMS</Button>
        </Link>
      </Col>
      <Col xs={4} className="pl-0 pr-0">
        <Link href={"/" + organization + "/" + incident + "/dispatch/preplan"} style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}}><FontAwesomeIcon icon={faMapMarkedAlt} className="mr-1 fa-move-up" inverse />PREPLAN ASSIGNMENTS</Button>
        </Link>
      </Col>
      <Col xs={4} className="pl-0 pr-0">
        <Link href={"/" + organization + "/" + incident + "/dispatch/teammanagement"} style={{textDecoration:"none"}}>
          <Button className="rounded border btn-block" style={{height:"100px", fontSize:"20px"}}><FontAwesomeIcon icon={faUsers} className="mr-1 fa-move-up" inverse />TEAM MANAGEMENT</Button>
        </Link>
      </Col>
    </Row>
    <Row xs={12} className="ml-0 mr-0 pl-0 pr-0" style={{marginBottom:"-1px"}}>
      <Col xs={10} className="border rounded pl-0 pr-0">
        {data.dispatch_assignments.length ?
          <Map bounds={data.bounds} className="landing-leaflet-container">
            {data.dispatch_assignments.filter(da => da.id === selectedTeam ? da : showActive && showPreplanned ? da : showActive ? da.team_member_names.length > 0 : showPreplanned ? da.team_member_names.length === 0 : null)
                                      .filter(dispatch_assignment => (selectedTeam == null || dispatch_assignment.id === selectedTeam)).map(dispatch_assignment => (
            <span key={dispatch_assignment.id}>
              {dispatch_assignment.assigned_requests.map((assigned_request, index) => (
                <Marker
                  key={assigned_request.service_request_object.id}
                  position={[assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]}
                  icon={assigned_request.service_request_object.reported_animals > 0 ? reportedMarkerIcon : assigned_request.service_request_object.reported_evac > 0 ? reportedEvacMarkerIcon : assigned_request.service_request_object.reported_sheltered_in_place > 0 ? reportedSIPMarkerIcon : assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : assigned_request.service_request_object.unable_to_locate > 0 ? UTLMarkerIcon : finishedMarkerIcon}
                  onClick={() => navigate('/' + organization + "/" + incident + "/dispatch/summary/" + dispatch_assignment.id)}
                >
                <MapTooltip key={`${index}-${selectedTeam}`} autoPan={false} closeButton={true} permanent={selectedTeam === dispatch_assignment.id ? true : false}>
                  <span>
                    <div>{dispatch_assignment.team_object ? dispatch_assignment.team_object.name : ""}</div>
                    {mapState[dispatch_assignment.id] ?
                      <span>
                        {Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).length > 0 ? Object.keys(mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[dispatch_assignment.id].service_requests[assigned_request.service_request_object.id].matches[key])}
                          </span>
                        )) : "Assignemnt ready for resolution"}
                      </span>
                    :""}
                    <br />
                    SR#{assigned_request.service_request_object.id}: {assigned_request.service_request_object.full_address}
                    <div>
                      {assigned_request.service_request_object.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                      {assigned_request.service_request_object.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                      {assigned_request.service_request_object.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                      {assigned_request.service_request_object.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                    </div>
                  </span>
                </MapTooltip>
              </Marker>
              ))}
            </span>
            ))}
          </Map>
        :
          <Card className="text-center" style={{height:"450px", marginRight:"-1px", paddingTop:"225px", fontSize:"30px"}}>{data.isFetching ? "Fetching" : "No"} Dispatch Assignments.</Card>
        }
      </Col>
      <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
        <Scrollbar no_shadow="true" style={{height:"450px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
        <Button variant={"info"} className="border" onClick={() => setShowActive(!showActive)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Active {showActive ? <FontAwesomeIcon icon={faChevronCircleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleDown} size="sm" />}</Button>
        {data.dispatch_assignments.filter(da => showActive ? da.team_member_names.length > 0 : null).map(dispatch_assignment => (
          <Button key={dispatch_assignment.id} title={dispatch_assignment.team ? dispatch_assignment.team.name : ""} variant={dispatch_assignment.id === selectedTeam ? "primary" : "secondary"} className="border" onClick={() => setSelectedTeam(selectedTeam === dispatch_assignment.id ? null : dispatch_assignment.id)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
            {dispatch_assignment.team ? dispatch_assignment.team_object.name : "Preplanned"}
            {dispatch_assignment.team_member_names ?
              <OverlayTrigger
                key={"team-names"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-team-names`}>
                    {dispatch_assignment.team_member_names}
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faUsers} className="ml-1" />
              </OverlayTrigger>
            : ""}
          </Button>
        ))}
        <Button variant={"info"} className="border" onClick={() => setShowPreplanned(!showPreplanned)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Preplanned {showPreplanned ? <FontAwesomeIcon icon={faChevronCircleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronCircleDown} size="sm" />}</Button>
        {data.dispatch_assignments.filter(da => showPreplanned ? da.team_member_names.length === 0 : null).map(dispatch_assignment => (
          <Button key={dispatch_assignment.id} title={dispatch_assignment.team ? dispatch_assignment.team.name : ""} variant={dispatch_assignment.id === selectedTeam ? "primary" : "secondary"} className="border" onClick={() => setSelectedTeam(selectedTeam === dispatch_assignment.id ? null : dispatch_assignment.id)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
            {dispatch_assignment.team ? dispatch_assignment.team_object.name : "Preplanned"}
            {dispatch_assignment.team_member_names ?
              <OverlayTrigger
                key={"team-names"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-team-names`}>
                    {dispatch_assignment.team_member_names}
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faUsers} className="ml-1" />
              </OverlayTrigger>
            : ""}
          </Button>
        ))}
        </Scrollbar>
      </Col>
    </Row>
    <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
      <h5 className="card-header" style={{paddingTop:"7px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>
        Assignments&nbsp;&nbsp; -
        <span className="fa-layers ml-3 mr-1">
          <FontAwesomeIcon icon={faCircle} className="fa-move-down" color="white" />
          <FontAwesomeIcon icon={faExclamationCircle} className="icon-border fa-move-down" color="#ff4c4c" />
        </span>
        Reported
        <span style={{paddingRight:"15px", paddingLeft:"15px"}}>
          <span className="fa-layers ml-1" style={{marginRight:"6px"}}>
            <FontAwesomeIcon icon={faCircle} className="fa-move-down" color="white" />
            <FontAwesomeIcon icon={faCircleBolt} className="icon-border fa-move-down" color="#ff4c4c" />
          </span>
          Reported (Evac Req)
        </span>
        <span style={{paddingRight:"15px"}}>
          <span className="fa-layers ml-1" style={{marginRight:"6px"}}>
            <FontAwesomeIcon icon={faCircle} className="icon-border fa-move-down" color="#ff4c4c" transform={'grow-2'} />
            <FontAwesomeIcon icon={faHomeAlt} className="fa-move-down" style={{color:"white"}} transform={'shrink-4 left-1'} inverse />
            <FontAwesomeIcon icon={faHomeAltReg} className="fa-move-down" style={{color:"#444"}} transform={'shrink-3 left-1'} inverse />
          </span>
          Reported (SIP Req)
        </span>
        <span style={{paddingRight:"15px"}}>
          <span className="fa-layers ml-1" style={{marginRight:"6px"}}>
            <FontAwesomeIcon icon={faCircle} className="icon-border fa-move-down" color="#f5ee0f" transform={'grow-2'} />
            <FontAwesomeIcon icon={faHomeAlt} className="fa-move-down" style={{color:"white"}} transform={'shrink-3 left-1'} inverse />
            <FontAwesomeIcon icon={faHomeAltReg} className="fa-move-down" style={{color:"#444"}} transform={'shrink-3 left-1'} inverse />
          </span>
          SIP
        </span>
        <span style={{paddingRight:"15px"}}>
          <span className="fa-layers ml-1 mr-1">
            <FontAwesomeIcon icon={faCircle} className="fa-move-down" color="white" />
            <FontAwesomeIcon icon={faQuestionCircleDuo} className="icon-border fa-move-down" style={{"--fa-primary-color":'white', "--fa-secondary-color":'#5f5fff', "--fa-secondary-opacity": 1}} />
          </span>
          UTL
        </span>
        <span className="fa-layers ml-1 mr-1">
          <FontAwesomeIcon icon={faCircle} className="fa-move-down" color="white" />
          <FontAwesomeIcon icon={faTimesCircle} className="icon-border fa-move-down" color="#af7051" />
        </span>
          Sheltered
      </h5>
    </Row>
    <Modal show={showAddressModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Address Finder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddressLookup style={{width: '100%'}} className={"form-control"} setData={setData} initialBounds={initialBounds} incident={incident} handleClose={handleClose} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
    </>
  )
}

export default Dispatch
