import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, OverlayTrigger, Pagination, Tooltip } from "react-bootstrap";
import { Link, useQueryParams } from "raviger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle, faExclamationCircle, faQuestionCircle, faUserAlt, faUserAltSlash, faUsers
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import Map, { prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Moment from "react-moment";
import moment from 'moment'
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import {DateRangePicker} from '../components/Form';

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
  const [matches, setMatches] = useState({});
  const [bounds, setBounds] = useState({});
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const topRef = useRef(null);
  const [startDate, setStartDate] = useState(moment('20200101').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setTempSearchTerm(event.target.value);
  };

  // Use searchTerm to filter evacuation_assignments.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm);
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      topRef.current.focus();
    }
  }

  // Counts the number of species matches for a service request.
  const countMatches = (service_request) => {
    let species_matches = {};
    let status_matches = {'REPORTED':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}};

    service_request.animals.forEach((animal) => {
      if (['REPORTED', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'].indexOf(animal.status) > -1) {
        if (!species_matches[[animal.species]]) {
          species_matches[[animal.species]] = 1;
        }
        else {
          species_matches[[animal.species]] += 1;
        }
        if (!status_matches[animal.status][[animal.species]]) {
          status_matches[animal.status][[animal.species]] = 1;
        }
        else {
          status_matches[animal.status][[animal.species]] += 1;
        }
      }
    });
    return [species_matches, status_matches]
  }

  let evacAssignments = data.evacuation_assignments.filter(ea => startDate <= moment(ea.start_time)
    .format('YYYY-MM-DD') && endDate >= moment(ea.start_time).format('YYYY-MM-DD'));
  
  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchDispatchAssignments = async () => {
      setData({evacuation_assignments: [], isFetching: true});
      // Fetch DispatchAssignment data.
      await axios.get('/evac/api/evacassignment/?search=' + searchTerm + '&status=' + statusOptions, {
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
              const [species_matches, status_matches] = countMatches(assigned_request.service_request_object);
              map_dict[assigned_request.service_request_object.id] = {species_matches:species_matches, status_matches:status_matches};
              sr_bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
            }
            bounds_dict[dispatch_assignment.id] = sr_bounds.length > 0 ? L.latLngBounds(sr_bounds).pad(.1) : L.latLngBounds([[0,0]]);
          }
          setMatches(map_dict);
          setBounds(bounds_dict);
        }
      })
      .catch(error => {
        if (!unmounted) {
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
              ref={topRef}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search</Button>
          </InputGroup.Append>
          <ButtonGroup className="ml-3">
            <Button variant={statusOptions === "open" ? "primary" : "secondary"} onClick={statusOptions !== "open" ? () => {setPage(1);setStatusOptions("open")} : () => {setPage(1);setStatusOptions("")}}>Open</Button>
            <Button variant={statusOptions === "closed" ? "primary" : "secondary"} onClick={statusOptions !== "closed" ? () => {setPage(1);setStatusOptions("closed")} : () => {setPage(1);setStatusOptions("")}}>Closed</Button>
          </ButtonGroup>
          <DateRangePicker
            name={`date_range_picker`}
            id={`date_range_picker`}
            placeholder={"Filter by Date Range"}
            onChange={(dateRange) => {
              dateRange = dateRange.toString().split(',');
              setStartDate(moment(dateRange[0]).format('YYYY-MM-DD'))
              setEndDate(moment(dateRange[1]).format('YYYY-MM-DD'));
              setNumPages(Math.ceil(evacAssignments.length / ITEMS_PER_PAGE));
            }}
          />
        </InputGroup>
      </Form>
      {evacAssignments.map((evacuation_assignment, index) => (
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
                <Link href={"/dispatch/summary/" + evacuation_assignment.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              <Moment format="L">{evacuation_assignment.start_time}</Moment>
              &nbsp;|&nbsp;
              <span title={evacuation_assignment.team ? evacuation_assignment.team_object.name + ": " + evacuation_assignment.team_member_names : ""}>
                {evacuation_assignment.team && evacuation_assignment.team_object.name}
                {evacuation_assignment.team ?
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
                    icon={assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : assigned_request.service_request_object.unable_to_locate > 0 ? UTLMarkerIcon : reportedMarkerIcon}
                    onClick={() => window.open("/hotline/servicerequest/" + assigned_request.service_request_object.id)}
                  >
                    <MapTooltip autoPan={false} direction={evacuation_assignment.assigned_requests.length > 1 ? "auto" : "top"}>
                      <span>
                        {matches[assigned_request.service_request_object.id] ?
                          <span>
                            {Object.keys(matches[assigned_request.service_request_object.id].species_matches).map((key,i) => (
                              <span key={key} style={{textTransform:"capitalize"}}>
                                {i > 0 && ", "}{prettyText('', key.split(',')[0], matches[assigned_request.service_request_object.id].species_matches[key])}
                              </span>
                            ))}
                          </span>
                        :""}
                        <br />
                        #{assigned_request.service_request_object.id}: {assigned_request.service_request_object.full_address.split(',')[0]}
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
                    <div key={assigned_request.service_request_object.id} className="" style={{marginLeft:"-10px", marginRight:"7px", marginTop: "7px", marginBottom:"0px"}}>
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
                            <Tooltip id={`tooltip-utl`}>
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
                        <span><Link href={"/hotline/servicerequest/" + assigned_request.service_request_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>#{assigned_request.service_request_object.id} - {assigned_request.service_request_object.full_address}</Link> |
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
                              {i > 0 && ", "}{prettyText('', key.split(',')[0], matches[assigned_request.service_request_object.id].species_matches[key])}
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
      <p>{data.isFetching ? 'Fetching dispatch assignments...' : <span>{data.evacuation_assignments && data.evacuation_assignments.length ? '' : 'No dispatch assignments found.'}</span>}</p>
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
