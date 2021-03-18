import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Button, ButtonGroup, Card, CardGroup, Col, Collapse, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Link, useQueryParams } from "raviger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronCircleDown, faChevronCircleRight, faClipboardCheck, faClipboardList, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import L from "leaflet";
import Map, { prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Moment from "react-moment";
import Header from '../components/Header';

function DispatchAssignmentSearch() {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    status = 'open',
  } = queryParams;

  const [data, setData] = useState({evacuation_assignments: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState(search);
  const [tempSearchTerm, setTempSearchTerm] = useState(search);
  const [statusOptions, setStatusOptions] = useState(status);
  const [mapState, setMapState] = useState({});
  const [showSRs, setShowSRs] = useState({});

  // Takes in dispatch ID,
  const updateShowSRs = (service_request_id) => {
    let tempSRs = {...showSRs};
    tempSRs[service_request_id] = !showSRs[service_request_id];
    setShowSRs(tempSRs);
  }

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setTempSearchTerm(event.target.value);
  };

  // Use searchTerm to filter evacuation_assignments.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm);
  }

  // Counts the number of species matches for a service request.
  const countMatches = (service_request) => {
    var matches = {};

    service_request.animals.forEach((animal) => {
      if (['REPORTED', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'].indexOf(animal.status) > -1) {
        if (!matches[[animal.species]]) {
          matches[[animal.species]] = 1;
        }
        else {
          matches[[animal.species]] += 1;
        }
      }
    });
    return matches
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchDispatchAssignments = async () => {
      setData({evacuation_assignments: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/evac/api/evacassignment/?search=' + searchTerm + '&status=' + statusOptions, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData({evacuation_assignments: response.data, isFetching: false});
          let map_dict = {};
          for (const dispatch_assignment of response.data) {
            for (const service_request of dispatch_assignment.service_request_objects) {
              const matches = countMatches(service_request);
              map_dict[service_request.id] = {matches:matches};
            }
          }
          setMapState(map_dict);
        }
      })
      .catch(error => {
        if (!unmounted) {
          console.log(error.response);
          setData({evacuation_assignments: [], isFetching: false});
        }
      });
    };
    fetchDispatchAssignments();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, statusOptions]);

  return (
      <div className="ml-2 mr-2">
        <Header>Search Dispatch Assignments</Header>
        <hr/>
        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3">
            <FormControl
                type="text"
                placeholder="Search"
                name="searchTerm"
                value={tempSearchTerm}
                onChange={handleChange}
            />
            <InputGroup.Append>
              <Button variant="outline-light" type="submit">Search</Button>
            </InputGroup.Append>
            <ButtonGroup className="ml-3">
              <Button variant={statusOptions === "open" ? "primary" : "secondary"} onClick={statusOptions !== "open" ? () => setStatusOptions("open") : () => setStatusOptions("")}>Open</Button>
              <Button variant={statusOptions === "closed" ? "primary" : "secondary"} onClick={statusOptions !== "closed" ? () => setStatusOptions("closed") : () => setStatusOptions("")}>Closed</Button>
            </ButtonGroup>
          </InputGroup>
        </Form>
        {data.evacuation_assignments.map(evacuation_assignment => (
          <div key={evacuation_assignment.id} className="mt-3">
            <div className="card-header"><h4 style={{marginBottom:"-2px"}}>
              <Moment format="L">{evacuation_assignment.start_time}</Moment>
              <OverlayTrigger
                key={"dispatch-assignment-summary"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-dispatch-assignment-summary`}>
                    Dispatch assignment summary
                  </Tooltip>
                }
              >
                <Link href={"/dispatch/summary/" + evacuation_assignment.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
              </OverlayTrigger>
              {evacuation_assignment.end_time ? "" :
                <OverlayTrigger
                  key={"close-dispatch-assignment"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-close-dispatch-assignment`}>
                      Close dispatch assignment
                    </Tooltip>
                  }
                >
                  <Link href={"/dispatch/resolution/" + evacuation_assignment.id}><FontAwesomeIcon icon={faClipboardCheck} className="ml-1" inverse /></Link>
                </OverlayTrigger>
              }
              &nbsp;&nbsp;|&nbsp;
              {evacuation_assignment.team && evacuation_assignment.team_object.name}: {evacuation_assignment.team && evacuation_assignment.team_object.team_member_objects.map((member, i) => (
                  <span key={member.id}>{i > 0 && ", "}{member.first_name} {member.last_name}</span>))}
            </h4></div>
            <CardGroup>
              <Card style={{maxWidth:"206px", height:"206px"}}>
                <Card.Body className="p-0 m-0">
                  <Map className="d-block da-search-leaflet-container" bounds={L.latLngBounds([[0,0]])}></Map>
                </Card.Body>
              </Card>
              <Card style={{maxHeight:"206px"}}>
                <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px", marginLeft:"-9px"}}>Service Requests</Card.Title>
                {evacuation_assignment.service_request_objects.map(service_request => (
                  <div key={service_request.id} className="mt-1 mb-1" style={{marginLeft:"-10px", marginRight:"-10px"}}>
                    <div className="card-header rounded">
                    <span style={{marginLeft:"-12px"}}>
                    {service_request.reported_animals > 0 ?
                      <OverlayTrigger
                        key={"reported"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-reported`}>
                            {service_request.reported_animals} animal{service_request.reported_animals > 1 ? "s are":" is"} reported
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1"/>
                      </OverlayTrigger>
                      : ""}
                      {service_request.sheltered_in_place > 0 ?
                      <OverlayTrigger
                        key={"sip"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-sip`}>
                            {service_request.sheltered_in_place} animal{service_request.sheltered_in_place > 1 ? "s are":" is"} sheltered in place
                          </Tooltip>
                        }
                      >
                        <span className="fa-layers mr-1">
                          <FontAwesomeIcon icon={faCircle} transform={'grow-1'} />
                          <FontAwesomeIcon icon={faHomeAlt} style={{color:"#444"}} transform={'shrink-3'} size="sm" inverse />
                        </span>
                      </OverlayTrigger>
                      : ""}
                      {service_request.unable_to_locate > 0 ?
                      <OverlayTrigger
                        key={"utl"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-utl`}>
                            {service_request.unable_to_locate} animal{service_request.unable_to_locate > 1 ? "s are":" is"} unable to be located
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faQuestionCircle} className="mr-1"/>
                      </OverlayTrigger>
                      : ""}
                      </span>
                      <span>{service_request.full_address} |&nbsp;</span>
                      {mapState[service_request.id] ?
                      <span>
                        {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                          <span key={key} style={{textTransform:"capitalize"}}>
                            {i > 0 && ", "}{prettyText('', key.split(',')[0], mapState[service_request.id].matches[key])}
                          </span>
                        ))}
                      </span>
                      :""}
                      <FontAwesomeIcon icon={faChevronCircleRight} hidden={showSRs[service_request.id]} onClick={() => updateShowSRs(service_request.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showSRs[service_request.id]} onClick={() => updateShowSRs(service_request.id)} className="ml-1 fa-move-up" style={{verticalAlign:"middle"}} inverse />
                      <Collapse in={showSRs[service_request.id]}>
                        <div>
                          Test
                        </div>
                      </Collapse>
                    </div>
                  </div>
                ))}
                </Card.Body>
              </Card>
            </CardGroup>
          </div>
        ))}
        <p>{data.isFetching ? 'Fetching dispatch assignments...' : <span>{data.evacuation_assignments && data.evacuation_assignments.length ? '' : 'No dispatch assignments found.'}</span>}</p>
      </div>
  )
}

export default DispatchAssignmentSearch;
