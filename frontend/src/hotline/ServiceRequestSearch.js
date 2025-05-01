import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Button, Card, CardGroup, Col, Collapse, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faCar, faChevronDown, faChevronUp, faDownload, faUpload, faEquals, faEnvelope, faInfoCircle, faKey, faTrailer, faPrint
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faChevronDoubleDown, faChevronDoubleUp, faCommentSmile, faPhoneRotary } from '@fortawesome/pro-solid-svg-icons';
import Moment from 'react-moment';
import { DATE_FORMAT } from '../constants';
import { AuthContext } from "../accounts/AccountsReducer";
import { useMark, useSubmitting } from '../hooks';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { SystemErrorContext } from '../components/SystemError';
import { DateRangePicker } from '../components/Form';
import { printAllServiceRequests } from './Utils';
import { titleCase } from '../components/Utils';
import LoadingLink from "../components/LoadingLink";
import ActionsDropdown from '../components/ActionsDropdown';

function ServiceRequestSearch({ incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { state } = useContext(AuthContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    status = '',
  } = queryParams;

  const priorityText = {1:'Urgent', 2:'High', 3:'Medium', 4:'Low', 5:'Lowest'};

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

  const [data, setData] = useState({service_requests: [], isFetching: false});
  const [searchState, setSearchState] = useState({});
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search);
  const tempSearchTerm = useRef(null);
  const priorityRef = useRef(null);
  const statusRef = useRef(null);
  const openStartRef = useRef(null);
  const openEndRef = useRef(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [options, setOptions] = useState({id:null, priority:null, status:status, open_start:null, open_end:null});
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

  const handlePrintAllClick = (e) => {
    e.preventDefault();

    handleSubmitting()
      .then(() => printAllServiceRequests(data.service_requests))
      .then(submittingComplete);
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  }

  const handleGeoJsonDownload = (e) => {
    e.preventDefault();

    handleSubmitting()
    .then(() => downloadGeoJson()
      )
    .then(submittingComplete)
  }

  const downloadGeoJson= () => {
    var params = '';
    data.service_requests.forEach(sr => params = params + "id=" + sr.id + "&")
    var fileDownload = require('js-file-download');
    axios.get('/hotline/api/servicerequests/download_all/', { 
            params: {
              ids: params
            },
            responseType: 'blob',
        }).then(res => {
            fileDownload(res.data, `SRs-${moment().format(DATE_FORMAT)}` + '.geojson');
        }).catch(err => {
        })
  }

  const handleGeoJsonPush = (e) => {
    e.preventDefault();
    handleSubmitting()
    .then(() => pushData()
      )
    .then(submittingComplete)
  }

  async function pushData(){
    var params = '';
    data.service_requests.forEach(sr => params = params + "id=" + sr.id + "&")
    const response = await axios.get('/hotline/api/servicerequests/push_all/', { 
            params: {
              ids: params
            },
            responseType: 'json',
    }).catch(err => {
    })
  }

  const handleClear = () => {
    priorityRef.current.select.clearValue();
    statusRef.current.select.clearValue();
    openStartRef.current.flatpickr.clear();
    openEndRef.current.flatpickr.clear();
    setOptions({id:null, priority:null, status:null, open_start:null, open_end:null});
    setTriggerRefresh(!triggerRefresh);
  };

  // Hook handling option changes.
  useEffect(() => {
    setIsDisabled(!(options.id || options.priority || options.status || options.open_start || options.open_end));
  }, [options]);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = () => {
      setData({service_requests: [], isFetching: true});
      // Fetch ServiceRequest data.
      axios.get('/hotline/api/servicerequests/?search=' + searchTerm + '&incident=' + incident + '&organization=' + organization, {
        cancelToken: source.token,
        params: {
          status: options.status,
          priority: options.priority,
          open_start: options.open_start,
          open_end: options.open_end,
        },
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({service_requests: response.data, isFetching: false});
          let search_state = {};
					response.data.forEach(service_request => {
						let species = [];
						service_request.animals.forEach(animal => {
							if (!species.includes(animal.species_string)) {
								species.push(animal.species_string)
							}
						});
            species.sort(function(a, b) {
              return a.localeCompare(b);
            });
						search_state[service_request.id] = {species:species, selectedSpecies:species[0]};
					});
					setSearchState(search_state);

          // highlight search terms
          markInstances(searchTerm);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({service_requests: [], isFetching: false});
          setShowSystemError(true);
        }
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, incident, triggerRefresh]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Service Requests</Header>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
              <InputGroup.Append>
                <Button variant="outline-light" type="submit" disabled={!goToID} style={{borderRadius:"0 5px 5px 0", color:"white"}} onClick={(e) => {navigate("/" + organization + "/" + incident + "/hotline/servicerequest/" + goToID)}}>Go</Button>
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
              ref={tempSearchTerm}
            />
            <InputGroup.Append>
              <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0", height:"36px", color:"white"}}>Search
                <OverlayTrigger
                  key={"search-information"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-search-information`}>
                      Searchable fields: address fields, animal names, and animal owner last names.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="ml-1 fa-move-up" size="sm" inverse />
                </OverlayTrigger>
              </Button>
            </InputGroup.Append>
            <Button variant="outline-light" className="ml-1 mr-1" style={{height:"36px", color:"white"}} onClick={() => {setShowFilters(!showFilters)}}>Advanced {showFilters ? <FontAwesomeIcon icon={faChevronDoubleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronDoubleDown} size="sm" />}</Button>
            <ActionsDropdown alignRight={true} variant="dark" title={"Download All" + " (" + `${data.service_requests.length}` + ")"} search={true} disabled={data.isFetching || data.service_requests.length === 0}>
              <LoadingLink onClick={handlePrintAllClick} isLoading={data.isFetching} className="text-white d-block py-1 px-3">
                <FontAwesomeIcon icon={faPrint} className="mr-1"  inverse />
                PDF
              </LoadingLink>
              <LoadingLink onClick={handleGeoJsonDownload} isLoading={data.isFetching} className="text-white d-block py-1 px-3">
                <FontAwesomeIcon icon={faDownload} className="mr-1"  inverse />
                GeoJSON
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
                    options={[{ value: 'open', label: 'Open' },{ value: 'assigned', label: 'Assigned' },{ value: 'closed', label: 'Closed' },{ value: 'canceled', label: 'Canceled' },]}
                    styles={customStyles}
                    isClearable={true}
                    ref={statusRef}
                    onChange={(instance) => {
                      setOptions({...options, status: instance ? instance.value : null});
                    }}
                  />
                  <Select
                    label="Priority"
                    id="priorityDropdown"
                    name="priority"
                    type="text"
                    placeholder="Select Priority"
                    options={[{ value: 1, label: 'Urgent' },
                    { value: 2, label: 'High' },
                    { value: 4, label: 'Low' }]}
                    styles={customStyles}
                    isClearable={true}
                    ref={priorityRef}
                    onChange={(instance) => {
                      setOptions({...options, priority: instance ? instance.value : null})
                    }}
                  />
                </Col>
                <Col xs="5">
                  <Row style={{marginBottom:"0px"}}>
                    <Col style={{marginLeft:"-15px", paddingRight:"0px"}}>
                      <DateRangePicker
                        name={`start_date_range_picker`}
                        id={`start_date_range_picker`}
                        placeholder={"Opened Start Date"}
                        mode="single"
                        data-enable-time={true}
                        clearable={"true"}
                        hour={0}
                        style={{height:"36px"}}
                        ref={openStartRef}
                        onChange={(dateRange) => {
                          setOptions({...options, open_start: dateRange.length ? dateRange[0] : null})
                        }}
                      />
                    </Col>
                  </Row>
                  <Row className="mt-3" style={{maxHeight:"37px"}}>
                    <Col style={{marginLeft:"-15px", paddingRight:"0px", marginTop:"-2px"}}>
                      <DateRangePicker
                        name={`end_date_range_picker`}
                        id={`end_date_range_picker`}
                        placeholder={"Opened End Date"}
                        mode="single"
                        data-enable-time={true}
                        clearable={"true"}
                        hour={23}
                        minute={59}
                        style={{height:"36px"}}
                        ref={openEndRef}
                        onChange={(dateRange) => {
                          setOptions({...options, open_end: dateRange.length ? dateRange[0] : null})
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
      {data.service_requests.map((service_request, index) => (
        <div key={service_request.id} className="mt-3 border rounded" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header">
            <h4 style={{marginBottom:"-2px",  marginLeft:"-12px"}}>
              <OverlayTrigger
                key={"request-details"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-request-details`}>
                    Service request details
                  </Tooltip>
                }
              >
                <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + service_request.id_for_incident}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              SR#{service_request.id_for_incident}
              &nbsp;-&nbsp;{service_request.full_address}
            </h4>
          </div>
          <CardGroup style={{marginBottom:"-6px"}}>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px", marginLeft:"0px"}} className="row">
                  Information
                  {service_request.priority === 1 ?
                    <OverlayTrigger
                      key={"highest"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-highest`}>
                          {priorityText[service_request.priority]} priority
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faChevronDoubleUp} size="sm" className="ml-1 fa-move-down"/>
                    </OverlayTrigger>
                  : service_request.priority === 2 ?
                    <OverlayTrigger
                      key={"high"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-high`}>
                          {priorityText[service_request.priority]} priority
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faChevronUp} size="sm" className="ml-1 fa-move-down"/>
                    </OverlayTrigger>
                  : service_request.priority === 3 ?
                    <OverlayTrigger
                      key={"medium"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-medium`}>
                          {priorityText[service_request.priority]} priority
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faEquals} size="sm" className="ml-1 fa-move-down"/>
                    </OverlayTrigger>
                  : service_request.priority === 4 ?
                    <OverlayTrigger
                      key={"low"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-low`}>
                          {priorityText[service_request.priority]} priority
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faChevronDown} size="sm" className="ml-1 fa-move-down"/>
                    </OverlayTrigger>
                  : service_request.priority === 5 ?
                    <OverlayTrigger
                      key={"lowest"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-lowest`}>
                          {priorityText[service_request.priority]} priority
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faChevronDoubleDown} size="sm" className="ml-1 fa-move-down"/>
                    </OverlayTrigger>
                  : ""}
                  {service_request.verbal_permission ?
                  <OverlayTrigger
                    key={"verbal"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-verbal`}>
                        Verbal Liability Release
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faCommentSmile} size="sm" className="ml-1" />
                  </OverlayTrigger> : ""
                  }
                  {service_request.key_provided ?
                  <OverlayTrigger
                    key={"key"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-key`}>
                        Key at staging
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faKey} size="sm" className="ml-1" transform={'shrink-2'} />
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
                    <span className="fa-layers" style={{marginLeft:"2px"}}>
                      <FontAwesomeIcon icon={faKey} size="sm" transform={'shrink-2'} />
                      <FontAwesomeIcon icon={faBan} color="#ef5151" size="sm" transform={'shrink-1'} />
                    </span>
                  </OverlayTrigger>
                  }
                  {service_request.accessible ?
                  <OverlayTrigger
                    key={"accessible"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-accessible`}>
                        Easily accessible
                      </Tooltip>
                    }
                  >
                    <span className="fa-layers mr-1">
                      <FontAwesomeIcon icon={faCar} size="sm" className="ml-1 fa-move-up" />
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
                  {service_request.turn_around ?
                  <OverlayTrigger
                    key={"turnaround"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-turnaround`}>
                        Room to turn around
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faTrailer} size="sm" className="ml-1 fa-move-down" />
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
                </Card.Title>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup>
                    <ListGroup.Item style={{textTransform:"capitalize"}}>
                      <Row>
                        <Col xs="4"><b>Status: </b>{service_request.status}</Col>
                        <Col xs="8" className="text-right"><b>Opened: </b><Moment format="LLL">{service_request.timestamp}</Moment></Col>
                     </Row>
                    </ListGroup.Item>
                    {service_request.owner_objects.map(owner => (
                      <ListGroup.Item key={owner.id}>
                        <b>Owner: </b><Link href={"/" + organization + "/" + incident + "/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
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
                    {service_request.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
                    {service_request.reporter ? <ListGroup.Item><b>Reporter: </b><Link href={"/" + organization + "/" + incident + "/people/reporter/" + service_request.reporter} className="text-link" style={{textDecoration:"none", color:"white"}}>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name}</Link></ListGroup.Item> : ""}
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
            {searchState[service_request.id] ?
              <Card style={{marginBottom:"6px"}}>
                <Card.Body style={{width:"525px"}}>
                  <Card.Title style={{marginTop:"-10px"}}>
                    <Scrollbar horizontal="true" autoHide style={{height:"32px", width:"485px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                      <ListGroup horizontal>
                      {searchState[service_request.id].species.map(species => (
                        <ListGroup.Item key={species} active={searchState[service_request.id].selectedSpecies === species ? true : false} style={{textTransform:"capitalize", cursor:'pointer', paddingTop:"4px", paddingBottom:"4px"}} onClick={() => setSearchState(prevState => ({ ...prevState, [service_request.id]:{...prevState[service_request.id], selectedSpecies:species} }))}>{species}{["other", "sheep", "cattle"].includes(species) ? "" : "s"}</ListGroup.Item>
                      ))}
                      </ListGroup>
                    </Scrollbar>
                  </Card.Title>
                  <ListGroup style={{height:"144px", overflowY:"auto", marginTop:"-12px"}}>
                    <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                      {service_request.animals.filter(animal => animal.species_string === searchState[service_request.id].selectedSpecies).map((animal, i) => (
                        <ListGroup.Item key={animal.id}>
                          <b><Link href={"/" + organization + "/" + incident + "/animals/" + animal.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{animal.id_for_incident}</Link>:</b>&nbsp;&nbsp;{Number(animal.animal_count) === 1 ? <span>{animal.name || "Unknown"}</span> : <span>{animal.animal_count} {titleCase(animal.species_string)}{["cattle", "sheep"].includes(animal.species_string) ? "" : "s"}</span>}
                          &nbsp;- {animal.status}
                        </ListGroup.Item>
                      ))}
                    {service_request.animals.length < 1 ? <ListGroup.Item>No Animals</ListGroup.Item> : ""}
                    </Scrollbar>
                  </ListGroup>
              </Card.Body>
            </Card>
            : ""}
          </CardGroup>
        </div>
      ))}
      <p className="mt-3">{data.isFetching ? 'Fetching service requests...' : <span>{data.service_requests.length ? '' : 'No service requests found.'}</span>}</p>
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

export default ServiceRequestSearch;
