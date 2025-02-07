import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormControl, InputGroup, OverlayTrigger, Pagination, Row, Tooltip } from "react-bootstrap";
import { Link, navigate, useQueryParams } from "raviger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle, faExclamationCircle, faInfoCircle, faQuestionCircle, faUserAlt, faUserAltSlash, faUsers, faPrint
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faCircleBolt, faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import { useMark, useSubmitting, useDateRange } from '../hooks';
import Map, { countMatches, countDictMatches, prettyText, reportedMarkerIcon, reportedEvacMarkerIcon, reportedSIPMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Moment from "react-moment";
import moment from 'moment';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { DateRangePicker } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import ButtonSpinner from '../components/ButtonSpinner';
import { printAllDispatchResolutions } from './Utils';

function DispatchAssignmentSearch({ incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    status = 'active',
  } = queryParams;

  const [data, setData] = useState({evacuation_assignments: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState(search);
  const tempSearchTerm = useRef(null);
  const dateRef = useRef(null);
  const [statusOptions, setStatusOptions] = useState(status);
  const [matches, setMatches] = useState({});
  const [bounds, setBounds] = useState({});
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [isDateSet, setIsDateSet] = useState(false);
  const [goToID, setGoToID] = useState('');
  const { markInstances } = useMark();
  const {
    isSubmittingById,
    handleSubmitting,
    submittingComplete,
    submittingLabel
  } = useSubmitting();
  const { startDate, endDate, parseDateRange } = useDateRange();
  const [
    filteredEvacAssignments,
    setFilteredEvacAssignments
  ] = useState(data.evacuation_assignments);

  // Update searchTerm when field input changes.
  const handleChange = event => {
    tempSearchTerm.current.value = event.target.value;
  };

  const handleIDChange = async event => {
    setGoToID(event.target.value);
  };

  // Use searchTerm to filter service_requests.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm.current.value);
    setPage(1);
  }

  const handlePrintAllClick = (e) => {
    e.preventDefault();

    handleSubmitting()
      .then(() => printAllDispatchResolutions(filteredEvacAssignments))
      .then(submittingComplete);
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  }

  // Hook for filtering evacuation assignments
  useEffect(() => {
    if (data.isFetching) return;
    if (isDateSet) {
      const srSubset = data.evacuation_assignments.filter((ea) => 
        moment(startDate) <= moment(ea.start_time) && moment(endDate) >= moment(ea.start_time)
      )
      setFilteredEvacAssignments(srSubset);
      setNumPages(Math.ceil(srSubset.length / ITEMS_PER_PAGE));
    } else {
      setFilteredEvacAssignments(data.evacuation_assignments);
      setNumPages(Math.ceil(data.evacuation_assignments.length / ITEMS_PER_PAGE));
    }
  }, [data, isDateSet, startDate, endDate])

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchDispatchAssignments = async () => {
      setData({evacuation_assignments: [], isFetching: true});
      // Fetch DispatchAssignment data.
      await axios.get('/evac/api/evacassignment/?map=true&search=' + searchTerm + '&status=' + statusOptions +'&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({evacuation_assignments: response.data, isFetching: false});
          let map_dict = {};
          let bounds_dict = {};
          for (const dispatch_assignment of response.data) {
            let sr_bounds = [];
            for (const assigned_request of dispatch_assignment.assigned_requests) {
              const [species_matches, status_matches] = countDictMatches(assigned_request.animals, true);
              map_dict[assigned_request.service_request_object.id] = {species_matches:species_matches, status_matches:status_matches};
              sr_bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
            }
            bounds_dict[dispatch_assignment.id] = sr_bounds.length > 0 ? L.latLngBounds(sr_bounds).pad(.1) : L.latLngBounds([[0,0]]);
          }
          setMatches(map_dict);
          setBounds(bounds_dict);

          // highlight search terms
          markInstances(searchTerm);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({evacuation_assignments: [], isFetching: false});
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
  }, [searchTerm, statusOptions, incident]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Dispatch Assignments</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs="2" style={{maxWidth:"150px", marginRight:"-10px", paddingRight:"0px"}}>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="ID #"
                name="searchIDTerm"
                onChange={handleIDChange}
              />
              <InputGroup.Append>
                <Button variant="outline-light" type="submit" disabled={!goToID} style={{borderRadius:"0 5px 5px 0"}} onClick={(e) => {navigate("/" + organization + "/" + incident + "/dispatch/summary/" + goToID)}}>Go</Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Col>
            <InputGroup>
              <FormControl
                  type="text"
                  placeholder="Search"
                  name="searchTerm"
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e);
                    }
                  }}
                  ref={tempSearchTerm}
              />
              <InputGroup.Append>
                <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search
                  <OverlayTrigger
                    key={"search-information"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-search-information`}>
                        Searchable fields: team name, team member names, animal names, and service request address fields.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="ml-1" size="sm" inverse />
                  </OverlayTrigger>
                </Button>
              </InputGroup.Append>
              <ButtonGroup className="ml-1">
                <Button variant={statusOptions === "preplanned" ? "primary" : "secondary"} onClick={statusOptions !== "preplanned" ? () => {setPage(1);setStatusOptions("preplanned")} : () => {setPage(1);setStatusOptions("")}}>Preplanned</Button>
                <Button variant={statusOptions === "active" ? "primary" : "secondary"} onClick={statusOptions !== "active" ? () => {setPage(1);setStatusOptions("active")} : () => {setPage(1);setStatusOptions("")}}>Active</Button>
                <Button variant={statusOptions === "resolved" ? "primary" : "secondary"} onClick={statusOptions !== "resolved" ? () => {setPage(1);setStatusOptions("resolved")} : () => {setPage(1);setStatusOptions("")}}>Closed</Button>
              </ButtonGroup>
              <DateRangePicker
                name={`date_range_picker`}
                id={`date_range_picker`}
                placeholder={"Filter by Date Range"}
                style={{width:"210px", marginLeft:"0.25rem"}}
                ref={dateRef}
                onChange={(dateRange) => {
                  if (dateRange.length) {
                    setIsDateSet(true)
                    parseDateRange(dateRange)
                    setNumPages(Math.ceil(filteredEvacAssignments.length / ITEMS_PER_PAGE));
                  } else {
                    setIsDateSet(false)
                    setNumPages(Math.ceil(data.evacuation_assignments.length / ITEMS_PER_PAGE));
                  }
                }}
              />
              <ButtonSpinner
                variant="outline-light"
                className="ml-1 print-all-btn-icon"
                onClick={handlePrintAllClick}
                isSubmitting={isSubmittingById()}
                isSubmittingText={submittingLabel}
              >
                Print All ({`${filteredEvacAssignments.length}`})
                <FontAwesomeIcon icon={faPrint} className="ml-2 text-light" inverse />
              </ButtonSpinner>
            </InputGroup>
          </Col>
        </Row>
      </Form>
      {filteredEvacAssignments.map((evacuation_assignment, index) => (
        <div key={evacuation_assignment.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header d-flex hide-scrollbars" style={{whiteSpace:'nowrap', overflow:"hidden"}}>
            <h4 style={{marginBottom:"-2px", marginLeft:"-12px", whiteSpace:'nowrap', overflow:"hidden", textOverflow:"ellipsis"}}>
              <OverlayTrigger
                key={"dispatch-assignment-summary"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-dispatch-assignment-summary`}>
                    Dispatch assignment summary
                  </Tooltip>
                }
              >
                <Link href={"/" + organization + "/" + incident + "/dispatch/summary/" + evacuation_assignment.id_for_incident}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              DA#{evacuation_assignment.id_for_incident} -&nbsp;
              <Moment format="L">{evacuation_assignment.start_time}</Moment>
              &nbsp;|&nbsp;
              <span title={evacuation_assignment.team ? evacuation_assignment.team_name + ": " : ""}>
                {(evacuation_assignment.team && evacuation_assignment.team_name) || "Preplanned"}
                {evacuation_assignment.team_member_names ?
                <OverlayTrigger
                  key={"team-names"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-team-names`}>
                      {evacuation_assignment.team_member_names}
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faUsers} className="ml-1" />
                </OverlayTrigger> : ""}
              </span>
            </h4>
          </div>
          <CardGroup style={{overflowX:"hidden"}}>
            <Card style={{maxWidth:"206px", height:"206px"}}>
              <Card.Body className="p-0 m-0">
                <Map className="d-block da-search-leaflet-container" bounds={bounds[evacuation_assignment.id]} zoomControl={false} legend_position="topleft">
                  {evacuation_assignment.assigned_requests.map(assigned_request => (
                  <Marker
                    key={assigned_request.service_request_object.id}
                    position={[assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]}
                    icon={assigned_request.service_request_object.reported_animals > 0 ? reportedMarkerIcon : assigned_request.service_request_object.reported_evac > 0 ? reportedEvacMarkerIcon : assigned_request.service_request_object.reported_sheltered_in_place > 0 ? reportedSIPMarkerIcon : assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : assigned_request.service_request_object.unable_to_locate > 0 ? UTLMarkerIcon : UTLMarkerIcon}
                    onClick={() => window.open("/hotline/servicerequest/" + assigned_request.service_request_object.id)}
                  >
                    <MapTooltip autoPan={false} direction={evacuation_assignment.assigned_requests.length > 1 ? "auto" : "top"}>
                      <span>
                        {matches[assigned_request.service_request_object.id] ?
                          <span>
                            {Object.keys(matches[assigned_request.service_request_object.id].species_matches).map((key,i) => (
                              <span key={key} style={{textTransform:"capitalize"}}>
                                {i > 0 && ", "}{prettyText(key.split(',')[0], matches[assigned_request.service_request_object.id].species_matches[key])}
                              </span>
                            ))}
                          </span>
                        :""}
                        <br />
                        SR#{assigned_request.service_request_object.id_for_incident}: {assigned_request.service_request_object.full_address.split(',')[0]}
                      </span>
                    </MapTooltip>
                  </Marker>
                ))}
                </Map>
              </Card.Body>
            </Card>
            <Card style={{maxHeight:"206px"}}>
              <Scrollbar style={{height:"204px"}} renderView={props => <div {...props} style={{...props.style, overflow:"auto"}}/>} renderThumbHorizontal={props => <div {...props} style={{...props.style, display:"none"}} />}>
                <Card.Body style={{marginBottom:"0px"}}>
                  <Card.Title style={{marginTop:"-9px", marginBottom:"7px", marginLeft:"-9px"}}>Service Requests</Card.Title>
                  {evacuation_assignment.assigned_requests.map(assigned_request => (
                    <div key={assigned_request.service_request_object.id} style={{marginLeft:"-10px", marginRight:"7px", marginTop: "7px", marginBottom:"0px"}}>
                      <div className="card-header rounded">
                      <span style={{marginLeft:"-12px"}}>
                      {matches[assigned_request.service_request_object.id] && Object.keys(matches[assigned_request.service_request_object.id].status_matches['REPORTED']).length > 0 ?
                        <OverlayTrigger
                          key={"reported"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-utl`}>
                              {Object.keys(matches[assigned_request.service_request_object.id].status_matches['REPORTED']).map((key,i) => (
                                <span key={key} style={{textTransform:"capitalize"}}>
                                  {i > 0 && ", "}{prettyText('', key.split(',')[0], matches[assigned_request.service_request_object.id].status_matches['REPORTED'][key])}
                                </span>
                              ))}
                              {assigned_request.service_request_object.reported_animals > 1 ? " are":" is"} reported
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faExclamationCircle} className="mr-1"/>
                        </OverlayTrigger>
                        : ""}
                        {matches[assigned_request.service_request_object.id] && Object.keys(matches[assigned_request.service_request_object.id].status_matches['SHELTERED IN PLACE']).length > 0 ?
                        <OverlayTrigger
                          key={"sip"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-sip`}>
                              {Object.keys(matches[assigned_request.service_request_object.id].status_matches['SHELTERED IN PLACE']).map((key,i) => (
                                <span key={key} style={{textTransform:"capitalize"}}>
                                  {i > 0 && ", "}{prettyText('', key.split(',')[0], matches[assigned_request.service_request_object.id].status_matches['SHELTERED IN PLACE'][key])}
                                </span>
                              ))}
                              {assigned_request.service_request_object.sheltered_in_place > 1 ? " are":" is"} sheltered in place
                            </Tooltip>
                          }
                        >
                          <span className="fa-layers mr-1">
                            <FontAwesomeIcon icon={faCircle} transform={'grow-1'} />
                            <FontAwesomeIcon icon={faHomeAlt} style={{color:"#444"}} transform={'shrink-3'} size="sm" inverse />
                          </span>
                        </OverlayTrigger>
                        : ""}
                        {matches[assigned_request.service_request_object.id] && Object.keys(matches[assigned_request.service_request_object.id].status_matches['UNABLE TO LOCATE']).length > 0 ?
                        <OverlayTrigger
                          key={"utl"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-utl`}>
                              {Object.keys(matches[assigned_request.service_request_object.id].status_matches['UNABLE TO LOCATE']).map((key,i) => (
                                <span key={key} style={{textTransform:"capitalize"}}>
                                  {i > 0 && ", "}{prettyText('', key.split(',')[0], matches[assigned_request.service_request_object.id].status_matches['UNABLE TO LOCATE'][key])}
                                </span>
                              ))}
                              {assigned_request.service_request_object.unable_to_locate > 1 ? " are":" is"} unable to be located
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} className="mr-1"/>
                        </OverlayTrigger>
                        : ""}
                        </span>
                        <span>SR#{assigned_request.service_request_object.id_for_incident} - <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link> |
                        {assigned_request.service_request_object.owner_objects.length === 0 ?
                          <OverlayTrigger
                            key={"stray"}
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-stray`}>
                                No owner
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faUserAltSlash} className="ml-1 mr-1" size="sm" />
                          </OverlayTrigger> :
                          <OverlayTrigger
                            key={"stray"}
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-stray`}>
                                {assigned_request.service_request_object.owner_objects.map(owner => (
                                  <div key={owner.id}>{owner.first_name} {owner.last_name}</div>
                                ))}
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon icon={faUserAlt} className="ml-1 mr-1" size="sm" />
                          </OverlayTrigger>
                        }
                        </span>
                        {matches[assigned_request.service_request_object.id] ?
                        <span>
                          {Object.keys(matches[assigned_request.service_request_object.id].species_matches).map((key,i) => (
                            <span key={key} style={{textTransform:"capitalize"}}>
                              {i > 0 && ", "}{prettyText(key.split(',')[0], matches[assigned_request.service_request_object.id].species_matches[key])}
                            </span>
                          ))}
                        </span>
                        :""}
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Scrollbar>
            </Card>
          </CardGroup>
        </div>
      ))}
      <p className="mt-3">{data.isFetching ? 'Fetching dispatch assignments...' : <span>{filteredEvacAssignments.length ? '' : 'No dispatch assignments found.'}</span>}</p>
      <Pagination className="custom-page-links" size="lg" onClick={(e) => {setFocus(parseInt(e.target.innerText));setPage(parseInt(e.target.innerText))}}>
        {[...Array(numPages).keys()].map(x =>
        <Pagination.Item key={x+1} active={x+1 === page}>
          {x+1}
        </Pagination.Item>)
        }
      </Pagination>
    </div>
  )
}

export default DispatchAssignmentSearch;
