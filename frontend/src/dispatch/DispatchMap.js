import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Form, Formik } from 'formik';
import { Button, Col, Form as BootstrapForm, FormCheck, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan, faBandAid, faBullseye, faCalendarDay, faCar, faChevronDown, faChevronUp, faEquals, faExclamationTriangle, faCircle, faClipboardList, faExclamationCircle, faMapMarkedAlt, faQuestionCircle, faPencilAlt, faPlusSquare, faTrailer, faUserAlt, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faChevronDoubleDown, faChevronDoubleUp, faCircleBolt, faHomeAlt, faRotate } from '@fortawesome/pro-solid-svg-icons';
import { faHomeAlt as faHomeAltReg } from '@fortawesome/pro-regular-svg-icons';
import { Circle, Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import * as Yup from 'yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import Moment from 'react-moment';
import useWebSocket from 'react-use-websocket';
import Map, { countMatches, prettyText, reportedMarkerIcon, reportedEvacMarkerIcon, reportedSIPMarkerIcon, SIPMarkerIcon, UTLMarkerIcon, checkMarkerIcon } from "../components/Map";
import { Checkbox, TextInput } from "../components/Form";
import { DispatchDuplicateSRModal, DispatchAlreadyAssignedTeamModal } from "../components/Modals";
import Scrollbar from '../components/Scrollbars';
import Header from '../components/Header';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';

function Deploy({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

  // Regex validators.
  const phoneRegex = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,3})|(\(?\d{2,3}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;

  // Determine if this is a preplanning workflow.
  let preplan = window.location.pathname.includes("preplan")

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [newData, setNewData] = useState(false);
  const [mapState, setMapState] = useState({});
  const [totalSelectedState, setTotalSelectedState] = useState({'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}});
  const [selectedCount, setSelectedCount] = useState({count:0, disabled:true});
  const [statusOptions, setStatusOptions] = useState({aco_required:false, hide_pending: true});
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [teamData, setTeamData] = useState({teams: [], options: [], isFetching: false});
  const [selected, setSelected] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [assignedTeamMembers, setAssignedTeamMembers] = useState([]);
  const handleClose = () => setShow(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const handleCloseShowAddTeamMember = () => setShowAddTeamMember(false);
  const [showDispatchDuplicateSRModal, setShowDispatchDuplicateSRModal] = useState(false);
  const [duplicateSRs, setDuplicateSRs] = useState([]);
  const handleCloseDispatchDuplicateSRModal = () => {setDuplicateSRs([]);setShowDispatchDuplicateSRModal(false);}
  const [showAlreadyAssignedTeamModal, setShowAlreadyAssignedTeamModal] = useState(false);
  const handleCloseAlreadyAssignedTeamModal = () => {setDuplicateSRs([]);setShowAlreadyAssignedTeamModal(false);}
  const [proceed, setProceed] = useState(false);

  const priorityText = {1:'Highest', 2:'High', 3:'Medium', 4:'Low', 5:'Lowest'};

  // Handle aco_required toggle.
  const handleACO = async event => {
    setStatusOptions(prevState => ({ ...prevState, aco_required:!statusOptions.aco_required }));
  }

  // Handle hide_pending toggle.
  const handlePendingOnly = async event => {
    setStatusOptions(prevState => ({ ...prevState, hide_pending:!statusOptions.hide_pending }));
  }

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
    let team_name = props.values.team_name;
    let id_list = [];
    let selected_list = [];
    values.forEach(value => {
      id_list = [...id_list, ...value.id];
      // Handle if Team.
      if (value.label.split(':').length > 1) {
        // Parse out the team name.
        team_name = value.label.split(':')[0];
        value.label.split(':')[1].split(',').forEach((name, index) =>  {
          let team_option = {id: [value.id[index]], label:name.replace(' ', ''), is_assigned:value.is_assigned};
          // Add to list if not already selected.
          if (!selected_list.some(option => option.id[0] === team_option.id[0])) {
            selected_list.push(team_option);
          }
        });
      }
      // Else handle as an individual TeamMember.
      else {
        selected_list.push({id:value.id, label:value.label, is_assigned:value.is_assigned})
      }
    });
    // If deselecting.
    if (selected.length > selected_list.length) {
      let team_options = [];
      teamData.teams.filter(team => team.team_object.team_members.filter(value => id_list.includes(value)).length === 0).forEach(function(team) {
        // Add selectable options back if if not already available.
        if (team.team_object.team_members.length && !teamData.options.some(option => option.label === team.team_object.name + ": " + team.team_object.display_name)) {
          team_options.push({id:team.team_object.team_members, label:team.team_object.name + ": " + team.team_object.display_name, is_assigned:team.team_object.is_assigned});
        }
      });
      setTeamData(prevState => ({ ...prevState, "options":team_options.concat(teamData.options.concat(selected.filter(option => !id_list.includes(option.id[0])))) }));
      setSelectedCount((prevState) => ({...prevState, disabled: (prevState.count > 0 ? false : true)}));
    }
    // Else we're selecting. Remove selection from option list.
    else {
      setTeamData(prevState => ({ ...prevState, "options":teamData.options.filter(option => !id_list.includes(option.id[0])) }));
    }
    props.setFieldValue('team_members', id_list);
    props.setFieldValue('team_name', team_name);
    props.setFieldValue('temp_team_name', team_name);
    setSelected(selected_list);
  }

  // Handle Team Name updating to reject names already in use.
  const handleSubmit = (props) => {
    if (props.values.temp_team_name.length === 0) {
      setError("Team name cannot be blank.");
    }
    else if (props.values.temp_team_name.length > 18) {
      // Do nothing.
    }
    else {
      setError('');
      setShow(false);
      props.setFieldValue("team_name", props.values.temp_team_name);
    }
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

    const fetchTeamMembers = async () => {
      setTeamData({teams: [], options: [], isFetching: true});
      // Fetch all TeamMembers.
      await axios.get('/evac/api/evacteammember/?incident=' + incident + '&organization=' + organization +'&training=' + state.incident.training, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let options = [];
          let team_names = [];
          let team_name = '';
          response.data.filter(teammember => teammember.show === true).forEach(function(teammember) {
            options.push({id: [teammember.id], label: teammember.display_name, is_assigned:teammember.is_assigned})
          });
          setAssignedTeamMembers(response.data.filter(teammember => teammember.is_assigned === true).map(teammember => teammember.id))
          // Then fetch all recent Teams.
          axios.get('/evac/api/evacassignment/', {
            params: {
              deploy_map: true,
              incident,
            },
            cancelToken: source.token,
          })
          .then(response => {
            response.data
              .filter(({ team_object }) => team_object.show === true) 
              .forEach(function({ team_object: team }) {
                // Only add to option list if team has members and is not already in the list which is sorted by newest.
                if (team.team_member_objects.length && !team_names.includes(team.name)) {
                  options.unshift({id: team.team_members, label: team.name + ": " + team.display_name, is_assigned:team.is_assigned});
                }
                team_names.push(team.name);
              });
            // Provide a default "TeamN" team name that hasn't already be used.
            let i = 1;
            let name = preplan ? "Preplanned " : "Team "
            // Sort team_names to ensure we start with the lowest available number for default team name
            team_names = team_names.filter(n => n.startsWith(name)).sort((a, b) => {
              let numA = parseInt(a.replace(/^\D+/g, ''), 10);
              let numB = parseInt(b.replace(/^\D+/g, ''), 10);
              return numA - numB;
            });
            // Find the lowest available number for the new team name
            while (team_names.includes(name + i)) {
              i++;
            }
            team_name = name + i;
            setTeamData({teams: response.data, options: options, isFetching: false});
            setTeamName(team_name);
          })
          .catch(error => {
            if (!unmounted) {
              setTeamData({teams: [], options: [], isFetching: false});
              setShowSystemError(true);
            }
          });
        }
      })
      .catch(error => {
        if (!unmounted) {
          setTeamData({teams: [], options: [], isFetching: false});
          setShowSystemError(true);
        }
      });
    };

    const fetchServiceRequests = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/?incident=' + incident, {
        params: {
          status: 'open',
          landingmap: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(prevState => ({ ...prevState, service_requests: response.data, isFetching: false}));
          const map_dict = {...mapState};
          const bounds = [];
          const current_ids = Object.keys(mapState);
          for (const service_request of response.data) {
            // Only add initial settings if we don't already have them.
            if (!current_ids.includes(String(service_request.id))) {
              const total_matches = countMatches(service_request);
              const matches = total_matches[0];
              const status_matches = total_matches[1];
              const color = service_request.reported_animals > 0 ? '#ff4c4c' : service_request.unable_to_locate > 0 ? '#5f5fff' : '#f5ee0f';
              map_dict[service_request.id] = {checked:false, hidden:false, color:color, matches:matches, status_matches:status_matches, radius:"disabled", latitude:service_request.latitude, longitude:service_request.longitude};
              bounds.push([service_request.latitude, service_request.longitude]);
            }
          }
          setMapState(map_dict);

          var status_matches = {'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}};
          var matches = {};
          var total = 0;
          // Recount the total state tracker for selected SRs on refresh.
          Object.keys(map_dict).filter(key => map_dict[key].checked === true && response.data.map(sr => sr.id).includes(Number(key))).forEach(id => {
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

          if (bounds.length > 0 && Object.keys(mapState).length < 1) {
            setData(prevState => ({ ...prevState, "bounds":L.latLngBounds(bounds) }));
          }
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
          setShowSystemError(true);
        }
      });
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
  }, [triggerRefresh, preplan, incident]);

  return (
    <Formik
      initialValues={{
        team_name: teamName,
        temp_team_name: teamName,
        team_members: [],
        service_requests: [],
        incident: state.incident.id,
      }}
      validationSchema={Yup.object({
        temp_team_name: Yup.string()
          .max(18, 'Must be 18 characters or less')
          .required('Required'),
      })}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
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
            axios.post('/evac/api/evacassignment/', values)
            .then(response => {
              // Stay on map and remove selected SRs if in Preplanning mode.
              if (preplan) {
                setTriggerRefresh(true);
              }
              // Otherwise navigate to the DA Summary page.
              else {
                navigate('/' + organization + "/" + incident + '/dispatch/summary/' + response.data.id_for_incident);
              }
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
            setSubmitting(false);
          }, 500);
        }
      }}
    >
    {props => (
      <Form>
        <Header>
          {preplan ? "Preplan Dispatch Assignments" : "Deploy Teams "}
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
              <Button className="fa-move-up" onClick={() => setTriggerRefresh(!triggerRefresh)}>
                <FontAwesomeIcon icon={faRotate} />
              </Button>
            </span>
          </OverlayTrigger>
        </Header>
        <hr/>
        <Row className="d-flex flex-wrap" style={{marginTop:"10px", marginLeft:"0px", marginRight:"0px"}}>
          <Col xs={2} className="border rounded">
          <Scrollbar no_shadow="true" style={{height:"50vh", marginLeft:"-15px", marginRight:"-15px", right:"-5px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
            <h4 className="text-center mt-1 mr-1">Selected</h4><hr style={{marginTop:"-5px", marginBottom:"-5px", marginLeft:"10px", marginRight:"20px"}} />
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
              {data.service_requests
              .filter(service_request => statusOptions.aco_required ? service_request.aco_required === statusOptions.aco_required : true)
              .filter(service_request => statusOptions.hide_pending ? service_request.pending !== statusOptions.hide_pending : true)
              .map(service_request => (
                <span key={service_request.id}> {mapState[service_request.id] ? 
                  <Marker
                    position={[service_request.latitude, service_request.longitude]}
                    icon={mapState[service_request.id] && mapState[service_request.id].checked ? checkMarkerIcon : service_request.reported_animals > 0 ? reportedMarkerIcon : service_request.reported_evac > 0 ? reportedEvacMarkerIcon : service_request.reported_sheltered_in_place > 0 ? reportedSIPMarkerIcon : service_request.sheltered_in_place > 0 ? SIPMarkerIcon : UTLMarkerIcon}
                    onClick={() => handleMapState(service_request.id)}
                    zIndexOffset={mapState[service_request.id].checked ? 1000 : 0}
                  >
                    <MapTooltip autoPan={false}>
                      <span>
                        {mapState[service_request.id] ?
                          <span>
                            {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                              <span key={key} style={{textTransform:"capitalize"}}>
                                {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[service_request.id].matches[key])}
                              </span>
                            ))}
                          </span>
                        :""}
                        <br />
                        SR#{service_request.id_for_incident}: {service_request.full_address}
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
            <Button type="submit" className="btn-block mt-auto border" disabled={selectedCount.disabled || (!preplan && props.values.team_members.length === 0)}>{preplan ? "PREPLAN" : "DEPLOY"}</Button>
          </Col>
          <Col className="pl-0 pr-0 ml-1" style={{maxWidth:"170px"}}>
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
          </Col>
          <Col style={{marginLeft:"2px", paddingLeft:"2px", paddingRight:"4px"}}>
            {preplan ?
              <BootstrapForm.Control
                id="disabled_team_name"
                name="disabled_team_name"
                type="text"
                placeholder="Cannot choose team members when preplanning..."
                disabled={true}
                style={{height:"37px"}}
              />
            :
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
            }
          </Col>
          <Col className="pr-0" style={{maxWidth:"31px", paddingLeft:"2px"}}>
            <OverlayTrigger
              key={"add-team-member"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-add-team-member`}>
                  Add a new team member
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faPlusSquare} className="ml-1" size="lg" transform="grow-18 down-6" onClick={() => setShowAddTeamMember(true)} style={{cursor:"pointer"}} inverse />
            </OverlayTrigger>
          </Col>
        </Row>
        <Row className="d-flex flex-wrap" style={{marginTop:"-1px", marginRight:"-23px", marginLeft:"6px", minHeight:"36vh", paddingRight:"14px"}}>
          <Col xs={2} className="d-flex flex-column pl-0 pr-0" style={{marginLeft:"-7px", marginRight:"-2px", height:"277px"}}>
            <div className="card-header border rounded pl-3 pr-3" style={{height:"100%"}}>
              <h5 className="mb-0 text-center">Options</h5>
              <hr/>
              <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.aco_required} onChange={handleACO} />
              <FormCheck
                id="hide_pending"
                className="mt-3"
                name="hide_pending"
                type="switch"
                label={`Hide Pending (${data.service_requests.filter(sr => sr.pending).length || 0}) `}
                checked={statusOptions.hide_pending}
                onChange={handlePendingOnly}
              />
            </div>
          </Col>
          <Col xs={10} className="border rounded" style={{marginLeft:"1px", height:"277px", overflowY:"auto", paddingRight:"-1px"}}>
            <Scrollbar no_shadow="true" style={{height:"275px", marginLeft:"-10px", marginRight:"-10px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              {data.service_requests
              .filter(service_request => statusOptions.aco_required ? service_request.aco_required === statusOptions.aco_required : true)
              .filter(service_request => statusOptions.hide_pending ? service_request.pending !== statusOptions.hide_pending : true)
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
                    <span className="ml-2">|
                    &nbsp;<Link href={"/" + organization +"/" + incident + "/hotline/servicerequest/" + service_request.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>SR#{service_request.id_for_incident}</Link>
                    {service_request.followup_date ? <span> (
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
                          Assign service request to an open dispatch assignment
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
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Update Team Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TextInput
              label="Team Name"
              id="temp_team_name"
              name="temp_team_name"
              type="text"
            />
            {error ? <div style={{ color: "#e74c3c", marginTop: "-8px", marginLeft: "16px", fontSize: "80%" }}>{error}</div> : ""}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => handleSubmit(props)}>Save</Button>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
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
            agency_id: Yup.string(),
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
