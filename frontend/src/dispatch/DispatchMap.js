import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Form, Formik } from 'formik';
import { Button, Col, Form as BootstrapForm, FormCheck, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faBandAid, faBullseye, faCalendarDay, faCar, faCheckCircle, faChevronDown, faChevronUp, faEquals, faExclamationTriangle, faCircle, faClipboardList, faExclamationCircle, faMapMarkedAlt, faQuestionCircle, faPencilAlt, faPlusSquare, faTrailer, faUserAlt, faUserAltSlash, faExclamation, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faBarsSort, faChevronDoubleDown, faChevronDoubleUp, faCircleBolt, faHomeAlt, faLocationCrosshairs, faRotate } from '@fortawesome/pro-solid-svg-icons';
import { faHomeAlt as faHomeAltReg } from '@fortawesome/pro-regular-svg-icons';
import { Circle, Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import { useDateRange } from '../hooks';
import * as Yup from 'yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import Moment from 'react-moment';
import moment from 'moment';
import useWebSocket from 'react-use-websocket';
import Map, { countMatches, prettyText, reportedMarkerIcon, reportedEvacMarkerIcon, reportedSIPMarkerIcon, SIPMarkerIcon, UTLMarkerIcon, checkMarkerIcon, operationsMarkerIcon } from "../components/Map";
import { Checkbox, DateRangePicker, Radio, TextInput } from "../components/Form";
import { DispatchDuplicateSRModal, DispatchAlreadyAssignedTeamModal } from "../components/Modals";
import Scrollbar from '../components/Scrollbars';
import Header from '../components/Header';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'leaflet/dist/leaflet.css';
import { capitalize } from '../utils/formatString';
import { priorityChoices } from '../constants';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

function Deploy({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  const openStartRef = useRef(null);
  const openEndRef = useRef(null);

  const [data, setData] = useState({service_requests: [], isFetching: true, bounds:L.latLngBounds([[0,0]])});
  const [newData, setNewData] = useState(false);
  const [mapState, setMapState] = useState({});
  const [bounds, setBounds] = useState([]);
  const [totalSelectedState, setTotalSelectedState] = useState({'ANIMALLESS':{}, 'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}});
  const [selectedCount, setSelectedCount] = useState({count:0, disabled:true});
  const [statusOptions, setStatusOptions] = useState({aco_required:false});
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [teamData, setTeamData] = useState({teams: [], members:[], options: [], isFetching: false});
  const [selected, setSelected] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [assignedTeamMembers, setAssignedTeamMembers] = useState([]);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const handleCloseShowAddTeamMember = () => setShowAddTeamMember(false);
  const [sortChoice, setSortChoice] = useState('followup_date');
  const [filterData, setFilterData] = useState({priority:[], species:[], followup_date_start:null, followup_date_end:null});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const handleCloseSortModal = () => setShowSortModal(false);
  const [showDispatchDuplicateSRModal, setShowDispatchDuplicateSRModal] = useState(false);
  const [duplicateSRs, setDuplicateSRs] = useState([]);
  const handleCloseDispatchDuplicateSRModal = () => {setDuplicateSRs([]);setShowDispatchDuplicateSRModal(false);}
  const [showAlreadyAssignedTeamModal, setShowAlreadyAssignedTeamModal] = useState(false);
  const handleCloseAlreadyAssignedTeamModal = () => {setDuplicateSRs([]);setShowAlreadyAssignedTeamModal(false);}
  const [proceed, setProceed] = useState(false);
  const [speciesChoices, setSpeciesChoices] = useState([]);

  const priorityText = {1:'Urgent', 2:'High', 3:'Medium', 4:'Low', 5:'Lowest'};

  // Handle aco_required toggle.
  const handleACO = async event => {
    setStatusOptions(prevState => ({ ...prevState, aco_required:!statusOptions.aco_required }));
  }

  // Handle hide_pending toggle.
  // const handlePendingOnly = async event => {
  //   setStatusOptions(prevState => ({ ...prevState, hide_pending:!statusOptions.hide_pending }));
  // }

  // Handle radius circle toggles.
  const handleRadius = (id) => {
    if (mapState[id].radius === "disabled") {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], "radius":"enabled"} }));
    }
    else {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], "radius":"disabled"} }));
    }
  }

  // Handle TeamMember selector onChange.
  const handleChange = (values, props) => {
    let id_list = [];
    let selected_list = [];
    values.forEach(value => {
      id_list = [...id_list, ...value.id];
      // Handle if Team.
      if (value.label.split(':').length > 1) {
        setSelectedTeam(value.da_id);
        selected_list.push({id:value.id, da_id:value.da_id, label:value.label, is_assigned:value.is_assigned});
      }
      // Else handle as an individual TeamMember.
      else {
        setSelectedTeam(null);
        selected_list.push({id:value.id, da_id:value.da_id, label:value.label, is_assigned:value.is_assigned});
      }
    });

    // If deselecting.
    if (selected.length > selected_list.length) {
      let team_options = [];
      setSelectedTeam(null);
      // Add back teams if the select list is empty.
      if (selected_list.length === 0) {
        let team_names = [];
        teamData.teams.forEach(function(team) {
          // Add selectable options back if if not already available.
          if (team.team_object.team_members.length && !team_names.includes(team.team_name) && !teamData.options.some(option => option.da_id === team.id)) {
            team_options.unshift({id:team.team_object.team_members, da_id:team.id, label:"DA#" + team.id_for_incident + " (" + team.team_object.name + "): " + team.team_object.display_name, is_assigned:team.team_object.is_assigned});
            team_names.push(team.team_name);
          }
        });
      }
      teamData.members.forEach(function(member) {
        // Add selectable options back if if not already available.
        team_options.push({id:[member.id], da_id:null, label:member.display_name, is_assigned:member.is_assigned});
      });
      setTeamData(prevState => ({ ...prevState, "options":team_options }));
      setSelectedCount((prevState) => ({...prevState, disabled: (prevState.count > 0 ? false : true)}));
    }
    // Else we're selecting. Remove selection from option list.
    else {
      // Remove other options if we've selected a team.
      if (values.filter(value => value.label.includes(':')).length) {
        setTeamData(prevState => ({ ...prevState, "options":[] }));
      }
      else {
        setTeamData(prevState => ({ ...prevState, "options":teamData.options.filter(option => (!id_list.includes(option.id[0])) && (option.da_id === null)) }));
      }
    }
    props.setFieldValue('team_members', id_list);
    setSelected(selected_list);
  }

  // Handle reselecting after hitting dupe assigned SR error.
  const handleReselect = async event => {
    // Perform API update for most recent data and clean out the duplicate SRs.
    setTriggerRefresh(!triggerRefresh)
    setMapState(Object.keys(mapState).filter(key => !duplicateSRs.includes(key))
      .reduce((obj, key) => {
        obj[key] = mapState[key];
        return obj;
      }, {})
    );
    setDuplicateSRs([]);
    setShowDispatchDuplicateSRModal(false);
  }

  // Handle dynamic SR state and map display when an SR is selected or deselected.
  const handleMapState = (id) => {
    var status_matches = {};
    var matches = {};
    var total = 0;

    // If selected.
    if (mapState[id].checked === false) {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], "checked":true} }));

      // Add each match count to the running total state tracker.
      for (var select_status in mapState[id].status_matches) {
        matches = {...totalSelectedState[select_status]};
        for (var select_key in mapState[id].status_matches[select_status]){
          if (!totalSelectedState[select_status][select_key]) {
            total = mapState[id].status_matches[select_status][select_key];
          } else {
            total = totalSelectedState[select_status][select_key] += mapState[id].status_matches[select_status][select_key];
          }
          matches[select_key] = total;
        }
        status_matches[select_status] = matches;
      }
      setTotalSelectedState(Object.assign(totalSelectedState, status_matches));
      // Enable DEPLOY button.
      setSelectedCount((prevState) => ({count: prevState.count + 1, disabled: false}));
    }
    // Else deselect.
    else {
      setMapState(prevState => ({ ...prevState, [id]: {...prevState[id], "checked":false} }));
      // Remove matches from the running total state tracker.
      for (var status in mapState[id].status_matches) {
        matches = {...totalSelectedState[status]};
        for (var key in mapState[id].status_matches[status]) {
          total = totalSelectedState[status][key] -= mapState[id].status_matches[status][key];
          if (total === 0) {
            delete matches[key]
          }
          else {
            matches[key] = total;
          }
        }
        status_matches[status] = matches;
      }
      setTotalSelectedState(Object.assign(totalSelectedState, status_matches));
      // Disable DEPLOY button is none selected.
      var disabled = false;
      if (selectedCount.count-1 === 0) {
        disabled = true;
      }
      setSelectedCount((prevState) => ({count: prevState.count - 1, disabled: disabled}))
    }
  }

  // Show or hide list of SRs based on current map zoom
  const onMove = event => {
    let tempMapState = {...mapState};
    for (const service_request of data.service_requests) {
      if (mapState[service_request.id]) {
        if (!event.target.getBounds().contains(L.latLng(service_request.latitude, service_request.longitude))) {
          tempMapState[service_request.id].hidden=true;
        }
        else {
          tempMapState[service_request.id].hidden=false;
        }
      }
    }
    setMapState(tempMapState);
  }

  const isFollowupDateBeforeToday = (followupDate) => {
  if (!followupDate) return false; // Handle undefined or null dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to the start of the day for accurate comparison
  const followupDateObj = new Date(followupDate);

  return followupDateObj < today;
};

  // Locally working websocket connection.
  // TODO: bring back?
  // useWebSocket('ws://' + window.location.host.replace('localhost:3000', 'localhost:8000') + '/ws/map_data/', {
  //   onMessage: (e) => {
  //     setNewData(true)
  //   },
  //   shouldReconnect: (closeEvent) => true,
  // });

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
            species_options.push({value: result.name, label: capitalize(result.name)});
          });
          setSpeciesChoices(species_options);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchSpecies();

    const fetchTeamMembers = async () => {
      setTeamData({teams: [], options: [], isFetching: true});
      // Fetch all TeamMembers.
      await axios.get('/evac/api/evacteammember/?incident=' + incident + '&organization=' + organization +'&training=' + state.incident.training, {
        cancelToken: source.token,
      })
      .then(async (memberResponse) => {
        if (!unmounted) {
          let options = [];
          let team_names = [];
          memberResponse.data.filter(teammember => teammember.show === true).forEach(function(teammember) {
            options.push({id:[teammember.id], da_id:null, label:teammember.display_name, is_assigned:teammember.is_assigned})
          });
          setAssignedTeamMembers(memberResponse.data.filter(teammember => teammember.is_assigned === true).map(teammember => teammember.id))
          // Then fetch all recent Teams.
          let dispatch_assignments = [];
          let nextUrl = '/evac/api/evacassignment/?page=1&page_size=100';
          do {
            const response = await axios.get(nextUrl, {
              params: {
                deploy_map: true,
                status: 'active',
                incident,
                organization,
              },
              cancelToken: source.token,
            })
            .catch(error => {
              if (error.response) {
                setShowSystemError(true);
              }
            });

            response.data.results.forEach(function(da) {
              // Only add to option list if team has members and team name isn't already in the list.
              if (da.team_object.team_member_objects.length && !team_names.includes(da.team_object.name)) {
                options.unshift({id:da.team_object.team_members, da_id:da.id, label:"DA#" + da.id_for_incident + " (" + da.team_object.name + "): " + da.team_object.display_name, is_assigned:da.team_object.is_assigned});
                team_names.push(da.team_object.name);
              }
            });
            dispatch_assignments.push(...response.data.results);
            nextUrl = response.data.next;
            if (nextUrl) {
              nextUrl = '/evac/' + response.data.next.split('/evac/')[1];
            }
          } while(nextUrl != null)
          setTeamData({teams:dispatch_assignments, members:memberResponse.data, options:options, isFetching:false});
        }
      })
    };

    const fetchServiceRequests = async () => {
      setData({...data, isFetching: true});
      let service_requests = [];
      const map_dict = {...mapState};
      let bounds_copy = [...bounds];
      let nextUrl = '/hotline/api/servicerequests/?page=1&page_size=100&incident=' + incident + '&organization=' + organization;
      if (!unmounted) {
        do {
          const response = await axios.get(nextUrl, {
            params: {
            status: 'open',
            landingmap: true
          },
            cancelToken: source.token,})
          .catch(error => {
            setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
            if (error.response) {
              setShowSystemError(true);
            }
          });
          const current_ids = Object.keys(mapState);
          for (const service_request of response.data.results) {
            // Only add initial settings if we don't already have them.
            if (!current_ids.includes(String(service_request.id))) {
              if (Object.keys(mapState).length >= 1) {
                setNewData(true);
                setTimeout(() => {
                  setNewData(false);
                }, 3000);
              }
              const total_matches = countMatches(service_request.animals);
              const matches = total_matches[0];
              const status_matches = service_request.animals.length ? total_matches[1] : {'ANIMALLESS':{animalless:1}};
              const color = service_request.reported_animals > 0 ? '#ff4c4c' : service_request.unable_to_locate > 0 ? '#5f5fff' : '#f5ee0f';
              map_dict[service_request.id] = {checked:false, hidden:false, color:color, matches:matches, status_matches:status_matches, radius:"disabled", latitude:service_request.latitude, longitude:service_request.longitude};
              bounds_copy.push([service_request.latitude, service_request.longitude]);
            }
          }
          service_requests.push(...response.data.results);
          nextUrl = response.data.next;
          if (nextUrl) {
            nextUrl = '/hotline/' + response.data.next.split('/hotline/')[1];
          }
        } while(nextUrl != null)

        setData(prevState => ({ ...prevState, service_requests: service_requests, isFetching: false}));
        setMapState(map_dict);
        setBounds(bounds_copy);

        var status_matches = {'ANIMALLESS':{}, 'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}};
        var matches = {};
        var total = 0;
        // Recount the total state tracker for selected SRs on refresh.
        Object.keys(map_dict).filter(key => map_dict[key].checked === true && service_requests.map(sr => sr.id).includes(Number(key))).forEach(id => {
          for (var select_status in map_dict[id].status_matches) {
            matches = {...status_matches[select_status]};
            for (var select_key in map_dict[id].status_matches[select_status]){
              if (!status_matches[select_status][select_key]) {
                total = map_dict[id].status_matches[select_status][select_key];
              } else {
                total = status_matches[select_status][select_key] += map_dict[id].status_matches[select_status][select_key];
              }
              matches[select_key] = total;
            }
            status_matches[select_status] = matches;
          }
        })
        setTotalSelectedState(status_matches);

        if (bounds_copy.length > 0) {
          setData(prevState => ({ ...prevState, "bounds":L.latLngBounds(bounds_copy) }));
        }
      }
      // })
    };

    // Only fetch team member data first time.
    // or after triggering a refresh
    if (teamData.options.length === 0 || triggerRefresh) {
      fetchTeamMembers();
    }

    fetchServiceRequests();
    setNewData(false);

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [triggerRefresh, incident]);

  return (
    <Formik
      initialValues={{
        da_id: selectedTeam,
        team_members: [],
        service_requests: [],
        incident: state.incident.id,
        incident_slug: incident,
        organization_slug: organization,
      }}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        // Check if assigned team members have been submitted.
        if (!proceed && values.team_members.filter(teammember => (assignedTeamMembers.includes(teammember))).map(teammember => teammember).length > 0) {
          setShowAlreadyAssignedTeamModal(true);
        }
        else {
          values.service_requests = Object.keys(mapState).filter(key => mapState[key].checked === true);
          // Remove duplicate assignments from POST values.
          if (duplicateSRs.length > 0) {
            values.service_requests = values.service_requests.filter(sr_id => !duplicateSRs.includes(sr_id));
          }
          setTimeout(() => {
            if (selectedTeam) {
              let promises = [];
              values.service_requests.forEach((sr_id) => {
                promises.push(axios.patch('/evac/api/evacassignment/' + selectedTeam + '/', {new_service_request:sr_id}));
              });
              Promise.all(promises).then(async (results) => {
                navigate('/' + organization + '/' + incident + '/dispatch/summary/' + results[0].data.id_for_incident);
              })
              .catch(error => {
                setShowSystemError(true);
              });
            }
            else {
              axios.post('/evac/api/evacassignment/', values)
              .then(response => {
                navigate('/' + organization + "/" + incident + '/dispatch/summary/' + response.data.id_for_incident);
                // Historical Active vs Preplan Logic.
                // Stay on map and remove selected SRs if in Preplanning mode.
                // if (values.team_members.length === 0 && selectedCount.count > 0) {
                //   setSelectedCount({count:0, disabled:true});
                //   const newState = {...mapState};
                //   values.service_requests.forEach(sr => {
                //     delete newState[sr];
                //   })
                //   setMapState(newState);
                //   resetForm();
                //   setTriggerRefresh(!triggerRefresh);
                // }
                // // Otherwise navigate to the DA Summary page.
                // else {
                //   navigate('/' + organization + "/" + incident + '/dispatch/summary/' + response.data.id_for_incident);
                // }
              })
              .catch(error => {
                if (error.response.data && error.response.data[0].includes('Duplicate assigned service request error')) {
                  setDuplicateSRs(error.response.data[1]);
                  setShowDispatchDuplicateSRModal(true);
                }
                else {
                  setShowSystemError(true);
                }
              });
            }
            setSubmitting(false);
          }, 500);
        }
      }}
    >
    {props => (
      <Form>
        <Header>
          Deploy Teams&nbsp;
          <OverlayTrigger
            key={"new-data"}
            placement="bottom"
            overlay={
              <Tooltip id={`tooltip-new-data`}>
                {"Refresh service request data."}
              </Tooltip>
            }
          >
            <span className="d-inline-block">
              <Button className="fa-move-up" onClick={() => setTriggerRefresh(!triggerRefresh)} disabled={data.isFetching || newData} style={{width:"40px"}}>
                <FontAwesomeIcon icon={newData ? faExclamation : faRotate} />
              </Button>
            </span>
          </OverlayTrigger>
        </Header>
        <hr/>
        <Row className="d-flex flex-wrap" style={{marginTop:"10px", marginLeft:"0px", marginRight:"0px"}}>
          <Col xs={2} className="border rounded">
          <Scrollbar no_shadow="true" style={{height:"50vh", marginLeft:"-15px", marginRight:"-15px", right:"-5px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            <h4 className="text-center mt-1 mr-1">Selected</h4><hr style={{marginTop:"-5px", marginBottom:"-5px", marginLeft:"10px", marginRight:"20px"}} />
            {Object.keys(totalSelectedState["ANIMALLESS"]).length > 0 ? <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px", marginLeft:"8px", marginRight:"18px", marginBottom:"-4px"}}>
              <p className="mb-2" style={{marginTop:"-5px"}}>Operations
                <OverlayTrigger
                  key={"selected-animal-less"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-selected-animal-less`}>
                      Operations
                    </Tooltip>
                  }
                >
                  <span className="fa-layers ml-1 mr-1">
                    <FontAwesomeIcon icon={faCircle} color="grey" />
                    <FontAwesomeIcon icon={faLocationCrosshairs} className="icon-border" color="white" />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["ANIMALLESS"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[0], totalSelectedState["ANIMALLESS"][key])}</div>
              ))}
            </div> : ""}
            {Object.keys(totalSelectedState["REPORTED"]).length > 0 ? <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px", marginLeft:"8px", marginRight:"18px", marginBottom:"-4px"}}>
              <p className="mb-2" style={{marginTop:"-5px"}}>Reported
                <OverlayTrigger
                  key={"selected-reported"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-selected-reported`}>
                      Reported
                    </Tooltip>
                  }
                >
                  <span className="fa-layers ml-1 mr-1">
                    <FontAwesomeIcon icon={faCircle} color="white" />
                    <FontAwesomeIcon icon={faExclamationCircle} className="icon-border" color="#ff4c4c" />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["REPORTED"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[0], totalSelectedState["REPORTED"][key])}</div>
              ))}
            </div> : ""}
            {Object.keys(totalSelectedState["REPORTED (EVAC REQUESTED)"]).length > 0 ? <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px", marginLeft:"8px", marginRight:"18px", marginBottom:"-4px"}}>
              <p className="mb-2" style={{marginTop:"-5px", marginLeft:"-4px", marginRight:"-4px"}}>Reported (Evac)
                <OverlayTrigger
                  key={"selected-reported-evac"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-selected-reported-evac`}>
                      Reported - (Evacuation)
                    </Tooltip>
                  }
                >
                  <span className="fa-layers ml-1">
                    <FontAwesomeIcon icon={faCircle} color="white" />
                    <FontAwesomeIcon icon={faCircleBolt} className="icon-border" color="#ff4c4c" transform={'grow-2'} />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["REPORTED (EVAC REQUESTED)"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[0], totalSelectedState["REPORTED (EVAC REQUESTED)"][key])}</div>
              ))}
            </div> : ""}
            {Object.keys(totalSelectedState["REPORTED (SIP REQUESTED)"]).length > 0 ? <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px", marginLeft:"8px", marginRight:"18px", marginBottom:"-4px"}}>
              <p className="mb-2" style={{marginTop:"-5px"}}>Reported (SIP)
                <OverlayTrigger
                  key={"selected-reported-sip"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-selected-reported-sip`}>
                      Reported - (Sheltered In Place)
                    </Tooltip>
                  }
                >
                  <span className="fa-layers ml-1" >
                    <FontAwesomeIcon icon={faCircle} className="icon-border" color="#ff4c4c" transform={'grow-2'} />
                    <FontAwesomeIcon icon={faHomeAlt} style={{color:"white"}} transform={'shrink-4 left-1'} inverse />
                    <FontAwesomeIcon icon={faHomeAltReg} style={{color:"#444"}} transform={'shrink-3 left-1'} inverse />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["REPORTED (SIP REQUESTED)"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[0], totalSelectedState["REPORTED (SIP REQUESTED)"][key])}</div>
              ))}
            </div> : ""}
            {Object.keys(totalSelectedState["SHELTERED IN PLACE"]).length > 0 ? <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px", marginLeft:"8px", marginRight:"18px", marginBottom:"-4px"}}>
              <p className="mb-2" style={{marginTop:"-5px"}}>SIP
                <OverlayTrigger
                  key={"selected-sip"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-selected-sip`}>
                      Sheltered In Place
                    </Tooltip>
                  }
                >
                  <span className="fa-layers ml-1" >
                    <FontAwesomeIcon icon={faCircle} className="icon-border" color="#f5ee0f" transform={'grow-2'} />
                    <FontAwesomeIcon icon={faHomeAlt} style={{color:"white"}} transform={'shrink-3 left-1'} inverse />
                    <FontAwesomeIcon icon={faHomeAltReg} style={{color:"#444"}} transform={'shrink-3 left-1'} inverse />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["SHELTERED IN PLACE"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[0], totalSelectedState["SHELTERED IN PLACE"][key])}</div>
              ))}
            </div> : ""}
            {Object.keys(totalSelectedState["UNABLE TO LOCATE"]).length > 0 ? <div className="card-header border rounded mt-3 mb-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px", marginLeft:"8px", marginRight:"18px", marginBottom:"-4px"}}>
              <p className="mb-2" style={{marginTop:"-5px"}}>UTL
                <OverlayTrigger
                  key={"selected-utl"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-selected-utl`}>
                      Unable To Locate
                    </Tooltip>
                  }
                >
                  <span className="fa-layers ml-1 mr-1">
                    <FontAwesomeIcon icon={faCircle} className="fa-move-up icon-border" color="white" />
                    <FontAwesomeIcon icon={faQuestionCircle} className="fa-move-up icon-border" color="#5f5fff" />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["UNABLE TO LOCATE"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[0], totalSelectedState["UNABLE TO LOCATE"][key])}</div>
              ))}
            </div> : ""}
          </Scrollbar>
          </Col>
          <Col xs={10} className="border rounded pl-0 pr-0">
            <Map style={{marginRight:"0px"}} bounds={data.bounds} onMoveEnd={onMove}>
              {teamData.teams.filter(evac => evac.id === selectedTeam).length && teamData.teams.filter(evac => evac.id === selectedTeam)[0].service_request_objects.map(service_request => (
                <Marker
                  key={service_request.id}
                  position={[service_request.latitude, service_request.longitude]}
                  icon={checkMarkerIcon}
                  // onClick={() => handleMapState(service_request.id)}
                  zIndexOffset={1000}
                >
                  <MapTooltip autoPan={false}>
                    <span>
                      SR#{service_request.id_for_incident}: {service_request.full_address}
                      {/* {mapState[service_request.id] ?
                        <span>
                          <br />
                          {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                            <span key={key} style={{textTransform:"capitalize"}}>
                              {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[service_request.id].matches[key])}
                            </span>
                          ))}
                          {Object.keys(mapState[service_request.id].matches).length === 0 ? "0 Animals" : ""}
                        </span>
                      :""} */}
                      <div>{service_request.animal_count || 0} Animal{service_request.animal_count === 1 ? "" : "s"}</div>
                      {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                      <div>
                      {service_request.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                      {service_request.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                      {service_request.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                      {service_request.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" className="mr-1" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                      </div>
                    </span>
                  </MapTooltip>
                </Marker>
              ))}
              {data.service_requests
              .filter(service_request => statusOptions.aco_required ? service_request.aco_required === statusOptions.aco_required : true)
              // .filter(service_request => statusOptions.hide_pending ? service_request.pending !== statusOptions.hide_pending : true)
              .filter(service_request => filterData.priority.length ? filterData.priority.includes(service_request.priority) : true)
              .filter(service_request => filterData.species.length ? filterData.species.some(species => new Set(service_request.animals.filter(animal => ['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'UNABLE TO LOCATE' , 'SHELTERED IN PLACE'].includes(animal.status)).map(animal => animal.species_string)).has(species)) : true)
              .filter(service_request => filterData.followup_date_start ? moment(service_request.followup_date).format('YYYY-MM-DD') >= filterData.followup_date_start : true)
              .filter(service_request => filterData.followup_date_end ? moment(service_request.followup_date).format('YYYY-MM-DD') <= filterData.followup_date_end : true)
              .map(service_request => (
                <span key={service_request.id}> {mapState[service_request.id] ? 
                  <Marker
                    position={[service_request.latitude, service_request.longitude]}
                    icon={mapState[service_request.id] && mapState[service_request.id].checked ? checkMarkerIcon : service_request.reported_animals > 0 ? reportedMarkerIcon : service_request.reported_evac > 0 ? reportedEvacMarkerIcon : service_request.reported_sheltered_in_place > 0 ? reportedSIPMarkerIcon : service_request.sheltered_in_place > 0 ? SIPMarkerIcon : service_request.unable_to_locate ? UTLMarkerIcon : operationsMarkerIcon}
                    onClick={() => handleMapState(service_request.id)}
                    zIndexOffset={mapState[service_request.id].checked ? 1000 : 0}
                  >
                    <MapTooltip autoPan={false}>
                      <span>
                        SR#{service_request.id_for_incident}: {service_request.full_address}
                        {mapState[service_request.id] ?
                          <span>
                            <br />
                            {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                              <span key={key} style={{textTransform:"capitalize"}}>
                                {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[service_request.id].matches[key])}
                              </span>
                            ))}
                            {Object.keys(mapState[service_request.id].matches).length === 0 ? "0 Animals" : ""}
                          </span>
                        :""}
                        {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                        <div>
                        {service_request.aco_required ? <img width={16} height={16} src="/static/images/badge-sheriff.png" alt="ACO Required" className="mr-1" /> : ""}
                        {service_request.injured ? <img width={16} height={16} src="/static/images/band-aid-solid.png" alt="Injured" className="mr-1" /> : ""}
                        {service_request.accessible ? <img width={16} height={16} src="/static/images/car-solid.png" alt="Accessible" className="mr-1" /> : <img width={16} height={16} src="/static/images/car-ban-solid.png" alt="Not Acessible" className="mr-1" />}
                        {service_request.turn_around ? <img width={16} height={16} src="/static/images/trailer-solid.png" alt="Turn Around" className="mr-1" /> : <img width={16} height={16} src="/static/images/trailer-ban-solid.png" alt="No Turn Around" className="mr-1" />}
                        </div>
                      </span>
                    </MapTooltip>
                  </Marker> : ""}
                </span>
              ))}
              {Object.entries(mapState).filter(([key, value]) => value.radius === "enabled").map(([key, value]) => (
                <Circle key={key} center={{lat:value.latitude, lng: value.longitude}} color={value.color} radius={805} interactive={false} />
              ))}
            </Map>
          </Col>
        </Row>
        <Row className="ml-0 mr-0 border rounded" style={{marginTop:"-1px"}}>
          <Col xs={2} className="pl-0 pr-0" style={{marginLeft:"-1px", marginRight:"1px"}}>
            <Button type="submit" className="btn-block mt-auto border" disabled={selectedCount.count === 0}>{selectedTeam ? "ASSIGN" : props.values.team_members.length > 0 ? "DEPLOY" : selectedCount.count > 0 ? "PREPLAN" : "DEPLOY/PREPLAN"}</Button>
          </Col>
          {/* <Col className="pl-0 pr-0 ml-1" style={{maxWidth:"170px"}}>
            <div className="card-header border rounded text-center" style={{height:"37px", marginLeft:"-6px", marginRight:"-11px", paddingTop:"6px", whiteSpace:"nowrap"}}>
              <span style={{marginLeft:"-12px"}}>{props.values.team_name || teamName}
                {!preplan ? <OverlayTrigger
                  key={"edit-team-name"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-edit-team-name`}>
                      Update team name
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faPencilAlt} className="ml-1" style={{cursor:'pointer'}} onClick={() => setShow(true)} />
                </OverlayTrigger> : ""}
              </span>
            </div>
          </Col> */}
          <Col style={{marginLeft:"-1px", paddingLeft:"0px", paddingRight:"4px"}}>
              <Typeahead
                id="team_members"
                multiple
                onChange={(values) => handleChange(values, props)}
                selected={selected}
                options={teamData.options}
                placeholder="Choose team members..."
                style={{height:"20px"}}
                className="map-typeahead"
                renderMenuItemChildren={(option) => (
                  <div>
                    {option.label} {option.is_assigned ? <FontAwesomeIcon icon={faExclamationTriangle} size="sm" /> : ""}
                  </div>
                )}
              />
          </Col>
          <Col className="pr-0" style={{maxWidth:"31px", paddingLeft:"2px"}}>
            {selectedTeam ?
            <OverlayTrigger
              key={"add-team-member-disabled"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-add-team-member-disabled`}>
                  Cannot add new team members when a team is selected.
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faPlusSquare} className="ml-1" size="lg" transform="grow-18 down-6" style={{cursor:"not-allowed", color:'#b4b4b4'}} inverse />
            </OverlayTrigger>
            : <OverlayTrigger
              key={"add-team-member"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-add-team-member`}>
                  Add a new team member
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faPlusSquare} className="ml-1" size="lg" transform="grow-18 down-6" onClick={() => setShowAddTeamMember(true)} style={{cursor:"pointer"}} inverse />
            </OverlayTrigger>}
          </Col>
        </Row>
        <Row className="d-flex flex-wrap" style={{marginTop:"-1px", marginRight:"-23px", marginLeft:"6px", minHeight:"36vh", paddingRight:"14px"}}>
          <Col xs={2} className="d-flex flex-column pl-0 pr-0" style={{marginLeft:"-7px", marginRight:"-2px", height:"277px"}}>
            <div className="card-header border rounded pl-3 pr-3" style={{height:"100%"}}>
              <h5 className="mb-0 text-center">Options
              {filterData.species.length > 0 || filterData.priority.length > 0 || filterData.followup_date_start || filterData.followup_date_end ?
                <OverlayTrigger
                  key={"filtered"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-filtered`}>
                      Filtered options
                    </Tooltip>
                  }
                >
                  <span className="fa-layers" onClick={() => {setShowFilterModal(true)}} style={{cursor:"pointer"}}>
                    <FontAwesomeIcon icon={faFilter} className="ml-1" />
                    <FontAwesomeIcon icon={faCheckCircle} size="sm" className="fa-inverse" transform={'shrink-4 down-3 right-9'} inverse />
                  </span>
                </OverlayTrigger>
              :
                <OverlayTrigger
                  key={"filter"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-filter`}>
                      Filter options
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faFilter} className="ml-1" onClick={() => {setShowFilterModal(true)}} style={{cursor:"pointer", marginRight:"-4px"}} />
                </OverlayTrigger>
              }
              <OverlayTrigger
                key={"sort"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-sort`}>
                    Sort options
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faBarsSort} onClick={() => {setShowSortModal(true)}} style={{cursor:"pointer", marginLeft:"11px"}} transform={'grow-3'} />
              </OverlayTrigger>
              </h5>
              <hr/>
              <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.aco_required} onChange={handleACO} />
            </div>
          </Col>
          <Col xs={10} className="border rounded" style={{marginLeft:"1px", height:"277px", overflowY:"auto", paddingRight:"-1px"}}>
            <Scrollbar no_shadow="true" style={{height:"275px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              {data.service_requests
              .filter(service_request => statusOptions.aco_required ? service_request.aco_required === statusOptions.aco_required : true)
              // .filter(service_request => statusOptions.hide_pending ? service_request.pending !== statusOptions.hide_pending : true)
              .filter(service_request => filterData.priority.length ? filterData.priority.includes(service_request.priority) : true)
              .filter(service_request => filterData.species.length ? filterData.species.some(species => new Set(service_request.animals.filter(animal => ['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'UNABLE TO LOCATE' , 'SHELTERED IN PLACE'].includes(animal.status)).map(animal => animal.species_string)).has(species)) : true)
              .filter(service_request => filterData.followup_date_start ? moment(service_request.followup_date).format('YYYY-MM-DD') >= filterData.followup_date_start : true)
              .filter(service_request => filterData.followup_date_end ? moment(service_request.followup_date).format('YYYY-MM-DD') <= filterData.followup_date_end : true)
              .sort((a, b) => {
                // Sort by followup_date
                if (sortChoice === 'followup_date') {
                  if (!a.followup_date && b.followup_date) return 1; // `a` is null, move it to the bottom
                  if (a.followup_date && !b.followup_date) return -1; // `b` is null, move it to the bottom
                  if (a.followup_date && b.followup_date) {
                    const dateA = new Date(a.followup_date);
                    const dateB = new Date(b.followup_date);
                    if (dateA - dateB !== 0) return dateA - dateB;
                  }

                  // Compare priority (ascending order)
                  if ((a.priority || 0) - (b.priority || 0) !== 0) return (a.priority || 0) - (b.priority || 0);

                  // Compare pk (ascending order)
                  return (a.id || 0) - (b.id || 0);
                }
                else {
                  // Compare priority (ascending order)
                  if ((a.priority || 0) - (b.priority || 0) !== 0) return (a.priority || 0) - (b.priority || 0);

                  if (!a.followup_date && b.followup_date) return 1; // `a` is null, move it to the bottom
                  if (a.followup_date && !b.followup_date) return -1; // `b` is null, move it to the bottom
                  if (a.followup_date && b.followup_date) {
                    const dateA = new Date(a.followup_date);
                    const dateB = new Date(b.followup_date);
                    if (dateA - dateB !== 0) return dateA - dateB;
                  }

                  // Compare pk (ascending order)
                  return (a.id || 0) - (b.id || 0);
                }
              })
              .map(service_request => (
                <span key={service_request.id}>{mapState[service_request.id] && (mapState[service_request.id].checked || !mapState[service_request.id].hidden) ?
                <div className="mt-1 mb-1" style={{}}>
                  <div className="card-header rounded">
                    <Checkbox
                      id={String(service_request.id)}
                      name={String(service_request.id)}
                      checked={mapState[service_request.id] ? mapState[service_request.id].checked : false}
                      style={{
                        transform: "scale(1.25)",
                        marginLeft: "-14px",
                        marginTop: "-5px",
                        marginBottom: "-5px"
                      }}
                      onChange={() => handleMapState(service_request.id)}
                    />
                    {mapState[service_request.id] ?
                    <span>
                      {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[service_request.id].matches[key])}
                        </span>
                      ))}
                    </span>
                    : ""}
                    {Object.keys(mapState[service_request.id].matches).length === 0 ? "0 Animals" : ""}
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
                      <FontAwesomeIcon icon={faExclamationCircle} className="ml-1"/>
                    </OverlayTrigger>
                    : ""}
                    {service_request.reported_evac > 0 ?
                    <OverlayTrigger
                      key={"reported-evac"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-reported-evac`}>
                          {service_request.reported_evac} animal{service_request.reported_evac > 1 ? "s are":" is"} reported (evac requested)
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faCircleBolt} className="ml-1"/>
                    </OverlayTrigger>
                    : ""}
                    {service_request.reported_sheltered_in_place > 0 ?
                    <OverlayTrigger
                      key={"reported-sip"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-reported-sip`}>
                          {service_request.reported_sheltered_in_place} animal{service_request.reported_sheltered_in_place > 1 ? "s are":" is"} reported (sip requested)
                        </Tooltip>
                      }
                    >
                      <span className="fa-layers ml-1">
                        <FontAwesomeIcon icon={faCircle} transform={'grow-1'} />
                        <FontAwesomeIcon icon={faHomeAlt} style={{color:"#444"}} transform={'shrink-3'} size="sm" inverse />
                      </span>
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
                      <span className="fa-layers ml-1">
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
                      <FontAwesomeIcon icon={faQuestionCircle} className="ml-1"/>
                    </OverlayTrigger>
                    : ""}
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
                        <FontAwesomeIcon icon={faChevronDoubleUp} className="ml-1"/>
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
                        <FontAwesomeIcon icon={faChevronUp} className="ml-1"/>
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
                        <FontAwesomeIcon icon={faEquals} className="ml-1"/>
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
                        <FontAwesomeIcon icon={faChevronDown} className="ml-1"/>
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
                        <FontAwesomeIcon icon={faChevronDoubleDown} className="ml-1"/>
                      </OverlayTrigger>
                    : ""}
                    {service_request.aco_required ?
                    <OverlayTrigger
                      key={"aco"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-aco`}>
                          ACO required
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faBadgeSheriff} className="ml-1"/>
                    </OverlayTrigger>
                    : ""}
                    {service_request.injured ?
                    <OverlayTrigger
                      key={"injured"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-injured`}>
                          Injured animal
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faBandAid} className="ml-1"/>
                    </OverlayTrigger>
                    : ""}
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
                        <FontAwesomeIcon icon={faCar} className="ml-1 fa-move-down" />
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
                      <span className="fa-layers ml-1">
                        <FontAwesomeIcon icon={faCar} className="fa-move-down" />
                        <FontAwesomeIcon icon={faBan} color="#ef5151" />
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
                      <FontAwesomeIcon icon={faTrailer} className="ml-1" style={{marginRight:"-3px"}} />
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
                        <FontAwesomeIcon icon={faTrailer} />
                        <FontAwesomeIcon icon={faBan} color="#ef5151" transform={'right-1'} />
                      </span>
                    </OverlayTrigger>
                    }
                    {service_request.directions ?
                    <OverlayTrigger
                      key={"directions"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-directions`}>
                          {service_request.directions}
                        </Tooltip>
                      }
                    >
                      <span className="fa-layers" style={{marginLeft:"7px", marginRight:"-5px"}}>
                        <FontAwesomeIcon icon={faClipboardList} />
                      </span>
                    </OverlayTrigger>
                    : ""}
                    <span className="ml-2">|
                    &nbsp;<Link href={"/" + organization +"/" + incident + "/hotline/servicerequest/" + service_request.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>SR#{service_request.id_for_incident}</Link>
                    {service_request.followup_date ? <span style={{color: isFollowupDateBeforeToday(service_request.followup_date) ? 'rgb(255 76 76)' : 'white'}}> (
                      {/* <OverlayTrigger
                      key={"followup-date"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-followup-date`}>
                          Followup date
                        </Tooltip>
                      }
                    ><FontAwesomeIcon icon={faCalendarDay} className="fa-move-up" size="sm" /></OverlayTrigger>:  */}
                    <Moment format="MM/DD/YY">{service_request.followup_date}</Moment>)</span> : ""} - {service_request.full_address}</span>
                    <OverlayTrigger
                      key={"radius-toggle"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-radius-toggle`}>
                          Toggle 1 mile radius
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faBullseye} color={mapState[service_request.id].radius === "enabled" ? "red" : ""} className="ml-1 mr-1" style={{cursor:'pointer'}} onClick={() => handleRadius(service_request.id)} />
                    </OverlayTrigger>
                    {/* {service_request.followup_date ?
                    <OverlayTrigger
                      key={"followup-date"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-followup-date`}>
                          Followup date:&nbsp;<Moment format="L">{service_request.followup_date}</Moment>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
                    </OverlayTrigger> : ""} */}
                    {service_request.owner_objects.length === 0 ?
                      <OverlayTrigger
                        key={"stray"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-stray`}>
                            No owner
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faUserAltSlash} className="mr-1" size="sm" />
                      </OverlayTrigger> :
                      <OverlayTrigger
                        key={"stray"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-stray`}>
                            {service_request.owner_objects.map(owner => (
                              <div key={owner.id}>Owner: {owner.first_name} {owner.last_name}</div>
                            ))}
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faUserAlt} className="mr-1" size="sm" />
                      </OverlayTrigger>
                    }
                    <OverlayTrigger
                      key={"add-to-dispatch"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-add-to-dispatch`}>
                          Assign service request to a dispatch assignment
                        </Tooltip>
                      }
                    >
                      <Link href={"/" + organization +"/" + incident + "/hotline/servicerequest/" + service_request.id_for_incident + "/assign"}><FontAwesomeIcon icon={faMapMarkedAlt} inverse /></Link>
                    </OverlayTrigger>
                  </div>
                </div>
                : ""}
                </span>
              ))}
              <div className="card-header mt-1 mb-1 rounded" hidden={data.service_requests.length > 0}>
                No open Service Requests found.
              </div>
            </Scrollbar>
          </Col>
        </Row>
        <DispatchDuplicateSRModal dupe_list={data.service_requests.filter(sr => duplicateSRs.includes(String(sr.id)))} sr_list={data.service_requests.filter(sr => mapState[sr.id] && mapState[sr.id].checked === true)} show={showDispatchDuplicateSRModal} handleClose={handleCloseDispatchDuplicateSRModal} handleSubmit={props.handleSubmit} handleReselect={handleReselect} />
        <DispatchAlreadyAssignedTeamModal team_members={props.values.team_members} team_options={selected} setProceed={setProceed} show={showAlreadyAssignedTeamModal} handleClose={handleCloseAlreadyAssignedTeamModal} handleSubmit={props.handleSubmit} />
        <Modal show={showFilterModal} onHide={handleCloseFilterModal}>
          <Modal.Header closeButton>
            <Modal.Title>Filter Options</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>Priority</label>
            <Typeahead
              id="priority"
              multiple
              onChange={(values) => {setFilterData((prevState) => ({...prevState, priority:values.map(option => option.value)}))}}
              options={priorityChoices}
              placeholder="Choose priorities..."
              className="priority-typeahead mb-3"
              selected={priorityChoices.filter(choice => filterData.priority.includes(choice.value))}
            />
            <label>Species</label>
            <Typeahead
              id="species"
              multiple
              onChange={(values) => {setFilterData((prevState) => ({...prevState, species:values.map(option => option.value)}))}}
              options={speciesChoices}
              placeholder="Choose species..."
              className="species-typeahead mb-3"
              selected={speciesChoices.filter(choice => filterData.species.includes(choice.value))}
            />
            <label>Followup Date</label>
            <Row>
              <Col>
                <DateRangePicker
                  name={`start_date_range_picker`}
                  id={`start_date_range_picker`}
                  placeholder={"Filter by Start Date"}
                  style={{height:"35px", marginRight:"-10px"}}
                  mode="single"
                  data-enable-time={false}
                  clearable={"true"}
                  ref={openStartRef}
                  onChange={(dateRange) => {
                    setStartDate(dateRange);
                    if (dateRange.length) {
                      let parsedDateRange = dateRange.toString().split(',');
                      let start_date = moment(parsedDateRange[0]).format('YYYY-MM-DD');
                      setFilterData((prevState) => ({...prevState, followup_date_start:start_date}))
                    } else {
                      setFilterData((prevState) => ({...prevState, followup_date_start:null}))
                    }
                  }}
                  value={startDate}
                />
              </Col>
              <Col>
                <DateRangePicker
                  name={`end_date_range_picker`}
                  id={`end_date_range_picker`}
                  placeholder={"Filter by End Date"}
                  style={{height:"35px", marginLeft:"-10px"}}
                  mode="single"
                  data-enable-time={false}
                  clearable={"true"}
                  ref={openEndRef}
                  onChange={(dateRange) => {
                    setEndDate(dateRange);
                    if (dateRange.length) {
                      let parsedDateRange = dateRange.toString().split(',');
                      let end_date = moment(parsedDateRange[0]).format('YYYY-MM-DD');
                      setFilterData((prevState) => ({...prevState, followup_date_end:end_date}))
                    } else {
                      setFilterData((prevState) => ({...prevState, followup_date_end:null}))
                    }
                  }}
                  value={endDate}
                />
              </Col>
            </Row>
            {/* <TextInput
              label="Team Name"
              id="temp_team_name"
              name="temp_team_name"
              type="text"
            /> */}
            {/* {error ? <div style={{ color: "#e74c3c", marginTop: "-8px", marginLeft: "16px", fontSize: "80%" }}>{error}</div> : ""} */}
          </Modal.Body>
          <Modal.Footer>
            {/* <Button variant="primary" onClick={() => applyFilters()}>Save</Button> */}
            <Button variant="secondary" onClick={handleCloseFilterModal}>Close</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={showSortModal} onHide={handleCloseSortModal}>
          <Modal.Header closeButton>
            <Modal.Title>Sort Options</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div><label>Primary Sort Method</label></div>
            <Radio
              inline
              id="primary-sort-followup-date"
              label="Followup Date"
              onClick={() => {setSortChoice('followup_date')}}
              checked={sortChoice === 'followup_date' ? true : false}
            />
            <Radio
              inline
              id="primary-sort-priority"
              label="Priority"
              style={{marginLeft:"50px"}}
              onClick={() => {setSortChoice('priority')}}
              checked={sortChoice === 'priority' ? true : false}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseSortModal}>Close</Button>
          </Modal.Footer>
        </Modal>
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            phone: '',
            agency_id: '',
            incident: state ? state.incident.id : 'undefined',
          }}
          enableReinitialize={true}
          validationSchema={Yup.object({
            first_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            last_name: Yup.string()
              .max(50, 'Must be 50 characters or less')
              .required('Required'),
            phone: Yup.string()
              .matches(phoneRegex, "Phone number is not valid")
              .required('Required'),
            agency_id: Yup.string()
              .max(20, 'Must be 20 characters or less'),
          })}
          onSubmit={(values, { resetForm }) => {
            axios.post('/evac/api/evacteammember/', values)
            .then(response => {
              let selected_list = [...selected];
              selected_list.push({id:[response.data.id], label:response.data.first_name + " " + response.data.last_name + (response.data.agency_id ? " (" + response.data.agency_id + ")" : ""), is_assigned:false})
              setSelected(selected_list);
              props.setFieldValue('team_members', [...props.values.team_members, response.data.id]);
              setSelectedCount((prevState) => ({...prevState, disabled:selectedCount.count > 0 ? false : true}));
              handleCloseShowAddTeamMember();
              resetForm();
            })
            .catch(error => {
              setShowSystemError(true);
            });
          }}
        >
          {formikProps => (
            <Modal show={showAddTeamMember} onHide={handleCloseShowAddTeamMember}>
              <Modal.Header closeButton>
                <Modal.Title>Add Team Member</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <BootstrapForm>
                  <BootstrapForm.Row>
                    <TextInput
                      type="text"
                      label="First Name*"
                      name="first_name"
                      id="first_name"
                      xs="6"
                    />
                    <TextInput
                      type="text"
                      label="Last Name*"
                      name="last_name"
                      id="last_name"
                      xs="6"
                    />
                  </BootstrapForm.Row>
                  <BootstrapForm.Row>
                    <TextInput
                      type="text"
                      label="Phone*"
                      name="phone"
                      id="phone"
                      xs="6"
                    />
                    <TextInput
                      type="text"
                      label="Agency ID"
                      name="agency_id"
                      id="agency_id"
                      xs="6"
                    />
                  </BootstrapForm.Row>
                </BootstrapForm>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={() => formikProps.submitForm()}>Save</Button>
                <Button variant="secondary" onClick={handleCloseShowAddTeamMember}>Close</Button>
              </Modal.Footer>
            </Modal>
          )}
        </Formik>
      </Form>
    )}
  </Formik>
  )
}

export default Deploy;
