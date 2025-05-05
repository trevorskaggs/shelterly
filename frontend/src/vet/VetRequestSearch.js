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
  faInfoCircle,
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
  faMobileScreenButton,
  faUserDoctorMessage} from '@fortawesome/pro-solid-svg-icons';
import { faBandage, faRing, faTankWater } from '@fortawesome/pro-regular-svg-icons';
import {
  faRectangleVertical,
} from '@fortawesome/sharp-solid-svg-icons';
import Select from 'react-select';
import Moment from 'react-moment';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { useMark } from '../hooks';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import TreatmentCard from "./components/TreatmentCard";
import DiagnosticCard from './components/DiagnosticCard';
import ProcedureCard from './components/ProcedureCard';
function VetRequestSearch({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    tab = 'vet_requests',
  } = queryParams;

  const priorityText = {urgent:'Urgent (Red)', when_available:'When Available (Yellow)'};
  const labelLookup = {vet_requests:'Veterinary Requests', treatments:'Treatments', diagnostics:'Diagnostics', procedures:'Procedures'};

  const priorityChoices = [
    { value: 'urgent', label: 'Urgent (Red)' },
    { value: 'when_available', label: 'When Available (Yellow)' },
  ];

  const statusChoices = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Canceled', label: 'Canceled' },
  ];

  const treatmentStatusChoices = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' },
  ];

  const orderStatusChoices = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
  ];

  const tooltipDict = {
    'vet_requests': 'id, animal id, animal name, concern, and complaint name',
    'treatments': 'id, treatment name, animal name, assignee first name, and assignee last name',
    'diagnostics': 'id, diagnostic name, and animal name',
    'procedures': 'id, procedure name, animal name, performer first name, and performer last name'
  }

  const [data, setData] = useState({vet_requests:[], treatments:[], diagnostics:[], procedures:[], isFetching:false});
  const [shelters, setShelters] = useState({options:[], isFetching:false});
  const [speciesChoices, setSpeciesChoices] = useState([]);
  const [treatmentChoices, setTreatmentChoices] = useState([]);
  const [diagnosticChoices, setDiagnosticChoices] = useState([]);
  const [procedureChoices, setProcedureChoices] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [treatmentIsDisabled, setTreatmentIsDisabled] = useState(true);
  const [diagnosticIsDisabled, setDiagnosticIsDisabled] = useState(true);
  const [procedureIsDisabled, setProcedureIsDisabled] = useState(true);
  const [vetObject, setVetObject] = useState(tab);
  const tempSearchTerm = useRef(null);
  const treatmentRef = useRef(null);
  const diagnosticRef = useRef(null);
  const procedureRef = useRef(null);
  const speciesRef = useRef(null);
  const treatmentSpeciesRef = useRef(null);
  const diagnosticSpeciesRef = useRef(null);
  const procedureSpeciesRef = useRef(null);
  const statusRef = useRef(null);
  const treatmentStatusRef = useRef(null);
  const diagnosticStatusRef = useRef(null);
  const procedureStatusRef = useRef(null);
  const administratorRef = useRef(null);
  const priorityRef = useRef(null);
  const openerRef = useRef(null);
  const performerRef = useRef(null);
  const openRef = useRef(null);
  const scheduledRef = useRef(null);
  const administeredRef = useRef(null);
  const diagnosticOrderedRef = useRef(null);
  const diagnosticCompleteRef = useRef(null);
  const procedureOrderedRef = useRef(null);
  const procedureCompleteRef = useRef(null);
  const notAdministeredRef = useRef(null);
  const shelterRef = useRef(null);
  const treatmentShelterRef = useRef(null);
  const diagnosticShelterRef = useRef(null);
  const procedureShelterRef = useRef(null);
  const [vetRequests, setVetRequests] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [options, setOptions] = useState({species: '', status:null, priority:null, open:null, assignee:null, shelter: ''});
  const [treatmentOptions, setTreatmentOptions] = useState({species: '', status:null, treatment:'', scheduled:null, administered:null, assignee:null, shelter: '', not_administered:null});
  const [diagnosticOptions, setDiagnosticOptions] = useState({species: '', status:null, diagnostic:'', ordered:null, complete:null, shelter: ''});
  const [procedureOptions, setProcedureOptions] = useState({species: '', status:null, procedure:'', ordered:null, complete:null, performer:null, shelter: ''});
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const { markInstances } = useMark();
  const [tooltip, setTooltip] = useState(tooltipDict['vet_requests']);

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

  function handleApplyFilters(test) {
    if (vetObject === 'vet_requests') {
      const filtered_requests = test.filter(vet_request => options.species ? vet_request.animal_object.species_string.toLowerCase() === options.species.toLowerCase() : vet_request)
        .filter(vet_request => options.status ? vet_request.status === options.status : vet_request)
        .filter(vet_request => options.priority ? vet_request.priority === options.priority : vet_request)
        .filter(vet_request => options.open ? (startDate <= moment(vet_request.open).format('YYYY-MM-DD') && endDate >= moment(vet_request.open).format('YYYY-MM-DD')) : vet_request)
        .filter(vet_request => options.opener ? vet_request.requested_by_object.id === options.opener : vet_request)
        .filter(vet_request => options.shelter && options.shelter !== 'Field' ? vet_request.animal_object.shelter === options.shelter : vet_request)
        .filter(vet_request => options.shelter === 'Field' ? vet_request.animal_object.shelter === null : vet_request);
      setVetRequests(filtered_requests);
      setNumPages(Math.ceil(filtered_requests.length / ITEMS_PER_PAGE));
    }
    else if (vetObject === 'treatments') {
      const filtered_treatments = test.filter(treatment => treatmentOptions.species ? treatment.animal_object.species_string.toLowerCase() === treatmentOptions.species.toLowerCase() : treatment)
        .filter(treatment => treatmentOptions.status ? treatment.status === treatmentOptions.status : treatment)
        .filter(treatment => treatmentOptions.not_administered === true || treatmentOptions.not_administered === false ? treatment.not_administered === treatmentOptions.not_administered : treatment)
        .filter(treatment => treatmentOptions.treatment ? treatment.treatment_object.description === treatmentOptions.treatment : treatment)
        .filter(treatment => treatmentOptions.scheduled ? (startDate <= moment(treatment.suggested_admin_time).format('YYYY-MM-DD') && endDate >= moment(treatment.suggested_admin_time).format('YYYY-MM-DD')) : treatment)
        .filter(treatment => treatmentOptions.administered ? (startDate <= moment(treatment.actual_admin_time).format('YYYY-MM-DD') && endDate >= moment(treatment.actual_admin_time).format('YYYY-MM-DD')) : treatment)
        .filter(treatment => treatmentOptions.assignee ? treatment.assignee_object && treatment.assignee_object.id === treatmentOptions.assignee : treatment)
        .filter(treatment => treatmentOptions.shelter && treatmentOptions.shelter !== 'Field' ? treatment.animal_object.shelter === treatmentOptions.shelter : treatment)
        .filter(treatment => treatmentOptions.shelter === 'Field' ? treatment.animal_object.shelter === null : treatment)
      setTreatments(filtered_treatments);
      setNumPages(Math.ceil(filtered_treatments.length / ITEMS_PER_PAGE));
    }
    else if (vetObject === 'diagnostics') {
      const filtered_diagnostics = test.filter(diagnostic => diagnosticOptions.species ? diagnostic.animal_object.species_string.toLowerCase() === diagnosticOptions.species.toLowerCase() : diagnostic)
        .filter(diagnostic => diagnosticOptions.status ? diagnostic.status === diagnosticOptions.status : diagnostic)
        .filter(diagnostic => diagnosticOptions.diagnostic ? diagnostic.name === diagnosticOptions.diagnostic : diagnostic)
        .filter(diagnostic => diagnosticOptions.ordered ? (startDate <= moment(diagnostic.open).format('YYYY-MM-DD') && endDate >= moment(diagnostic.open).format('YYYY-MM-DD')) : diagnostic)
        .filter(diagnostic => diagnosticOptions.complete ? (startDate <= moment(diagnostic.complete).format('YYYY-MM-DD') && endDate >= moment(diagnostic.complete).format('YYYY-MM-DD')) : diagnostic)
        .filter(diagnostic => diagnosticOptions.shelter && diagnosticOptions.shelter !== 'Field' ? diagnostic.animal_object.shelter === diagnosticOptions.shelter : diagnostic)
        .filter(diagnostic => diagnosticOptions.shelter === 'Field' ? diagnostic.animal_object.shelter === null : diagnostic)
      setDiagnostics(filtered_diagnostics);
      setNumPages(Math.ceil(filtered_diagnostics.length / ITEMS_PER_PAGE));
    }
    else if (vetObject === 'procedures') {
      const filtered_procedures = test.filter(procedure => procedureOptions.species ? procedure.animal_object.species_string.toLowerCase() === procedureOptions.species.toLowerCase() : procedure)
        .filter(procedure => procedureOptions.status ? procedure.status === procedureOptions.status : procedure)
        .filter(procedure => procedureOptions.procedure ? procedure.name === procedureOptions.procedure : procedure)
        .filter(procedure => procedureOptions.ordered ? (startDate <= moment(procedure.open).format('YYYY-MM-DD') && endDate >= moment(procedure.open).format('YYYY-MM-DD')) : procedure)
        .filter(procedure => procedureOptions.complete ? (startDate <= moment(procedure.complete).format('YYYY-MM-DD') && endDate >= moment(procedure.complete).format('YYYY-MM-DD')) : procedure)
        .filter(procedure => procedureOptions.performer ? procedure.performer_object && procedure.performer_object.id === procedureOptions.performer : procedure)
        .filter(procedure => procedureOptions.shelter && procedureOptions.shelter !== 'Field' ? procedure.animal_object.shelter === procedureOptions.shelter : procedure)
        .filter(procedure => procedureOptions.shelter === 'Field' ? procedure.animal_object.shelter === null : procedure)
      setProcedures(filtered_procedures);
      setNumPages(Math.ceil(filtered_procedures.length / ITEMS_PER_PAGE));
    }
  };

   function updateTooltip(search_tab) {
    setTooltip(tooltipDict[search_tab]);
  }

  const handleClear = () => {
    if (vetObject === 'vet_requests') {
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
    }
    else if (vetObject === 'treatments') {
      treatmentRef.current.select.clearValue();
      treatmentSpeciesRef.current.select.clearValue();
      treatmentStatusRef.current.select.clearValue();
      treatmentShelterRef.current.select.clearValue();
      notAdministeredRef.current.select.clearValue();
      administratorRef.current.select.clearValue();
      if (scheduledRef.current) {
        scheduledRef.current.flatpickr.clear();
      }
      if (administeredRef.current) {
        administeredRef.current.flatpickr.clear();
      }
      setTreatmentOptions({species:'', status:null, not_administered:null, treatment:null, scheduled:null, administered:null, assignee:null, shelter:''});
      setTreatments(data.treatments);
    }
    else if (vetObject === 'diagnostics') {
      diagnosticRef.current.select.clearValue();
      diagnosticSpeciesRef.current.select.clearValue();
      diagnosticStatusRef.current.select.clearValue();
      diagnosticShelterRef.current.select.clearValue();
      if (diagnosticOrderedRef.current) {
        diagnosticOrderedRef.current.flatpickr.clear();
      }
      if (diagnosticCompleteRef.current) {
        diagnosticCompleteRef.current.flatpickr.clear();
      }
      setDiagnosticOptions({species:'', status:null, diagnostic:null, ordered:null, complete:null, shelter:''});
      setDiagnostics(data.diagnostics);
    }
    else if (vetObject === 'procedures') {
      procedureRef.current.select.clearValue();
      procedureSpeciesRef.current.select.clearValue();
      procedureStatusRef.current.select.clearValue();
      procedureShelterRef.current.select.clearValue();
      if (procedureOrderedRef.current) {
        procedureOrderedRef.current.flatpickr.clear();
      }
      if (procedureCompleteRef.current) {
        procedureCompleteRef.current.flatpickr.clear();
      }
      setProcedureOptions({species:'', status:null, procedure:null, ordered:null, complete:null, performer:null, shelter:''});
      setProcedures(data.procedures);
    }
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

    const fetchTreatments = () => {
      setTreatmentChoices([]);
      // Fetch Treatment data.
      axios.get('/vet/api/treatment/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let treatment_options = [];
          response.data.forEach(result => {
            // Build treatment option list.
            treatment_options.push({value: result.description, label: result.description});
          });
          setTreatmentChoices(treatment_options);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setTreatmentChoices([]);
          setShowSystemError(true);
        }
      });
    };
    fetchTreatments();

    const fetchDiagnostics = () => {
      setTreatmentChoices([]);
      // Fetch Treatment data.
      axios.get('/vet/api/diagnostics/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let diagnostic_options = [];
          response.data.forEach(result => {
            // Build diagnostic option list.
            diagnostic_options.push({value: result.name, label: result.name});
          });
          setDiagnosticChoices(diagnostic_options);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setDiagnosticChoices([]);
          setShowSystemError(true);
        }
      });
    };
    fetchDiagnostics();

    const fetchProcedures = () => {
      setProcedureChoices([]);
      // Fetch Procedure data.
      axios.get('/vet/api/procedures/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let procedure_options = [];
          response.data.forEach(result => {
            // Build procedure option list.
            procedure_options.push({value: result.name, label: result.name});
          });
          setProcedureChoices(procedure_options);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setProcedureChoices([]);
          setShowSystemError(true);
        }
      });
    };
    fetchProcedures();

    const fetchShelters = () => {
      setShelters({options: [], isFetching: true});
      // Fetch Shelter data.
      axios.get('/shelter/api/shelter/?incident=' + incident + '&organization=' + organization +'&training=' + (state && state.incident.training), {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let shelter_options = [];
          response.data.forEach(shelter => {
            // Build shelter option list.
            shelter_options.push({value: shelter.id, label: shelter.name});
          });
          shelter_options.push({value: 'Field', label: 'Field'});
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

    setData(prevState => ({ ...prevState, "isFetching":true }));

    const fetchVetRequests = async () => {
      // Fetch VetRequest data.
      await axios.get('/vet/api/vetrequest/?search=' + searchTerm + '&incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.filter(vr => vr.status === options.status).length / ITEMS_PER_PAGE));
          setData(prevState => ({ ...prevState, "vet_requests":response.data, isFetching:false }));
          handleApplyFilters(response.data);

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
          setNumPages(Math.ceil(response.data.filter(treatment => treatment.status === treatmentOptions.status).length / ITEMS_PER_PAGE));
          setData(prevState => ({ ...prevState, "treatments":response.data, isFetching:false }));
          handleApplyFilters(response.data);
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
          setNumPages(Math.ceil(response.data.filter(diagnostic => diagnostic.status === diagnosticOptions.status).length / ITEMS_PER_PAGE));
          setData(prevState => ({ ...prevState, "diagnostics":response.data, isFetching:false }));
          handleApplyFilters(response.data);
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
          setNumPages(Math.ceil(response.data.filter(procedure => procedure.status === procedureOptions.status).length / ITEMS_PER_PAGE));
          setData(prevState => ({ ...prevState, "procedures":response.data, isFetching:false }));
          handleApplyFilters(response.data);
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
      setTreatmentIsDisabled(!(treatmentOptions.species || treatmentOptions.status || treatmentOptions.treatment || treatmentOptions.scheduled || treatmentOptions.administered || treatmentOptions.assignee || (treatmentOptions.not_administered === true || treatmentOptions.not_administered === false) || treatmentOptions.shelter));
      setDiagnosticIsDisabled(!(diagnosticOptions.species || diagnosticOptions.status || diagnosticOptions.diagnostic || diagnosticOptions.ordered || diagnosticOptions.complete || diagnosticOptions.shelter));
      setProcedureIsDisabled(!(procedureOptions.species || procedureOptions.status || procedureOptions.procedure || procedureOptions.ordered || procedureOptions.complete || treatmentOptions.performer || procedureOptions.shelter));
    };

    handleDisabled();
  }, [options, treatmentOptions, diagnosticOptions, procedureOptions]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Veterinary Tasks</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-1">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            onChange={handleChange}
            ref={tempSearchTerm}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit" style={{height:"36px", borderRadius:"0 5px 5px 0", color:"white"}}>Search
              <OverlayTrigger
                key={"search-information"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-search-information`}>
                    Searchable fields: {tooltip}.
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} className="ml-1 fa-move-up" size="sm" inverse />
              </OverlayTrigger>
            </Button>
          </InputGroup.Append>
          <Col className="pl-2 pr-1" style={{maxWidth:"200px"}}>
          <Select
            id="typeDropdown"
            name="vetType"
            type="text"
            options={[{value:'vet_requests', label:'Veterinary Requests'}, {value:'treatments', label:'Treatments'}, {value:'diagnostics', label:'Diagnostics'}, {value:'procedures', label:'Procedures'}]}
            styles={customStyles}
            isClearable={false}
            onChange={(instance) => {
              setVetObject(instance.value);
              updateTooltip(instance.value);
            }}
            defaultValue={{value:tab, label:labelLookup[tab]}}
          />
          </Col>
          <Button variant="outline-light" className="ml-1" onClick={handleShowFilters} style={{height:"36px", color:"white"}}>Advanced {showFilters ? <FontAwesomeIcon icon={faChevronDoubleUp} className="fa-move-up" size="sm" /> : <FontAwesomeIcon icon={faChevronDoubleDown} className="fa-move-up" size="sm" />}</Button>
        </InputGroup>
        {vetObject === 'vet_requests' ? <Collapse in={showFilters} className="mb-3">
          <div>
          <Card className="border rounded d-flex" style={{width:"100%"}}>
            <Card.Body>
              <Row style={{marginBottom:"-16px"}}>
                <Col xs={"5"}>
                  <Select
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
                    value={options.status ? {value:options.status, label:options.status} : null}
                  />
                  <Select
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
                    value={options.priority ? {value:options.priority, label:priorityText[options.priority]} : null}
                  />
                  <Select
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
                    value={options.opener ? assignees.options.filter(assignee => assignee.value === options.opener)[0] : null}
                  />
                </Col>
                <Col xs="5">
                  <Row>
                    <Col className="pl-0 pr-0 mb-3 mr-3" style={{textTransform:"capitalize"}}>
                      <Select
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
                        value={options.species ? {value:options.species, label:options.species} : null}
                      />
                      <Select
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
                        value={options.shelter ? shelters.options.filter(shelter => shelter.value === options.shelter)[0] : null}
                      />
                      <Flatpickr
                        options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                        style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                        name={`open`}
                        id={`open`}
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
                  <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={(e) => {handleApplyFilters(data.vet_requests)}} disabled={isDisabled}>Apply</Button>
                  <Button variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          </div>
        </Collapse>
        : vetObject === 'treatments' ? <Collapse in={showFilters} className="mb-3">
        <div>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Row style={{marginBottom:"-16px"}}>
              <Col xs={"5"}>
                <Select
                  id="treatmentStatusDropdown"
                  name="treatmentStatus"
                  type="text"
                  placeholder="Select Status"
                  options={treatmentStatusChoices}
                  styles={customStyles}
                  isClearable={true}
                  ref={treatmentStatusRef}
                  onChange={(instance) => {
                    setTreatmentOptions({...treatmentOptions, status: instance ? instance.value : null});
                  }}
                  value={treatmentOptions.status ? {value:treatmentOptions.status, label:treatmentOptions.status} : null}
                />
                <Select
                  id="treatmentDropdown"
                  name="treatment"
                  type="text"
                  placeholder="Select Treatment"
                  options={treatmentChoices}
                  styles={customStyles}
                  isClearable={true}
                  ref={treatmentRef}
                  onChange={(instance) => {
                    setTreatmentOptions({...treatmentOptions, treatment: instance ? instance.value : ''})
                  }}
                  value={treatmentOptions.treatment ? {value:treatmentOptions.treatment, label:treatmentOptions.treatment} : null}
                />
                <Select
                  id="notAdministeredDropdown"
                  name="notAdministered"
                  type="text"
                  placeholder="Select Not Administered"
                  options={[{value:true, label:"True"},{value:false, label:'False'}]}
                  styles={customStyles}
                  isClearable={true}
                  ref={notAdministeredRef}
                  onChange={(instance) => {
                    setTreatmentOptions({...treatmentOptions, not_administered : instance ? instance.value : null});
                  }}
                  value={treatmentOptions.not_administered === true || treatmentOptions.not_administered === false ? {value:treatmentOptions.not_administered, label:treatmentOptions.not_administered === true ? 'True' : 'False'} : null}
                />
                <Select
                  id="administratorDropdown"
                  name="administrator"
                  type="text"
                  placeholder="Select Administrator"
                  options={assignees.options}
                  styles={customStyles}
                  isClearable={true}
                  ref={administratorRef}
                  onChange={(instance) => {
                    setTreatmentOptions({...treatmentOptions, assignee: instance ? instance.value : null});
                  }}
                  value={treatmentOptions.assignee ? assignees.options.filter(assignee => assignee.value === treatmentOptions.assignee)[0] : null}
                />
              </Col>
              <Col xs="5">
                <Row>
                  <Col className="pl-0 pr-0 mb-3 mr-3" style={{textTransform:"capitalize"}}>
                    <Select
                      id="treatmentSpeciesDropdown"
                      name="treatmentSpecies"
                      type="text"
                      placeholder="Select Species"
                      options={speciesChoices}
                      styles={customStyles}
                      isClearable={true}
                      ref={treatmentSpeciesRef}
                      onChange={(instance) => {
                        setTreatmentOptions({...treatmentOptions, species: instance ? instance.value : null});
                      }}
                      value={treatmentOptions.species ? {value:treatmentOptions.species, label:treatmentOptions.species} : null}
                    />
                    <Select
                      id="treatmentShelterDropdown"
                      name="treatmentShelter"
                      type="text"
                      placeholder="Select Shelter"
                      options={shelters.options}
                      styles={customStyles}
                      isClearable={true}
                      ref={treatmentShelterRef}
                      onChange={(instance) => {
                        setTreatmentOptions({...treatmentOptions, shelter: instance ? instance.value : ''})
                      }}
                      value={treatmentOptions.shelter ? shelters.options.filter(shelter => shelter.value === treatmentOptions.shelter)[0] : null}
                    />
                    <Flatpickr
                      options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                      style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                      name={`scheduled`}
                      id={`scheduled`}
                      placeholder={"Select Scheduled Date Range"}
                      ref={scheduledRef}
                      className="w-100"
                      onChange={(dateRange) => {
                        if (dateRange) {
                          parseDateRange(dateRange);
                        }
                        setTreatmentOptions({...treatmentOptions, scheduled: dateRange ? true : null});
                      }}
                    />
                    <Flatpickr
                      options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                      style={{height:"36px", marginTop:"12px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                      name={`administered`}
                      id={`administered`}
                      placeholder={"Select Administered Date Range"}
                      ref={administeredRef}
                      className="w-100"
                      onChange={(dateRange) => {
                        if (dateRange) {
                          parseDateRange(dateRange);
                        }
                        setTreatmentOptions({...treatmentOptions, administered: dateRange ? true : null});
                      }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col className="flex-grow-1 pl-0" xs="2">
                <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={(e) => {handleApplyFilters(data.treatments)}} disabled={treatmentIsDisabled}>Apply</Button>
                <Button variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        </div>
      </Collapse>
      : vetObject === 'diagnostics' ?
      <Collapse in={showFilters} className="mb-3">
      <div>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Row style={{marginBottom:"-16px"}}>
              <Col xs={"5"}>
                <Select
                  id="diagnosticStatusDropdown"
                  name="diagnosticStatus"
                  type="text"
                  placeholder="Select Status"
                  options={orderStatusChoices}
                  styles={customStyles}
                  isClearable={true}
                  ref={diagnosticStatusRef}
                  onChange={(instance) => {
                    setDiagnosticOptions({...diagnosticOptions, status: instance ? instance.value : null});
                  }}
                  value={diagnosticOptions.status ? {value:diagnosticOptions.status, label:diagnosticOptions.status} : null}
                />
                {/* <Select
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
                    setDiagnosticOptions({...diagnosticOptions, opener: instance ? instance.value : null});
                  }}
                  value={diagnosticOptions.opener ? {value:diagnosticOptions.opener, label:diagnosticOptions.opener} : null}
                /> */}
                <Select
                  id="diagnosticDropdown"
                  name="diagnostic"
                  type="text"
                  placeholder="Select Diagnostic"
                  options={diagnosticChoices}
                  styles={customStyles}
                  isClearable={true}
                  ref={diagnosticRef}
                  onChange={(instance) => {
                    setDiagnosticOptions({...diagnosticOptions, diagnostic: instance ? instance.value : ''})
                  }}
                  value={diagnosticOptions.diagnostic ? {value:diagnosticOptions.diagnostic, label:diagnosticOptions.diagnostic} : null}
                />
                <Flatpickr
                  options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                  style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                  name={`diagnosticComplete`}
                  id={`diagnosticComplete`}
                  placeholder={"Select Completed Date Range"}
                  ref={diagnosticCompleteRef}
                  className="w-100"
                  onChange={(dateRange) => {
                    if (dateRange) {
                      parseDateRange(dateRange);
                    }
                    setDiagnosticOptions({...diagnosticOptions, complete: dateRange ? true : null});
                  }}
                />
              </Col>
              <Col xs="5">
                <Row>
                  <Col className="pl-0 pr-0 mb-3 mr-3" style={{textTransform:"capitalize"}}>
                    <Select
                      id="diagnosticSpeciesDropdown"
                      name="diagnosticSpecies"
                      type="text"
                      placeholder="Select Species"
                      options={speciesChoices}
                      styles={customStyles}
                      isClearable={true}
                      ref={diagnosticSpeciesRef}
                      onChange={(instance) => {
                        setDiagnosticOptions({...diagnosticOptions, species: instance ? instance.value : null});
                      }}
                      value={diagnosticOptions.species ? {value:diagnosticOptions.species, label:diagnosticOptions.species} : null}
                    />
                    <Select
                      id="diagnosticShelterDropdown"
                      name="diagnosticShelter"
                      type="text"
                      placeholder="Select Shelter"
                      options={shelters.options}
                      styles={customStyles}
                      isClearable={true}
                      ref={diagnosticShelterRef}
                      onChange={(instance) => {
                        setDiagnosticOptions({...diagnosticOptions, shelter: instance ? instance.value : ''})
                      }}
                      value={diagnosticOptions.shelter ? shelters.options.filter(shelter => shelter.value === diagnosticOptions.shelter)[0] : null}
                    />
                    <Flatpickr
                      options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                      style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                      name={`diagnosticOpen`}
                      id={`diagnosticOpen`}
                      placeholder={"Select Ordered Date Range"}
                      ref={diagnosticOrderedRef}
                      className="w-100"
                      onChange={(dateRange) => {
                        if (dateRange) {
                          parseDateRange(dateRange);
                        }
                        setDiagnosticOptions({...diagnosticOptions, ordered: dateRange ? true : null});
                      }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col className="flex-grow-1 pl-0" xs="2">
                <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={(e) => {handleApplyFilters(data.diagnostics)}} disabled={diagnosticIsDisabled}>Apply</Button>
                <Button variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        </div>
      </Collapse> : vetObject === 'procedures' ?
      <Collapse in={showFilters} className="mb-3">
      <div>
        <Card className="border rounded d-flex" style={{width:"100%"}}>
          <Card.Body>
            <Row style={{marginBottom:"-16px"}}>
              <Col xs={"5"} className="mb-3">
                <Select
                  id="statusDropdown"
                  name="procedureStatus"
                  type="text"
                  placeholder="Select Status"
                  options={orderStatusChoices}
                  styles={customStyles}
                  isClearable={true}
                  ref={procedureStatusRef}
                  onChange={(instance) => {
                    setProcedureOptions({...procedureOptions, status: instance ? instance.value : null});
                  }}
                  value={procedureOptions.status ? {value:procedureOptions.status, label:procedureOptions.status} : null}
                />
                <Select
                  id="procedureDropdown"
                  name="procedure"
                  type="text"
                  placeholder="Select Procedure"
                  options={procedureChoices}
                  styles={customStyles}
                  isClearable={true}
                  ref={procedureRef}
                  onChange={(instance) => {
                    setProcedureOptions({...procedureOptions, procedure: instance ? instance.value : ''})
                  }}
                  value={procedureOptions.procedure ? {value:procedureOptions.procedure, label:procedureOptions.procedure} : null}
                />
                <Select
                  id="performerDropdown"
                  name="performer"
                  type="text"
                  placeholder="Select Performer"
                  options={assignees.options}
                  styles={customStyles}
                  isClearable={true}
                  ref={performerRef}
                  onChange={(instance) => {
                    setProcedureOptions({...procedureOptions, performer: instance ? instance.value : null});
                  }}
                  value={procedureOptions.performer ? assignees.options.filter(assignee => assignee.value === procedureOptions.performer)[0] : null}
                />
                <Flatpickr
                  options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                  style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                  name={`procedureComplete`}
                  id={`procedureComplete`}
                  placeholder={"Select Completed Date Range"}
                  ref={procedureCompleteRef}
                  className="w-100"
                  onChange={(dateRange) => {
                    if (dateRange) {
                      parseDateRange(dateRange);
                    }
                    setProcedureOptions({...procedureOptions, complete: dateRange ? true : null});
                  }}
                />
              </Col>
              <Col xs="5">
                <Row>
                  <Col className="pl-0 pr-0 mr-3" style={{textTransform:"capitalize"}}>
                    <Select
                      id="speciesDropdown"
                      name="species"
                      type="text"
                      placeholder="Select Species"
                      options={speciesChoices}
                      styles={customStyles}
                      isClearable={true}
                      ref={procedureSpeciesRef}
                      onChange={(instance) => {
                        setProcedureOptions({...procedureOptions, species: instance ? instance.value : null});
                      }}
                      value={procedureOptions.species ? {value:procedureOptions.species, label:procedureOptions.species} : null}
                    />
                    <Select
                      id="shelterDropdown"
                      name="shelter"
                      type="text"
                      placeholder="Select Shelter"
                      options={shelters.options}
                      styles={customStyles}
                      isClearable={true}
                      ref={procedureShelterRef}
                      onChange={(instance) => {
                        setProcedureOptions({...procedureOptions, shelter: instance ? instance.value : ''})
                      }}
                      value={procedureOptions.shelter ? shelters.options.filter(shelter => shelter.value === procedureOptions.shelter)[0] : null}
                    />
                    <Flatpickr
                      options={{allowInput: true, altFormat: "F j, Y", dateFormat: "m-d-Y", mode: "range", maxDate: moment().format('MM-DD-YYYY')}}
                      style={{height:"36px", paddingLeft:"11px", borderRadius:".25rem", borderWidth:"1px", borderStyle:"solid"}}
                      name={`procedureOrdered`}
                      id={`procedureOrdered`}
                      placeholder={"Select Ordered Date Range"}
                      ref={procedureOrderedRef}
                      className="w-100"
                      onChange={(dateRange) => {
                        if (dateRange) {
                          parseDateRange(dateRange);
                        }
                        setProcedureOptions({...procedureOptions, ordered: dateRange ? true : null});
                      }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col className="flex-grow-1 pl-0" xs="2">
                <Button className="btn btn-primary" style={{maxHeight:"35px", width:"100%"}} onClick={(e) => {handleApplyFilters(data.procedures)}} disabled={procedureIsDisabled}>Apply</Button>
                <Button variant="outline-light" style={{maxHeight:"35px", width:"100%", marginTop:"15px"}} onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        </div>
      </Collapse> : ""}
      </Form>
      {vetObject === 'vet_requests' && vetRequests.map((vet_request, index) => (
      <Row key={vet_request.id} className="ml-0 mb-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
        <Link href={"/" + organization + "/" + incident + "/vet/vetrequest/" + vet_request.id} className="treatment-link" style={{textDecoration:"none", color:"white"}}>
          <Card className="border rounded treatment-hover-div" style={{height:"120px", width:"845px", whiteSpace:"nowrap", overflow:"hidden"}}>
            <div className="row no-gutters hover-div treatment-hover-div" style={{height:"120px", marginRight:"-2px"}}>
              <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                <div className="border-right" style={{width:"120px"}}>
                  <FontAwesomeIcon icon={faUserDoctorMessage} size="5x" className="treatment-icon" style={{marginTop:"21px", marginLeft:"14px"}} transform={'grow-1'} inverse />
                </div>
                <Col style={{marginLeft:"-5px", marginRight:"-25px"}} className="hover-div">
                  <div className="border treatment-hover-div" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"rgb(158 153 153)"}}>
                    VR#{vet_request.id} - {priorityText[vet_request.priority]}
                    <span className="float-right">
                    {vet_request.status === 'Closed' ?
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
                      : vet_request.status === 'Canceled' ?
                      <OverlayTrigger
                        key={"not-administered-treatment-request"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-not-administered-treatment-request`}>
                            Treatment request was canceled.
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faSquareX} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                      </OverlayTrigger>
                      :
                      <OverlayTrigger
                        key={"awaiting-action-treatment-request"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-awaiting-action-treatment-request`}>
                            Treatment request is pending action.
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faSquareExclamation} size="3x" className="ml-1 treatment-icon" style={{marginTop:"-13px", marginRight:"-3px"}} transform={'shrink-2'} inverse />
                      </OverlayTrigger>
                      }
                    </span>
                  </div>
                  <Row style={{marginTop:"6px"}}>
                    <Col xs={3}>
                      <b>Patient: </b>A#{vet_request.animal_object.id_for_incident}
                    </Col>
                    <Col xs={3}>
                      <b>Species:</b> <span  style={{textTransform:"capitalize"}}>{vet_request.animal_object.species_string}</span>
                    </Col>
                    <Col xs={6}>
                      <b>Name: </b>{vet_request.animal_object.name || "Unknown"}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={3}>
                      <b>Opened: </b><Moment format="MMM DD, HH:mm">{vet_request.open}</Moment>
                    </Col>
                    <Col xs={3}>
                      <b>Opener: </b>{vet_request.requested_by_object.first_name} {vet_request.requested_by_object.last_name}
                    </Col>
                    <Col xs={6}>
                      <b>Location: </b>{vet_request.animal_object.shelter_object ? <span>{vet_request.animal_object.shelter_object.name} {vet_request.animal_object.room_name ? <span> - {vet_request.animal_object.room_name}</span> : ""}</span> : "Field"}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <b>Complaints: </b>{vet_request.complaints_text}
                    </Col>
                    {/* <Col xs={3}>
                      <b>Unit: </b>{vet_request.unit || '-'}
                    </Col>
                    <Col>
                      <b>Route: </b>{vet_request.route || '-'}
                    </Col> */}
                  </Row>
                </Col>
              </Row>
            </div>
          </Card>
        </Link>
      </Row>
      ))}
      {vetObject === 'treatments' && treatments.map((treatment_request, index) => (
        <TreatmentCard key={treatment_request.id} incident={incident} organization={organization} treatment_request={treatment_request} animal_object={treatment_request.animal_object} />
      ))}
      {vetObject === 'diagnostics' && diagnostics.map((diagnostic, index) => (
        <DiagnosticCard key={diagnostic.id} incident={incident} organization={organization} diagnostic={diagnostic} animal_object={diagnostic.animal_object} />
      ))}
      {vetObject === 'procedures' && procedures.map((procedure, index) => (
        <ProcedureCard key={procedure.id} incident={incident} organization={organization} procedure={procedure} animal_object={procedure.animal_object} />
      ))}
      {data.isFetching ? <p>{'Fetching ' + (vetObject === 'vet_requests' ? 'veterinary requests' : vetObject === 'treatments' ? 'treatments' : vetObject === 'diagnostics' ? 'diagnostics' : 'procedures') + '...'}</p> : ""}
      {!data.isFetching && vetObject === 'vet_requests' && vetRequests.length === 0 ? <p>No veterinary requests found.</p> : ""}
      {!data.isFetching && vetObject === 'treatments' && treatments.length === 0 ? <p>No treatments found.</p> : ""}
      {!data.isFetching && vetObject === 'diagnostics' && diagnostics.length === 0 ? <p>No diagnostics found.</p> : ""}
      {!data.isFetching && vetObject === 'procedures' && procedures.length === 0 ? <p>No procedures found.</p> : ""}
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
