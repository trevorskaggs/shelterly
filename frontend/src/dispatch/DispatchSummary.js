import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, Col, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip, Spinner, ListGroupItem } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay, faClipboardCheck, faClipboardList,  faChevronDown, faChevronUp, faEquals, faDownload, faUpload, faEdit, faEnvelope, faHouseDamage, faBriefcaseMedical, faMinusSquare, faPencilAlt, faUserCheck, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { faClockRotateLeft, faExclamationSquare, faChevronDoubleDown, faChevronDoubleUp } from '@fortawesome/pro-solid-svg-icons';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import Map, { countDictMatches, prettyText, reportedMarkerIcon, reportedEvacMarkerIcon, reportedSIPMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { printDispatchResolutionForm } from './Utils'
import { AuthContext } from "../accounts/AccountsReducer";
import { SystemErrorContext } from '../components/SystemError';
import ShelterlyPrintifyButton from '../components/ShelterlyPrintifyButton';
import LoadingLink from '../components/LoadingLink';
import ActionsDropdown from '../components/ActionsDropdown';

function DispatchSummary({ id, incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);
  const [isLoading, setIsLoading] = useState(true);

  // Initial animal data.
  const [data, setData] = useState({
    id: '',
    closed: false,
    team_members: [],
    team_member_objects: [],
    team: null,
    team_object: {name:''},
    assigned_requests: [],
    start_time: null,
    end_time: null,
    bounds:L.latLngBounds([[0,0]])
  });

  const [mapState, setMapState] = useState({});
  const [teamData, setTeamData] = useState({teams: [], options: [], isFetching: false});
  const [teamName, setTeamName] = useState('');
  const [defaultTeamName, setDefaultTeamName] = useState(false);
  const [showTeamName, setShowTeamName] = useState(false)
  const handleTeamNameClose = () => {setShowTeamName(false);}
  const [showReopenModal, setShowReopenModal] = useState(false)
  const handleReopenModalClose = () => {setShowReopenModal(false);}
  const [teamMembers, setTeamMembers] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => {setShow(false);}
  const [teamMemberToDelete, setTeamMemberToDelete] = useState({id: 0, name: '', display_name: ''});
  const [showTeamMemberConfirm, setShowTeamMemberConfirm] = useState(false);
  const handleTeamMemberClose = () => setShowTeamMemberConfirm(false);
  const [error, setError] = useState('');
  const [isPreplanned, setIsPreplanned] = useState(false);
  const priorityText = {1:'Highest', 2:'High', 3:'Medium', 4:'Low', 5:'Lowest'};

  const handleTeamNameSubmit = async () => {
    let requestBody;

    if (defaultTeamName) {
      requestBody = { defaultName: true };
    } else {
      if (teamName.replace(/ /g, '').length === 0) {
        setError("Team name cannot be blank.");
        return;
      }
      else if (teamName.length > 18) {
        setError("Team name must be 18 characters or less.");
        return;
      }

      requestBody = { name: teamName };
    }

    setIsLoading(true);
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', requestBody)
    .then(response => {
      setData(prevState => ({ ...prevState, "team_object":{ ...prevState.team_object, "name": teamName} }));
      handleTeamNameClose();
      setError('');
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  // Handle TeamMember selector onChange.
  const handleChange = (values) => {
    let id_list = [];
    let selected_list = [];
    values.forEach(value => {
      id_list = [...id_list, ...value.id];
      // Handle if Team.
      if (value.label.split(':').length > 1) {
        // Parse out the team name.
        value.label.split(':')[1].split(',').forEach((name, index) =>  {
          let team_option = {id: [value.id[index]], label:name.replace(' ', '')};
          // Add to list if not already selected.
          if (!selected_list.some(option => option.id[0] === team_option.id[0])) {
            selected_list.push(team_option);
          }
        });
      }
      // Else handle as an individual TeamMember.
      else {
        selected_list.push({id:value.id, label:value.label})
      }
    });
    // If deselecting.
    if (teamMembers.length > selected_list.length) {
      let team_options = [];
      teamData.teams.filter(team => team.team_members.filter(value => id_list.includes(value)).length === 0).forEach(function(team) {
        // Add selectable options back if if not already available.
        if (team.team_members.length && !teamData.options.some(option => option.label === team.name + ": " + team.display_name)) {
          team_options.push({id:team.team_members, label:team.name + ": " + team.display_name, is_assigned:team.is_assigned});
        }
      });
      setTeamData(prevState => ({ ...prevState, "options":team_options.concat(teamData.options.concat(teamMembers.filter(option => !id_list.includes(option.id[0])))) }));
    }
    // Else we're selecting. Remove selection from option list.
    else {
      setTeamData(prevState => ({ ...prevState, "options":teamData.options.filter(option => !id_list.includes(option.id[0])) }));
    }
    setTeamMembers(selected_list);
  }

  const handleGeoJsonDownload = () => {
    var fileDownload = require('js-file-download');
    setIsLoading(true);
    axios.get('/evac/api/evacassignment/' + data.id +'/download/', {
            responseType: 'blob',
        }).then(res => {
            fileDownload(res.data, 'DAR-' + id + '.geojson');
        }).catch(err => {
        }).finally(() => setIsLoading(false));
  }

  const handleGeoJsonPush = () => {
    setIsLoading(true);
    axios.get('/evac/api/evacassignment/' + data.id +'/push/', {
            responseType: 'json',
        }).then(res => {
            console.log(res)
        }).catch(err => {
        }).finally(() => setIsLoading(false));
  }

  const handleAddTeamMemberSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'dispatch_id':data.id, 'new_team_members':teamMembers.map(item => item.id[0])})
    .then(response => {
      setData(prevState => ({ ...prevState, "team_member_objects":response.data.team_member_objects, "team_members":response.data.team_members }));
      setTeamData(prevState => ({ ...prevState, "options":prevState.options.filter(option => !response.data.team_members.includes(option.id)) }));
      setTeamMembers([]);
      handleClose();
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  const handleRemoveTeamMemberSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'remove_team_member':teamMemberToDelete.id})
    .then(response => {
      setData(prevState => ({ ...prevState, "team_member_objects":response.data.team_member_objects, "team_members":response.data.team_members }));
      setTeamData(prevState => ({ ...prevState, "options":prevState.options.concat([{id: [teamMemberToDelete.id], label: teamMemberToDelete.display_name}]) }));
      handleTeamMemberClose();
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  const handleReopenSubmit = async () => {
    setIsLoading(true);
    await axios.patch('/evac/api/evacassignment/'+ data.id + '/', {'closed':false, 'end_time':null})
    .then(response => {
      setData(prevState => ({ ...prevState, "closed":false, "end_time":null }));
      handleReopenModalClose();
    })
    .catch(error => {
      setShowSystemError(true);
    })
    .finally(() => setIsLoading(false));
  }

  const handleDownloadPdfClick = async () => {
    setIsLoading(true);
    // wait for 1 tick so spinner will set before the print button locks up the browser
    await new Promise(resolve => setTimeout(resolve, 0));
    printDispatchResolutionForm(data)
      .finally(() => setIsLoading(false));
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    setIsLoading(true);

    const fetchDispatchSummaryData = async () => {
      // Fetch Animal data.
      await axios.get('/evac/api/incident/' + state.incident.id + '/evacassignment/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          const map_dict = {};
          const bounds = [];
          for (const assigned_request of response.data.assigned_requests) {
            const matches = countDictMatches(assigned_request.animals);
            map_dict[assigned_request.service_request_object.id] = {matches:matches, latitude:assigned_request.service_request_object.latitude, longitude:assigned_request.service_request_object.longitude};
            bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
          }
          response.data['team_members'] = response.data.team.team_members;
          response.data['team_member_objects'] = response.data.team_object.team_member_objects;
          response.data['bounds'] = bounds.length > 0 ? bounds : L.latLngBounds([[0,0]]);
          setData(response.data);
          setMapState(map_dict);
          setTeamData({teams: [], options: [], isFetching: true});
          setTeamName(response.data.team_name);
          setIsPreplanned(response.data.team_name.match(/^Preplanned [0-9]+$/));
          axios.get('/evac/api/evacteammember/?incident=' + incident + '&organization=' + organization +'&training=' + state.incident.training, {
            cancelToken: source.token,
          })
          .then(teamMemberResponse => {
            let options = [];
            let team_names = [];
            teamMemberResponse.data.filter(team_member => !response.data.team_object.team_members.includes(team_member.id) && team_member.show === true).forEach(function(teammember){
              options.push({id: [teammember.id], label: teammember.display_name})
            });
            setTeamData({teams: [], options: options, isFetching: false});
            // Then fetch all recent Teams.
            axios.get('/evac/api/dispatchteam/', {
              params: {
                map: true
              },
              cancelToken: source.token,
            })
            .then(teamResponse => {
              teamResponse.data.filter(team => team.show === true).forEach(function(team) {
                // Only add to option list if team has members, is populated with at least 1 new valid team member, and is not already in the list which is sorted by newest.
                if (team.team_members.length && team.team_members.filter(team_member => !response.data.team_object.team_members.includes(team_member)).length > 0 && !team_names.includes(team.name)) {
                  options.unshift({id: team.team_members, label: team.name + ": " + team.display_name});
                }
                team_names.push(team.name);
              });
              setTeamData({teams: teamResponse.data, options: options, isFetching: false});
            })
            .catch(error => {
              if (!unmounted) {
                setTeamData({teams: [], options: [], isFetching: false});
                setShowSystemError(true);
              }
            });
          })
          .catch(error => {
            if (!unmounted) {
              setTeamData({options: [], isFetching: false});
              setShowSystemError(true);
            }
          });
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      })
      .finally(() => setIsLoading(false));
    };

    fetchDispatchSummaryData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };

  }, [id, state.incident.id]);

  return (
    <>
    <Header>Dispatch Assignment Summary #{id}</Header>
    {/* <div style={{fontSize:"18px", marginTop:"10px"}}><b>Opened: </b><Moment format="MMMM Do YYYY, HH:mm">{data.start_time}</Moment>
    {data.closed && data.end_time ? <span> | <b>Closed: </b><Moment format="MMMM Do YYYY, HH:mm">{data.end_time}</Moment></span> : ""}</div> */}
    <hr/>
    <Row className="mb-2">
      <Col>
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginTop:"-10px"}}>
            <div className="d-flex justify-content-between" style={{marginBottom:"-10px"}}>
              <h4 style={{paddingTop:"12px"}}>
                Information
              </h4>
              {isLoading ? (
                <Spinner
                  className="align-self-center mr-3"
                  {...{
                    as: 'span',
                    animation: 'border',
                    size: undefined,
                    role: 'status',
                    'aria-hidden': 'true',
                    variant: 'light',
                    style: {
                      height: '1.5rem',
                      width: '1.5rem',
                      marginBottom: '0.75rem'
                    }
                  }}
                />
              ) : (
              <ActionsDropdown alignRight={true} variant="dark" title="Actions">
                {data.end_time
                  ? <LoadingLink
                    href={"/" + organization + "/" + incident + "/dispatch/resolution/" + id}
                    className="text-white d-block py-1 px-3"
                    isLoading={isLoading}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" inverse />
                    Update Dispatch Assignment
                  </LoadingLink>
                  : <LoadingLink
                    href={"/" + organization + "/" + incident + "/dispatch/resolution/" + id}
                    className="text-white d-block py-1 px-3"
                    isLoading={isLoading}
                  >
                    <FontAwesomeIcon icon={faClipboardCheck} className="mr-1" inverse />
                    Resolve Dispatch Assignment
                  </LoadingLink>
                }
                <LoadingLink
                  onClick={() => {setShow(true)}}
                  className="text-white d-block py-1 px-3"
                  isLoading={isLoading}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-1"  inverse />
                  Add Team Member
                </LoadingLink>
                <ShelterlyPrintifyButton
                  id="dispatch-assignment"
                  spinnerSize={2.0}
                  tooltipPlacement='right'
                  tooltipText='Print Dispatch Assignment as PDF'
                  printFunc={handleDownloadPdfClick}
                  disabled={isLoading}
                  noOverlay={true}
                />
                {data.end_time ?
                <LoadingLink
                  onClick={() => {setShowReopenModal(true)}}
                  className="text-white d-block py-1 px-3"
                  isLoading={isLoading}
                >
                  <FontAwesomeIcon icon={faClockRotateLeft} className="mr-1"  inverse />
                  Reopen Dispatch Assignment
                </LoadingLink>
                : ''}
                <LoadingLink
                  onClick={handleGeoJsonDownload}
                  className="text-white d-block py-1 px-3"
                  isLoading={isLoading}
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-1"  inverse />
                  Download Dispatch Assignment as Geojson
                </LoadingLink>
                {state.incident.caltopo_map_id ?
                <LoadingLink
                  onClick={handleGeoJsonPush}
                  className="text-white d-block py-1 px-3"
                  isLoading={isLoading}
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-1"  inverse />
                  Push Dispatch Assignment to CalTopo
                </LoadingLink>
                : ''}
              </ActionsDropdown>
            )}
            </div>
            <hr/>
            {data.team_member_objects && data.team_member_objects.length > 0 ?
            <Scrollbar no_shadow="true" style={{height:"225px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
                <ListGroup.Item>
                  <Row>
                    <Col><b>Opened: </b>{<Moment format="MMM Do YYYY, HH:mm">{data.start_time}</Moment>}</Col>
                    <Col><b>Closed: </b>{data.end_time ? <Moment format="MMM Do YYYY, HH:mm">{data.end_time}</Moment> : "N/A"}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Team: </b>{data.team_object ? data.team_name : "Preplanned"}
                  <OverlayTrigger
                    key={"edit-team-name"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-edit-team-name`}>
                        Edit team name
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faPencilAlt} className="ml-1 fa-move-up" size="sm" onClick={() => {setShowTeamName(true)}} style={{cursor:'pointer'}} inverse />
                  </OverlayTrigger>
                </ListGroup.Item>
                {data.team_member_objects.map(team_member => (
                  <ListGroup.Item key={team_member.id}>
                    {team_member.first_name + " " + team_member.last_name}{team_member.agency_id ?
                    <span>&nbsp;({team_member.agency_id})</span> : ""}
                    {team_member.display_phone ?
                    <span>&nbsp;-&nbsp;{team_member.display_phone}</span>
                    : ""}
                    <OverlayTrigger
                      key={"remove-team-member"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-remove-team-member`}>
                          Remove team member
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faMinusSquare} style={{cursor:'pointer'}} size="sm" className="ml-1" onClick={() => {setTeamMemberToDelete({id:team_member.id, name: team_member.first_name + " " + team_member.last_name, display_name: team_member.display_name});setShowTeamMemberConfirm(true);}} inverse />
                    </OverlayTrigger>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Scrollbar> : ""}
          </Card.Body>
        </Card>
      </Col>
      <Col className="border rounded pl-0 pr-0" style={{marginRight:"15px", maxHeight:"327px"}}>
        <Map className="d-block dispatch-leaflet-container" bounds={data.bounds}>
          {data.assigned_requests.map(assigned_request => (
            <Marker
              key={assigned_request.service_request_object.id}
              position={[assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]}
              icon={assigned_request.service_request_object.reported_animals > 0 ? reportedMarkerIcon : assigned_request.service_request_object.reported_evac > 0 ? reportedEvacMarkerIcon : assigned_request.service_request_object.reported_sheltered_in_place > 0 ? reportedSIPMarkerIcon : assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : UTLMarkerIcon}
            >
              <MapTooltip autoPan={false} direction="top">
                <span>
                  {mapState[assigned_request.service_request_object.id] ?
                    <span>
                      {Object.keys(mapState[assigned_request.service_request_object.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[0], mapState[assigned_request.service_request_object.id].matches[key])}
                        </span>
                      ))}
                    </span>
                  :""}
                  <br />
                  SR#{assigned_request.service_request_object.id_for_incident}: {assigned_request.service_request_object.full_address.split(',')[0]}, {assigned_request.service_request_object.full_address.split(',')[1]}
                </span>
              </MapTooltip>
            </Marker>
          ))}
        </Map>
      </Col>
    </Row>
    {data.assigned_requests.filter(request => request.service_request_object.animals.length > 0).map(assigned_request => (
      <Row key={assigned_request.service_request_object.id}>
        <Card className="mb-3 ml-3 mr-3 border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4>
                {assigned_request.service_request_object.priority === 1 ?
                  <OverlayTrigger
                    key={"highest"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-highest`}>
                        {priorityText[assigned_request.service_request_object.priority]} priority
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faChevronDoubleUp} className="mr-1"/>
                  </OverlayTrigger>
                : assigned_request.service_request_object.priority === 2 ?
                  <OverlayTrigger
                    key={"high"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-high`}>
                        {priorityText[assigned_request.service_request_object.priority]} priority
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faChevronUp} className="mr-1"/>
                  </OverlayTrigger>
                : assigned_request.service_request_object.priority === 3 ?
                  <OverlayTrigger
                    key={"medium"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-medium`}>
                        {priorityText[assigned_request.service_request_object.priority]} priority
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faEquals} className="mr-1"/>
                  </OverlayTrigger>
                : assigned_request.service_request_object.priority === 4 ?
                  <OverlayTrigger
                    key={"low"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-low`}>
                        {priorityText[assigned_request.service_request_object.priority]} priority
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faChevronDown} className="mr-1"/>
                  </OverlayTrigger>
                : assigned_request.service_request_object.priority === 5 ?
                  <OverlayTrigger
                    key={"lowest"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-lowest`}>
                        {priorityText[assigned_request.service_request_object.priority]} priority
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faChevronDoubleDown} className="mr-1"/>
                  </OverlayTrigger>
                : ""}
                SR#{assigned_request.service_request_object.id_for_incident} -&nbsp;
                <Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link>
                {assigned_request.visit_note && assigned_request.visit_note.forced_entry ?
                  <OverlayTrigger
                    key={"forced"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-forced`}>
                        Forced entry
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faHouseDamage} size="sm" className="ml-1 fa-move-up" />
                  </OverlayTrigger>
                : ""}
                {assigned_request.followup_date ?
                  <OverlayTrigger
                    key={"followup-date"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-followup-date`}>
                        Followup date:&nbsp;<Moment format="L">{assigned_request.followup_date}</Moment>
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faCalendarDay} className="ml-1 fa-move-up" size="sm" />
                  </OverlayTrigger> : ""}
                &nbsp;
              </h4>
            </Card.Title>
            <hr style={{marginBottom:"7px"}}/>
            <ListGroup variant="flush" style={{marginTop:"-5px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <b>Status: </b>{Object.values(assigned_request.animals).filter(animal => ['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'].includes(animal.status)).length === 0 ? "Completed" : <span style={{textTransform:"capitalize"}}>{assigned_request.service_request_object.status}</span>} {Object.values(assigned_request.animals).filter(animal => ['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'].includes(animal.status)).length === 0 ? <Moment format="[ on ]l">{assigned_request.visit_note.date_completed}</Moment> : <Moment format="[ on ]l">{data.dispatch_date}</Moment>}
              </ListGroup.Item>
              <ListGroup.Item>
                <b>Latitude: </b>{assigned_request.service_request_object.latitude}
                <br />
                <b>Longitude: </b>{assigned_request.service_request_object.longitude}
              </ListGroup.Item>
              {assigned_request.service_request_object.owner_objects.map(owner => (
                <ListGroup.Item key={owner.id}>
                  <b>Owner: </b><Link href={"/" + organization + "/" + incident + "/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
                  {owner.display_phone ? <span>&nbsp;{owner.display_phone}</span>: ""}
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
                  {assigned_request.owner_contact ?
                  <span>
                    {assigned_request.owner_contact.owner_name === owner.first_name + ' ' + owner.last_name ?
                    <OverlayTrigger
                      key={"owner-contacted"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-owner-contacted`}>
                          Contacted: {assigned_request.owner_contact.owner_contact_time ? <Moment format="l HH:mm">{assigned_request.owner_contact.owner_contact_time}</Moment> : 'N/A'}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faUserCheck} className="ml-1 fa-move-up" size="sm" inverse />
                    </OverlayTrigger> : ""}
                    <div style={{whiteSpace:"pre-line"}}><b>Contact Note: </b>{assigned_request.owner_contact.owner_contact_note}</div>
                  </span>
                  : ""}
                </ListGroup.Item>
              ))}
            {assigned_request.service_request_object.reporter_object ? 
              <ListGroup.Item>
                <b>Reporter: </b>{assigned_request.service_request_object.reporter_object.first_name + " " + assigned_request.service_request_object.reporter_object.last_name}
                {assigned_request.service_request_object.reporter_object.agency ? <span className="ml-1">({assigned_request.service_request_object.reporter_object.agency})</span> : "" }
                {assigned_request.service_request_object.reporter_object.display_phone ?<span>&nbsp;{assigned_request.service_request_object.reporter_object.display_phone}</span>: ""}
              </ListGroup.Item> : ""}
            <ListGroup.Item><b>Instructions for Field Team:</b> {assigned_request.service_request_object.directions||"No instructions available."}</ListGroup.Item>
          </ListGroup>
          <hr/>
          <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
            <h4 className="mt-2" style={{marginBottom:"-2px"}}>Animals</h4>
            {assigned_request.service_request_object.animals.filter(animal => Object.keys(assigned_request.animals).includes(String(animal.id))).map((animal, inception) => (
              <ListGroup.Item key={animal.id}>
                <span style={{textTransform:"capitalize"}}><Link href={"/" + organization + "/" + incident + "/animals/" + animal.id_for_incident} className="text-link" style={{textDecoration:"none", color:"white"}}>
                  A#{animal.id_for_incident}</Link> - {animal.animal_count > 1 ? <span>{animal.animal_count} {animal.species_string}{animal.animal_count > 1 && !["sheep", "cattle"].includes(animal.species_string) ? "s" : ""}</span> : <span>{animal.name||"Unknown"}&nbsp;-&nbsp;{animal.species_string}</span>}</span>
                {animal.color_notes ?
                  <OverlayTrigger
                    key={"animal-color-notes"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-animal-color-notes`}>
                        {animal.color_notes}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="ml-1" size="sm" inverse />
                  </OverlayTrigger>
                : ""}
                {animal.behavior_notes ?
                  <OverlayTrigger
                    key={"animal-behavior-notes"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-animal-behavior-notes`}>
                        {animal.behavior_notes}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faExclamationSquare} className="ml-1 fa-move-down" size="sm" inverse />
                  </OverlayTrigger>
                : ""}
                {animal.medical_notes ?
                  <OverlayTrigger
                    key={"animal-medical-notes"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-animal-medical-notes`}>
                        {animal.medical_notes}
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faBriefcaseMedical} className="ml-1" size="sm" inverse />
                  </OverlayTrigger>
                : ""}
                {animal.pcolor || animal.scolor ? <span className="ml-1" style={{textTransform:"capitalize"}}>({animal.pcolor ? animal.pcolor : "" }{animal.scolor ? <span>{animal.pcolor ? <span>/</span> : ""}{animal.scolor}</span> : ""})</span>: ""}
                &nbsp;- {animal.status}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {assigned_request.service_request_object.notes.filter(note => note.urgent === true).length ? <span>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <h4 className="mt-2" style={{marginBottom:"-2px"}}>Urgent Notes</h4>
                {assigned_request.service_request_object.notes.filter(note => note.urgent === true).map(note =>
                <ListGroup.Item key={note.id} style={{whiteSpace:"pre-line"}}>
                  {note.notes || "No information available."}
                </ListGroup.Item>
                )}
            </ListGroup>
          </span> : ""}
          {assigned_request.visit_note ?
          <span>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <h4 className="mt-2" style={{marginBottom:"-2px"}}>Visit Notes</h4>
                <ListGroup.Item style={{whiteSpace:"pre-line"}}>
                  {assigned_request.visit_note.notes || "No information available."}
                </ListGroup.Item>
            </ListGroup>
          </span>
          : ""}
          {assigned_request.visit_notes.length > 0 ? <h4 className="mt-2" style={{marginBottom:"-2px"}}>Previous Visit Notes</h4> : ""}
          <ListGroup variant="flush" style={{marginBottom:"-13px"}}>
          {assigned_request.visit_notes.map(visit_note =>
            <ListGroup.Item key={visit_note.id} style={{whiteSpace:"pre-line"}}>
              <Link href={"/" + organization + "/" + incident + "/dispatch/summary/" + visit_note.dispatch_assignment} className="text-link" style={{textDecoration:"none", color:"white"}}><Moment format="L">{visit_note.date_completed}</Moment></Link>: {visit_note.notes || "No information available."}
            </ListGroup.Item>
          ) || "None"}
          </ListGroup>
        </Card.Body>
      </Card>
    </Row>
    ))}
    <Modal show={showTeamName} onHide={handleTeamNameClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Team Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          label="Team Name"
          id="team_name"
          name="team_name"
          type="text"
          onChange={(event) => {setTeamName(event.target.value)}}
          value={teamName}
          disabled={defaultTeamName}
        />
        {error ? <div style={{ color: "#e74c3c", marginTop: "-8px", marginLeft: "16px", fontSize: "80%" }}>{error}</div> : ""}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && isPreplanned ? (
          <Form.Check
            id="defaultNameCheck"
            type="checkbox"
            style={{ flexGrow: 1 }}
            label="Use Default Team Name"
            onChange={() => setDefaultTeamName(!defaultTeamName)}
            checked={defaultTeamName}
          />
        ) : null}
        
        <Button variant="primary" onClick={handleTeamNameSubmit}>Save</Button>
        <Button variant="secondary" onClick={handleTeamNameClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Team Members</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Typeahead
          id="team_members"
          multiple
          onChange={(values) => {handleChange(values)}}
          selected={teamMembers}
          options={teamData.options}
          placeholder="Choose team members..."
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleAddTeamMemberSubmit}>Add</Button>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showTeamMemberConfirm} onHide={handleTeamMemberClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Team Member Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you would like to remove team member {teamMemberToDelete.name} from this dispatch assignment?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleRemoveTeamMemberSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleTeamMemberClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showReopenModal} onHide={handleReopenModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Dispatch Assignment Reopen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you would like to reopen this dispatch assignment?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleReopenSubmit}>Yes</Button>
        <Button variant="secondary" onClick={handleReopenModalClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    </>
  )
}

export default DispatchSummary;
