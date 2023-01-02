import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, Card, CardGroup, Col, Collapse, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faChevronDoubleDown, faChevronDoubleUp } from '@fortawesome/pro-solid-svg-icons';
import Select from 'react-select';
import Moment from 'react-moment';
import moment from 'moment';
import { useMark } from '../hooks';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { SystemErrorContext } from '../components/SystemError';
import { speciesChoices } from '../animals/constants';
import Flatpickr from 'react-flatpickr';

function VetRequestSearch({ incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
  } = queryParams;

  const priorityText = {urgent:'Urgent', when_available:'When Available'};

  const priorityChoices = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'when_available', label: 'When Available' },
  ];

  const statusChoices = [
    { value: 'Open', label: 'Open' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'Closed', label: 'Closed' },
  ];

  const [data, setData] = useState({vet_requests: [], isFetching: false});
  const [shelters, setShelters] = useState({options: [], isFetching: false});
  const [assignees, setAssignees] = useState({options: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const tempSearchTerm = useRef(null);
  const speciesRef = useRef(null);
  const statusRef = useRef(null);
  const priorityRef = useRef(null);
  const assigneeRef = useRef(null);
  const openRef = useRef(null);
  const shelterRef = useRef(null);
  const [vetRequests, setVetRequests] = useState([]);
  const [options, setOptions] = useState({species: null, status: null, priority: null, open: null, assignee: null, shelter: ''});
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const { markInstances } = useMark();

  // Update searchTerm when field input changes.
  const handleChange = event => {
    tempSearchTerm.current.value = event.target.value;
  };

  // Use searchTerm to filter vet_requests.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm.current.value);
    setPage(1);
  };

  const handleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  // Parses the Date Range object
  function parseDateRange(dateRange) {
    if (dateRange.length > 1) {
      dateRange = dateRange.toString().split(',');
      setStartDate(moment(dateRange[0]).format('YYYY-MM-DD'))
      setEndDate(moment(dateRange[1]).format('YYYY-MM-DD'));
    } else {
      setStartDate(moment(dateRange[0]).format('YYYY-MM-DD'))
      setEndDate(moment(dateRange[0]).format('YYYY-MM-DD'));
    }
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  };

  const handleApplyFilters = () => {
    setVetRequests(data.vet_requests.filter(vet_request => options.species ? vet_request.species === options.species : vet_request)
                           .filter(vet_request => options.status ? vet_request.status === options.status : vet_request)
                           .filter(vet_request => options.priority ? vet_request.priority === options.priority : vet_request)
                           .filter(vet_request => options.open ? (startDate <= moment(vet_request.open).format('YYYY-MM-DD') && endDate >= moment(vet_request.open).format('YYYY-MM-DD')) : vet_request)
                           .filter(vet_request => options.assignee ? vet_request.assignee === options.assignee : vet_request)
                           .filter(vet_request => options.shelter ? vet_request.animal_object.shelter === options.shelter : vet_request)
    )
  };

  const handleClear = () => {
    speciesRef.current.select.clearValue();
    statusRef.current.select.clearValue();
    priorityRef.current.select.clearValue();
    if (openRef.current) {
      openRef.current.flatpickr.clear();
    }
    assigneeRef.current.select.clearValue();
    shelterRef.current.select.clearValue();
    setOptions({species: null, status: null, priority: null, open: null, assignee: null, shelter: ''});
    setVetRequests(data.vet_requests);
  };

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

    const fetchVetRequests = async () => {
      setData({vet_requests: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/vet/api/vetrequest/?search=' + searchTerm, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({vet_requests: response.data, isFetching: false});
          setVetRequests(response.data);

          // highlight search terms
          markInstances(searchTerm);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({vet_requests: [], isFetching: false});
          setShowSystemError(true);
        }
      });
    };
    fetchVetRequests();

    const fetchShelters = () => {
      setShelters({options: [], isFetching: true});
      // Fetch Shelter data.
      axios.get('/shelter/api/shelter/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let shelter_options = [];
          response.data.forEach(shelter => {
            // Build shelter option list.
            shelter_options.push({value: shelter.id, label: shelter.name});
          });
          setShelters({options: shelter_options, isFetching:false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShelters({options: [], isFetching: false});
          setShowSystemError(true);
        }
      });
    };
    fetchShelters();

    const fetchAssignees = async () => {
      // Fetch assignee data.
      await axios.get('/accounts/api/user/?vet=true', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          response.data.forEach(function(person) {
            options.unshift({value: person.id, label: person.first_name + ' ' + person.last_name})
          });
          setAssignees({options: options, isFetching:false});
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchAssignees();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, incident]);

  // Hook handling option changes.
  useEffect(() => {
    const handleDisabled = () => {
      setIsDisabled(!(options.species || options.status || options.priority || options.open || options.assignee || options.shelter));
    };

    setNumPages(Math.ceil(vetRequests.length / ITEMS_PER_PAGE));
    setPage(1);
    handleDisabled();
  }, [options, vetRequests.length]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Veterinary Requests</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            onChange={handleChange}
            ref={tempSearchTerm}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search</Button>
          </InputGroup.Append>
          <Button variant="outline-light" className="ml-1" onClick={handleShowFilters}>Advanced {showFilters ? <FontAwesomeIcon icon={faChevronDoubleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronDoubleDown} size="sm" />}</Button>
        </InputGroup>
        <Collapse in={showFilters}>
          <div>
          <Card className="border rounded d-flex" style={{width:"100%"}}>
            <Card.Body style={{marginBottom:"-16px"}}>
              <Row>
                <Col xs={"5"}>
                  <Select
                    label="Species"
                    id="speciesDropdown"
                    name="species"
                    type="text"
                    placeholder="Select Species"
                    options={speciesChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={speciesRef}
                    onChange={(instance) => {
                      setOptions({...options, species: instance ? instance.value : null});
                    }}
                  />
                  <Select
                    label="status"
                    id="statusDropdown"
                    name="Status"
                    type="text"
                    placeholder="Select Status"
                    options={statusChoices}
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
                    options={priorityChoices}
                    styles={customStyles}
                    isClearable={true}
                    ref={priorityRef}
                    onChange={(instance) => {
                      setOptions({...options, priority: instance ? instance.value : null});
                    }}
                  />
                </Col>
                <Col xs="5">
                  <Row style={{marginBottom:"-16px"}}>
                    <Col className="pl-0 pr-0 mb-3 mr-3">
                      <Select
                        label="Assignee"
                        id="assigneeDropdown"
                        name="assignee"
                        type="text"
                        placeholder="Select Assignee"
                        options={assignees.options}
                        styles={customStyles}
                        isClearable={true}
                        ref={assigneeRef}
                        onChange={(instance) => {
                          setOptions({...options, assignee: instance ? instance.value : null});
                        }}
                      />
                      <Select
                        label="Shelter"
                        id="shelterDropdown"
                        name="shelter"
                        type="text"
                        placeholder="Select Shelter"
                        options={shelters.options}
                        styles={customStyles}
                        isClearable={true}
                        ref={shelterRef}
                        onChange={(instance) => {
                          setOptions({...options, shelter: instance ? instance.value : ''})
                        }}
                      />
                      <Flatpickr 
                        options={{allowInput: true, altFormat: "F j, Y", dateFormat: "Y-m-d", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                        style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                        name={`open`}
                        id={`open`}
                        label="Open"
                        placeholder={"Select Open Date Range"}
                        ref={openRef}
                        className="w-100"
                        onChange={(dateRange) => {
                          if (dateRange) {
                            parseDateRange(dateRange);
                          }
                          setOptions({...options, open: dateRange ? true : null});
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col className="flex-grow-1 pl-0" xs="2">
                  <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={handleApplyFilters} disabled={isDisabled}>Apply</Button>
                  <Button variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          </div>
        </Collapse>
      </Form>
      {vetRequests.map((vet_request, index) => (
        <div key={vet_request.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header">
            <h4 style={{marginBottom:"-2px",  marginLeft:"-12px"}}>
              <OverlayTrigger
                key={"request-details"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-request-details`}>
                    Veterinary request details
                  </Tooltip>
                }
              >
                <Link href={"/" + incident + "/vet/vetrequest/" + vet_request.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              VR#{vet_request.id}
              &nbsp;-&nbsp;{vet_request.animal_object.name || "Unknown"}
              &nbsp;| {vet_request.status}
            </h4>
          </div>
          <CardGroup>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px", marginLeft:"0px"}} className="row">
                  Information
                </Card.Title>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <b>Patient ID: </b><Link href={"/" + incident + "/animals/" + vet_request.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{vet_request.animal_object.id}</Link>
                        </Col>
                        <Col style={{textTransform:"capitalize"}}>
                          <b>Species:</b> {vet_request.animal_object.species}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <b>Priority: </b>{priorityText[vet_request.priority]}
                        </Col>
                        <Col>
                          <b>Opened: </b><Moment format="L">{vet_request.open}</Moment>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <b>Assignee:</b> {vet_request.assignee_object ? <span>{vet_request.assignee_object.first_name} {vet_request.assignee_object.last_name}</span> : "Unassigned"}
                        </Col>
                        <Col>
                          <b>Shelter: </b>{vet_request.shelter_name || "Unknown"}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Treatments</Card.Title>
                <ListGroup style={{height:"144px", overflowY:"auto"}}>
                  <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                    {vet_request.treatment_plans.map((treatment, i) => (
                      <ListGroup.Item key={treatment.id}>
                        <Link href={"/" + incident + "/vet/treatment/" + treatment.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{treatment.treatment_object.description || "Unknown"}</Link>
                      </ListGroup.Item>
                    ))}
                  {vet_request.treatment_plans.length < 1 ? <ListGroup.Item style={{marginTop:"32px"}}>No Treatments</ListGroup.Item> : ""}
                  </Scrollbar>
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
        </div>
      ))}
      <p>{data.isFetching ? 'Fetching veterinary requests...' : <span>{data.vet_requests && data.vet_requests.length ? '' : 'No Veterinary Requests found.'}</span>}</p>
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

export default VetRequestSearch;
