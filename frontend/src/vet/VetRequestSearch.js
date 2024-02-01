import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Col, Collapse, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlusSquare,
  faTimes,
  faCheckSquare,
  faChevronCircleDown,
  faChevronCircleRight,
  faStethoscope,
  faVial,
  faSyringe,
  faSoap,
  faEye,
  faSquare,
  faWater,
  faHeart,
  faTable,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faChevronDoubleDown, faChevronDoubleUp, faDiamondExclamation,
  faEyeDropper,
  faPrescriptionBottlePill,
  faSquareExclamation,
  faSquareEllipsis,
  faSquareX,
  faScalpelLineDashed,
  faFlashlight,
  faPeriod,
  faMobileScreenButton } from '@fortawesome/pro-solid-svg-icons';
import { faBandage, faRing, faTankWater } from '@fortawesome/pro-regular-svg-icons';
import {
  faRectangleVertical,
} from '@fortawesome/sharp-solid-svg-icons';
import Select from 'react-select';
import Moment from 'react-moment';
import moment from 'moment';
import { useMark } from '../hooks';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import Flatpickr from 'react-flatpickr';

function VetRequestSearch({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
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
    { value: 'Closed', label: 'Closed' },
    { value: 'Canceled', label: 'Canceled' },
  ];

  const [data, setData] = useState({vet_requests:[], treatments:[], diagnostics:[], procedures:[], isFetching:false});
  const [shelters, setShelters] = useState({options:[], isFetching:false});
  const [speciesChoices, setSpeciesChoices] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [vetObject, setVetObject] = useState('vet_request');
  const tempSearchTerm = useRef(null);
  const speciesRef = useRef(null);
  const statusRef = useRef(null);
  const priorityRef = useRef(null);
  const openerRef = useRef(null);
  const openRef = useRef(null);
  const shelterRef = useRef(null);
  const [vetRequests, setVetRequests] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [options, setOptions] = useState({species: '', status:null, priority:null, open:null, assignee:null, shelter: ''});
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
    setVetRequests(data.vet_requests.filter(vet_request => options.species ? vet_request.animal_object.species_string.toLowerCase() === options.species.toLowerCase() : vet_request)
      .filter(vet_request => options.status ? vet_request.status === options.status : vet_request)
      .filter(vet_request => options.priority ? vet_request.priority === options.priority : vet_request)
      .filter(vet_request => options.open ? (startDate <= moment(vet_request.open).format('YYYY-MM-DD') && endDate >= moment(vet_request.open).format('YYYY-MM-DD')) : vet_request)
      .filter(vet_request => options.opener ? vet_request.requested_by_object.id === options.opener : vet_request)
      .filter(vet_request => options.shelter && options.shelter !== 'Remote' ? vet_request.animal_object.shelter === options.shelter : vet_request)
      .filter(vet_request => options.shelter === 'Remote' ? vet_request.animal_object.shelter === null : vet_request)
    )
  };

  const handleClear = () => {
    speciesRef.current.select.clearValue();
    statusRef.current.select.clearValue();
    priorityRef.current.select.clearValue();
    if (openRef.current) {
      openRef.current.flatpickr.clear();
    }
    openerRef.current.select.clearValue();
    shelterRef.current.select.clearValue();
    setOptions({species:'', status:null, priority:null, open:null, assignee:null, shelter:''});
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

    const fetchSpecies = () => {
      setSpeciesChoices([]);
      // Fetch Species data.
      axios.get('/animals/api/species/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let species_options = [];
          response.data.forEach(result => {
            // Build species option list.
            species_options.push({value: result.name, label: result.name});
          });
          setSpeciesChoices(species_options);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShelters({options: []});
          setShowSystemError(true);
        }
      });
    };
    fetchSpecies();

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
          shelter_options.push({value: 'Remote', label: 'Remote'});
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

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [incident]);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchVetRequests = async () => {
      setData({vet_requests: [], isFetching: true});
      // Fetch VetRequest data.
      await axios.get('/vet/api/vetrequest/?search=' + searchTerm + '&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({vet_requests: response.data, isFetching: false});
          setVetRequests(response.data);

          // Build opener option list.
          let openers = [];
          response.data.forEach(vet_request => {
            if (openers.filter(opener => opener.value === vet_request.requested_by_object.id).length === 0) {
              openers.push({'value':vet_request.requested_by_object.id, 'label':vet_request.requested_by_object.first_name + ' ' + vet_request.requested_by_object.last_name});
            }
          });
          setAssignees({options: openers, isFetching:false});

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
    if (vetObject === 'vet_requests') {
      fetchVetRequests();
    }

    const fetchTreatments = () => {
      // Fetch TreatmentRequest data.
      axios.get('/vet/api/treatmentrequest/?search=' + searchTerm + '&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          console.log(response.data)
          setData(prevState => ({ ...prevState, "treatments":response.data }));
          setTreatments(response.data);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    if (vetObject === 'treatments') {
      fetchTreatments();
    }

    const fetchDiagnosticResult = async () => {
      // Fetch diagnostic result data.
      await axios.get('/vet/api/diagnosticresults/?search=' + searchTerm + '&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(prevState => ({ ...prevState, "diagnostics":response.data }));
          setDiagnostics(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    if (vetObject === 'diagnostics') {
      fetchDiagnosticResult();
    }

    const fetchProcedureResult = async () => {
      // Fetch procedure result data.
      await axios.get('/vet/api/procedureresults/?search=' + searchTerm + '&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(prevState => ({ ...prevState, "procedures":response.data }));
          setProcedures(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };

    if (vetObject === 'procedures') {
      fetchProcedureResult();
    }

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, incident, vetObject]);

  // Hook handling option changes.
  useEffect(() => {
    const handleDisabled = () => {
      setIsDisabled(!(options.species || options.status || options.priority || options.open || options.opener || options.shelter));
    };

    setNumPages(Math.ceil(vetRequests.length / ITEMS_PER_PAGE));
    setPage(1);
    handleDisabled();
  }, [options, vetRequests.length]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Veterinary Tasks</Header>
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
            <Card.Body>
              <Row>
                <Col xs={"5"}>
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
                  <Select
                    label="Opener"
                    id="assigneeDropdown"
                    name="assignee"
                    type="text"
                    placeholder="Select Opener"
                    options={assignees.options}
                    styles={customStyles}
                    isClearable={true}
                    ref={openerRef}
                    onChange={(instance) => {
                      setOptions({...options, opener: instance ? instance.value : null});
                    }}
                  />
                </Col>
                <Col xs="5">
                  <Row style={{marginBottom:"-16px"}}>
                    <Col className="pl-0 pr-0 mb-3 mr-3" style={{textTransform:"capitalize"}}>
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
                        options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
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
      <Row className="ml-0">
        <ButtonGroup className="float-right align-self-end mb-3">
          <Button variant={vetObject === "vet_requests" ? "primary" : "secondary"} onClick={vetObject !== "vet_requests" ? () => {setPage(1);setVetObject("vet_requests")} : () => {setPage(1);setVetObject("")}}>Veterinary Requests</Button>
          <Button variant={vetObject === "treatments" ? "primary" : "secondary"} onClick={vetObject !== "treatments" ? () => {setPage(1);setVetObject("treatments")} : () => {setPage(1);setVetObject("")}}>Treatments</Button>
          <Button variant={vetObject === "diagnostics" ? "primary" : "secondary"} onClick={vetObject !== "diagnostics" ? () => {setPage(1);setVetObject("diagnostics")} : () => {setPage(1);setVetObject("")}}>Diagnostics</Button>
          <Button variant={vetObject === "procedures" ? "primary" : "secondary"} onClick={vetObject !== "procedures" ? () => {setPage(1);setVetObject("procedures")} : () => {setPage(1);setVetObject("")}}>Procedures</Button>
        </ButtonGroup>
      </Row>
      {vetObject === 'vet_requests' && vetRequests.map((vet_request, index) => (
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
                <Link href={"/" + organization + "/" + incident + "/vet/vetrequest/" + vet_request.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              VR#{vet_request.id}
              &nbsp;| {vet_request.status}
            </h4>
          </div>
          <CardGroup>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px", marginLeft:"0px"}} className="row">
                  Information
                  {vet_request.caution ? <OverlayTrigger
                  key={"caution"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-caution`}>
                      Use caution when handling this animal.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faDiamondExclamation} className="ml-1 fa-move-down" inverse />
                </OverlayTrigger> : ""}
                </Card.Title>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup>
                    <ListGroup.Item>
                      <Row>
                        <Col xs="3">
                          <b>Patient: </b><Link href={"/" + organization + "/" + incident + "/animals/" + vet_request.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{vet_request.animal_object.id}</Link>
                        </Col>
                        <Col xs="3">
                          <b>Name: </b>{vet_request.animal_object.name || "Unknown"}
                        </Col>
                        <Col xs="3" style={{textTransform:"capitalize"}}>
                          <b>Species:</b> {vet_request.animal_object.species_string}
                        </Col>
                        {/* <Col xs="2" style={{textTransform:"capitalize"}}>
                          <b>Age:</b> {vet_request.animal_object.age || "Unknown"}
                        </Col>
                        <Col xs="2" style={{textTransform:"capitalize"}}>
                          <b>Sex:</b> {vet_request.animal_object.sex || "Unknown"}
                        </Col> */}
                        {/* <Col xs="2" style={{textTransform:"capitalize"}}>
                          <b>Altered:</b> {vet_request.animal_object.altered || "Unknown"}
                        </Col> */}
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col xs="3">
                          <b>Opened: </b>{moment(vet_request.open).format('l')}
                        </Col>
                        <Col xs="3">
                          <b>Priority: </b>{priorityText[vet_request.priority]}
                        </Col>
                        <Col>
                          <b>Opener: </b>{vet_request.requested_by_object.first_name + ' ' + vet_request.requested_by_object.last_name}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <b>Complaints:</b> {vet_request.complaints_text}
                        </Col>
                        <Col>
                          <b>Concern: </b>{vet_request.concern}
                        </Col>
                        {/* <Col>
                          <b>Shelter: </b>{vet_request.animal_object.shelter_object ? vet_request.animal_object.shelter_object.name:"Unknown"}{vet_request.animal_object.room_name ? <span> - {vet_request.animal_object.room_name}</span> : "Remote"}
                        </Col> */}
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
          </CardGroup>
        </div>
      ))}
      {vetObject === 'treatments' && treatments.map((treatment_request, index) => (
      <Row key={treatment_request.id} className="ml-0 mb-3">
        <Link href={"/" + organization + "/" + incident + "/vet/treatmentrequest/edit/" + treatment_request.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
          <Card className="border rounded treatment-hover-div" style={{height:"120px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
            <div className="row no-gutters hover-div treatment-hover-div" style={{height:"120px", marginRight:"-2px"}}>
              <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                <div className="border-right" style={{width:"120px"}}>
                {['Eye Medication','Ear Medication'].includes(treatment_request.treatment_object ? treatment_request.treatment_object.category : '') ?
                  <FontAwesomeIcon icon={faEyeDropper} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                  : treatment_request.treatment_object && treatment_request.treatment_object.category === 'Patient Care' ?
                  <FontAwesomeIcon icon={faHeart} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                  : treatment_request.treatment_object && treatment_request.treatment_object.unit === 'ml' ?
                  <FontAwesomeIcon icon={faSyringe} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"13px"}} transform={'grow-1'} inverse />
                :
                  <FontAwesomeIcon icon={faPrescriptionBottlePill} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"9px"}} transform={'grow-1'} inverse />
                }
                </div>
                <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                  <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                    {treatment_request.treatment_object && treatment_request.treatment_object.description}
                    <span className="float-right">
                    {treatment_request.actual_admin_time ?
                      <OverlayTrigger
                        key={"complete-treatment-request"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-complete-treatment-request`}>
                            All treatment requests are completed.
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                      </OverlayTrigger>
                      : treatment_request.not_administered ?
                      <OverlayTrigger
                        key={"not-administered-treatment-request"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-not-administered-treatment-request`}>
                            Treatment request was not administered.
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faSquareX} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                      </OverlayTrigger>
                      : new Date(treatment_request.suggested_admin_time) <= new Date() ?
                      <OverlayTrigger
                        key={"awaiting-action-treatment-request"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-awaiting-action-treatment-request`}>
                            Treatment request is awaiting action.
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faSquareExclamation} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                      </OverlayTrigger>
                      :
                      <OverlayTrigger
                        key={"scheduled-treatment-request"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-scheduled-treatment-request`}>
                            At least one treatment request is scheduled for a future date/time.
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faSquareEllipsis} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                      </OverlayTrigger>
                      }
                    </span>
                  </div>
                  <Row style={{marginTop:"6px"}}>
                    <Col xs={3}>
                      <b>Patient: </b><Link href={"/" + organization + "/" + incident + "/animals/" + treatment_request.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{treatment_request.animal_object.id}</Link>
                    </Col>
                    <Col xs={3}>
                      <b>Species:</b> <span  style={{textTransform:"capitalize"}}>{treatment_request.animal_object.species_string}</span>
                    </Col>
                    <Col xs={4}>
                      <b>Name: </b>{treatment_request.animal_object.name || "Unknown"}
                    </Col>
                  </Row>
                  <Row>
                    {treatment_request.actual_admin_time ?
                    <Col xs={6}>
                      <b>Administered: </b><Moment format="lll">{treatment_request.actual_admin_time}</Moment>
                    </Col>
                    :
                    <Col xs={6}>
                      <b>Scheduled: </b><Moment format="lll">{treatment_request.suggested_admin_time}</Moment>
                    </Col>
                    }
                    {treatment_request.assignee_object ?
                    <Col xs={4}>
                      <b>Administrator: </b>{treatment_request.assignee_object.first_name} {treatment_request.assignee_object.last_name}
                    </Col>
                    :
                    treatment_request.not_administered ?
                    <Col xs={6}>
                      <b>Administrator: </b>Not Administered
                    </Col> : ""}
                  </Row>
                  <Row>
                    <Col xs={3}>
                      <b>Quantity: </b>{treatment_request.quantity}
                    </Col>
                    <Col xs={3}>
                      <b>Unit: </b>{treatment_request.unit || '-'}
                    </Col>
                    <Col>
                      <b>Route: </b>{treatment_request.route || '-'}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Card>
        </Link>
      </Row>
      ))}
      {vetObject === 'diagnostics' && diagnostics.map(diagnostic => (
        <Row key={diagnostic.id} className="ml-0 mb-3">
          <Link href={"/" + organization + "/" + incident + "/vet/diagnosticresult/edit/" + diagnostic.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
            <Card className="border rounded treatment-hover-div" style={{height:"120px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
              <div className="row no-gutters hover-div treatment-hover-div" style={{height:"120px", marginRight:"-2px"}}>
                <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                  <div className="border-right" style={{width:"120px"}}>
                    {diagnostic.name.toLowerCase().includes('needle') || diagnostic.other_name.toLowerCase().includes('needle') ?
                      <FontAwesomeIcon icon={faSyringe} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                    : diagnostic.name.toLowerCase().includes('istat') || diagnostic.other_name.toLowerCase().includes('istat') ?
                    <span className="fa-layers" style={{marginLeft:"16px"}}>
                      <FontAwesomeIcon icon={faRectangleVertical} size="4x" className="treatment-icon" style={{marginTop:"1px", marginLeft:"5px"}} transform={'shrink-4 down-15 right-4'} inverse />
                      <FontAwesomeIcon icon={faMobileScreenButton} size="5x" className="treatment-icon" style={{marginLeft:""}} transform={'shrink-2 down-6 right-3'} inverse />
                    </span>
                    : diagnostic.name.toLowerCase().includes('culture') || diagnostic.other_name.toLowerCase().includes('culture') ?
                      <FontAwesomeIcon icon={faRing} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"9px"}} transform={'grow-1 right-1'} inverse />
                    : diagnostic.name.toLowerCase().includes('schirmer') || diagnostic.other_name.toLowerCase().includes('schirmer') ?
                      <FontAwesomeIcon icon={faEye} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"9px"}} transform={'grow-1'} inverse />
                    : diagnostic.name.toLowerCase().includes('eye') || diagnostic.other_name.toLowerCase().includes('eye') ?
                      <FontAwesomeIcon icon={faEyeDropper} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"13px"}} transform={'grow-1'} inverse />
                    : diagnostic.name.toLowerCase().includes('ultrasound') || diagnostic.other_name.toLowerCase().includes('ultrasound') ?
                      <span className="fa-layers" style={{marginLeft:"16px"}}>
                        <FontAwesomeIcon icon={faWifi} size="4x" className="treatment-icon" style={{marginTop:"7px", marginLeft:"3px"}} transform={'shrink-1 up-2 right-8 rotate-45'} inverse />
                        <FontAwesomeIcon icon={faPeriod} size="4x" className="fa-move-up" style={{marginLeft:"1px", color:"#303030"}} transform={'down-14 right-15 rotate-145'} inverse />
                        <FontAwesomeIcon icon={faFlashlight} size="5x" className="treatment-icon" transform={'shrink-2 down-14 left-5 rotate-315'} inverse />
                      </span>
                    :
                      <FontAwesomeIcon icon={faVial} size="6x" className="treatment-icon" style={{marginTop:"14px", marginLeft:"16px"}} transform={'grow-2'} inverse />
                    }
                    </div>
                  <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                    <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                      {diagnostic.other_name ? diagnostic.other_name : diagnostic.name}
                      <span className="float-right">
                      {diagnostic.result ?
                        <OverlayTrigger
                          key={"complete-diagnostics"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-complete-diagnostics`}>
                              Diagnostic order is complete.
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                        </OverlayTrigger>
                        :
                        <OverlayTrigger
                          key={"scheduled-diagnostics"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-scheduled-diagnostics`}>
                              Diagnostic order is pending.
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faSquareEllipsis} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                        </OverlayTrigger>
                        }
                      </span>
                    </div>
                    <Row style={{marginTop:"6px"}}>
                      <Col xs={3}>
                        <b>Patient: </b><Link href={"/" + organization + "/" + incident + "/animals/" + diagnostic.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{diagnostic.animal_object.id}</Link>
                      </Col>
                      <Col xs={3}>
                        <b>Species:</b> <span  style={{textTransform:"capitalize"}}>{diagnostic.animal_object.species_string}</span>
                      </Col>
                      <Col xs={4}>
                        <b>Name: </b>{diagnostic.animal_object.name || "Unknown"}
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={3}>
                      <b>Result: </b>{diagnostic.result || 'Pending'}
                      </Col>
                      {diagnostic.complete ?
                      <Col xs={4}>
                        <b>Completed: </b><Moment format="lll">{diagnostic.complete}</Moment>
                      </Col>
                      :
                      <Col xs={4}>
                        <b>Ordered: </b><Moment format="lll">{diagnostic.open}</Moment>
                      </Col>
                      }
                    </Row>
                    <Row>
                      <Col>
                        <b>Notes: </b>{diagnostic.notes || "N/A"}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Card>
          </Link>
        </Row>
      ))}
      {vetObject === 'procedures' && procedures.map(procedure => (
        <Row key={procedure.id} className="ml-0 mb-3">
          <Link href={"/" + organization + "/" + incident + "/vet/procedureresult/edit/" + procedure.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
            <Card className="border rounded treatment-hover-div" style={{height:"120px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
              <div className="row no-gutters hover-div treatment-hover-div" style={{height:"120px", marginRight:"-2px"}}>
                <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                  <div className="border-right" style={{width:"120px"}}>
                    {procedure.name.toLowerCase().includes('bandage') || procedure.other_name.toLowerCase().includes('bandage') || procedure.name.toLowerCase().includes('splint') || procedure.other_name.toLowerCase().includes('splint') ?
                      <FontAwesomeIcon icon={faBandage} size="6x" className="treatment-icon" style={{marginTop:"11px", marginLeft:"3px"}} transform={'shrink-1'} inverse />
                    : procedure.name.toLowerCase().includes('hydro') || procedure.other_name.toLowerCase().includes('hydro') || procedure.name.toLowerCase().includes('water') || procedure.other_name.toLowerCase().includes('water') ?
                      <FontAwesomeIcon icon={faWater} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"9px"}} transform={'grow-1'} inverse />
                    : procedure.name.toLowerCase().includes('eye') || procedure.other_name.toLowerCase().includes('eye') ?
                      <FontAwesomeIcon icon={faEye} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"9px"}} transform={'grow-1'} inverse />
                    : procedure.name.toLowerCase().includes('clean') || procedure.other_name.toLowerCase().includes('clean') ?
                      <FontAwesomeIcon icon={faSoap} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"14px"}} transform={'grow-2'} inverse />
                    :
                      <FontAwesomeIcon icon={faScalpelLineDashed} size="6x" className="treatment-icon" style={{marginTop:"13px", marginLeft:"8px"}} transform={'grow-1'} inverse />
                    }
                    </div>
                  <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                    <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                      {procedure.other_name ? procedure.other_name : procedure.name}
                      <span className="float-right">
                      {procedure.complete ?
                        <OverlayTrigger
                          key={"complete-procedures"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-complete-procedures`}>
                              Procedure order is complete.
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faCheckSquare} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                        </OverlayTrigger>
                        :
                        <OverlayTrigger
                          key={"scheduled-procedures"}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-scheduled-procedures`}>
                              Procedure order is pending.
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon icon={faSquareEllipsis} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                        </OverlayTrigger>
                        }
                      </span>
                    </div>
                    <Row style={{marginTop:"6px"}}>
                      <Col xs={3}>
                        <b>Patient: </b><Link href={"/" + organization + "/" + incident + "/animals/" + procedure.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{procedure.animal_object.id}</Link>
                      </Col>
                      <Col xs={3}>
                        <b>Species:</b> <span  style={{textTransform:"capitalize"}}>{procedure.animal_object.species_string}</span>
                      </Col>
                      <Col xs={4}>
                        <b>Name: </b>{procedure.animal_object.name || "Unknown"}
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={3}>
                      <b>Status: </b>{procedure.complete ? 'Complete' : 'Pending'}
                      </Col>
                      {procedure.complete ?
                      <Col xs={4}>
                        <b>Completed: </b><Moment format="lll">{procedure.complete}</Moment>
                      </Col>
                      :
                      <Col xs={4}>
                        <b>Ordered: </b><Moment format="lll">{procedure.open}</Moment>
                      </Col>
                      }
                    </Row>
                    <Row>
                      <Col>
                        <b>Notes: </b>{procedure.notes || "N/A"}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Card>
          </Link>
        </Row>
      ))}
      <p>{data.isFetching ? 'Fetching veterinary requests...' : <span>{data.vet_requests && data.vet_requests.length ? '' : 'No Veterinary Tasks found.'}</span>}</p>
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
