import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Button, Card, CardGroup, Col, Collapse, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from "react-bootstrap";
import { Link, navigate, useQueryParams } from "raviger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle, faExclamationCircle, faInfoCircle, faQuestionCircle, faUserAlt, faUserAltSlash, faUsers, faPrint
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faHomeAlt, faChevronDoubleDown, faChevronDoubleUp } from '@fortawesome/pro-solid-svg-icons';
import L from "leaflet";
import Select from 'react-select';
import { useMark, useSubmitting } from '../hooks';
import Moment from "react-moment";
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { DateRangePicker } from '../components/Form';
import { SystemErrorContext } from '../components/SystemError';
import { countDictMatches, prettyText } from "../components/Map";
import { printAllDispatchResolutions } from './Utils';
import LoadingLink from "../components/LoadingLink";
import ActionsDropdown from '../components/ActionsDropdown';

function DispatchAssignmentSearch({ incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    status = '',
  } = queryParams;

  const tempSearchTerm = useRef(null);
  const statusRef = useRef(null);
  const openDateRef = useRef(null);
  const dispatchDateRef = useRef(null);

  const [data, setData] = useState({evacuation_assignments: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [options, setOptions] = useState({id:null, status:status, open_start:null, open_end:null, dispatch_start:null, dispatch_end:null});
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [matches, setMatches] = useState({});
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [goToID, setGoToID] = useState('');
  const { markInstances } = useMark();
  const {
    isSubmittingById,
    handleSubmitting,
    submittingComplete,
    submittingLabel
  } = useSubmitting();

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

  const handleClear = () => {
    statusRef.current.select.clearValue();
    openDateRef.current.flatpickr.clear();
    dispatchDateRef.current.flatpickr.clear();
    setOptions({id:null, status:status, open_start:null, open_end:null, dispatch_start:null, dispatch_end:null});
    setTriggerRefresh(!triggerRefresh);
  };

  const handlePrintAllClick = (e) => {
    e.preventDefault();

    handleSubmitting()
      .then(() => printAllDispatchResolutions(data.evacuation_assignments))
      .then(submittingComplete);
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  }

  const customStyles = {
    // For the select it self, not the options of the select
    control: (styles, { isDisabled}) => {
      return {
        ...styles,
        color: '#FFF',
        cursor: isDisabled ? 'not-allowed' : 'default',
        backgroundColor: isDisabled ? '#DFDDDD' : 'white',
        height: 35,
        minHeight: 35,
        marginBottom: "15px"
      }
    },
    option: provided => ({
      ...provided,
      color: 'black'
    }),
  };

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchDispatchAssignments = async () => {
      setData({evacuation_assignments: [], isFetching: true});
      // Fetch DispatchAssignment data.
      await axios.get('/evac/api/evacassignment/?map=true&search=' + searchTerm + '&incident=' + incident + '&organization=' + organization, {
        cancelToken: source.token,
        params: {
          status: options.status,
          open_start: options.open_start,
          open_end: options.open_end,
          dispatch_start: options.dispatch_start,
          dispatch_end: options.dispatch_end,
        },
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({evacuation_assignments: response.data, isFetching: false});
          let map_dict = {};
          for (const dispatch_assignment of response.data) {
            for (const assigned_request of dispatch_assignment.assigned_requests) {
              const [species_matches, status_matches] = countDictMatches(assigned_request.animals, true);
              map_dict[assigned_request.service_request_object.id] = {species_matches:species_matches, status_matches:status_matches};
            }
          }
          setMatches(map_dict);

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
  }, [incident, searchTerm, triggerRefresh]);

  // Hook handling option changes.
  useEffect(() => {
    setIsDisabled(!(options.id || options.status || options.open_start || options.open_end || options.dispatch_start || options.dispatch_end));
  }, [options]);

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
                <Button variant="outline-light" type="submit" disabled={!goToID} style={{borderRadius:"0 5px 5px 0", color:"white"}} onClick={(e) => {navigate("/" + organization + "/" + incident + "/dispatch/summary/" + goToID)}}>Go</Button>
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
                <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0", color:"white"}}>Search
                  <OverlayTrigger
                    key={"search-information"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-search-information`}>
                        Searchable fields: team name, team member names, animal names, and service request address fields.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="ml-1 fa-move-up" size="sm" inverse />
                  </OverlayTrigger>
                </Button>
              </InputGroup.Append>
              <Button variant="outline-light" className="ml-1 mr-1" style={{height:"36px", color:"white"}} onClick={() => {setShowFilters(!showFilters)}}>Advanced {showFilters ? <FontAwesomeIcon icon={faChevronDoubleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronDoubleDown} size="sm" />}</Button>
              <ActionsDropdown alignRight={true} variant="dark" title={"Download All" + " (" + `${data.evacuation_assignments.length}` + ")"} search={true} disabled={data.isFetching || data.evacuation_assignments.length === 0}>
                <LoadingLink onClick={handlePrintAllClick} isLoading={data.isFetching} className="text-white d-block py-1 px-3">
                  <FontAwesomeIcon icon={faPrint} className="mr-1"  inverse />
                  PDF
                </LoadingLink>
              </ActionsDropdown>
            </InputGroup>
          </Col>
        </Row>
        <Collapse in={showFilters}>
          <div>
          <Card className="border rounded d-flex mt-3" style={{width:"100%"}}>
            <Card.Body style={{marginBottom:"-16px"}}>
              <Row>
                <Col xs={"4"} style={{textTransform:"capitalize"}}>
                  <Select
                    label="Status"
                    id="statusDropdown"
                    name="Status"
                    type="text"
                    placeholder="Select Status"
                    options={[{ value: 'preplanned', label: 'Preplanned' },{ value: 'active', label: 'Active' },{ value: 'resolved', label: 'Closed' },]}
                    styles={customStyles}
                    isClearable={true}
                    ref={statusRef}
                    onChange={(instance) => {
                      setOptions({...options, status: instance ? instance.value : null});
                    }}
                  />
                </Col>
                <Col xs="5">
                  <Row style={{marginBottom:"0px"}}>
                    <Col style={{marginLeft:"-15px", paddingRight:"0px"}}>
                      <DateRangePicker
                        name={`open_date`}
                        id={`open_date`}
                        placeholder={"Filter by Open Date"}
                        style={{height:"36px"}}
                        data-enable-time={false}
                        ref={openDateRef}
                        onChange={(dateRange) => {
                          if (dateRange.length > 1) {
                            setOptions({...options, open_start: dateRange[0], open_end:dateRange[1]});
                          } else {
                            setOptions({...options, open_start: dateRange[0], open_end:dateRange[1]});
                          }
                        }}
                      />
                    </Col>
                  </Row>
                  <Row className="mt-3" style={{maxHeight:"37px"}}>
                    <Col style={{marginLeft:"-15px", paddingRight:"0px", marginTop:"-2px"}}>
                      <DateRangePicker
                        name={`dispatch_date`}
                        id={`dispatch_date`}
                        placeholder={"Filter by Dispatch Date"}
                        style={{height:"36px"}}
                        ref={dispatchDateRef}
                        data-enable-time={false}
                        onChange={(dateRange) => {
                           if (dateRange.length > 1) {
                            setOptions({...options, dispatch_start: dateRange[0], dispatch_end:dateRange[1]});
                          } else {
                            setOptions({...options, dispatch_start: dateRange[0], dispatch_end:dateRange[1]});
                          }
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col className="flex-grow-1 pl-0" xs="3">
                  <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={() => {tempSearchTerm.current.value !== searchTerm ? setSearchTerm(tempSearchTerm.current.value) : setTriggerRefresh(!triggerRefresh);}} disabled={isDisabled}>Apply</Button>
                  <Button className="mb-3" variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          </div>
        </Collapse>
      </Form>
      {data.evacuation_assignments.map((evacuation_assignment, index) => (
        <div key={evacuation_assignment.id} className="mt-3 border rounded" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
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
              <span title={evacuation_assignment.team ? evacuation_assignment.team_name + ": " + evacuation_assignment.team_member_names : ""}>
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
          <CardGroup style={{overflowX:"hidden", marginBottom:"-6px"}}>
            <Card style={{marginBottom:"6px", maxWidth:"300px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Information</Card.Title>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup>
                    <ListGroup.Item><b>Status: </b>{evacuation_assignment.end_time ? 'Closed' : evacuation_assignment.end_time === null && evacuation_assignment.team_member_names ? 'Active' : 'Preplanned'}</ListGroup.Item>
                    <ListGroup.Item><b>Opened: </b><Moment format="L">{evacuation_assignment.start_time}</Moment></ListGroup.Item>
                    {evacuation_assignment.dispatch_date ?
                      <ListGroup.Item><b>Dispatched: </b><Moment format="L">{evacuation_assignment.dispatch_date}</Moment></ListGroup.Item>
                    : ""}
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
            {/* <Card style={{maxWidth:"206px", height:"206px"}} className="border rounded">
              <Card.Body className="p-0 m-0">
                <Map className="d-block da-search-leaflet-container" bounds={bounds[evacuation_assignment.id]} zoomControl={false} legend_position="topleft">
                  {evacuation_assignment.assigned_requests.map(assigned_request => (
                  <Marker
                    key={assigned_request.service_request_object.id}
                    position={[assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]}
                    icon={assigned_request.service_request_object.reported_animals > 0 ? reportedMarkerIcon : assigned_request.service_request_object.reported_evac > 0 ? reportedEvacMarkerIcon : assigned_request.service_request_object.reported_sheltered_in_place > 0 ? reportedSIPMarkerIcon : assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : assigned_request.service_request_object.unable_to_locate > 0 ? UTLMarkerIcon : Object.keys(assigned_request.animals).length === 0 ? operationsMarkerIcon : closedMarkerIcon}
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
            </Card> */}
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
      <p className="mt-3">{data.isFetching ? 'Fetching dispatch assignments...' : <span>{data.evacuation_assignments.length ? '' : 'No dispatch assignments found.'}</span>}</p>
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
