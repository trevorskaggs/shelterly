import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Form, Formik } from 'formik';
import { Button, Col, FormCheck, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faBullseye, faCalendarDay, faCar, faCircle, faClipboardList, faExclamationCircle, faQuestionCircle, faPencilAlt, faTrailer, faUserAlt, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import { faBadgeSheriff, faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import { Circle, Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import badge from "../static/images/badge-sheriff.png";
import bandaid from "../static/images/band-aid-solid.png";
import car from "../static/images/car-solid.png";
import trailer from "../static/images/trailer-solid.png";
import { Typeahead } from 'react-bootstrap-typeahead';
import Moment from 'react-moment';
import Map, { countMatches, prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon, checkMarkerIcon } from "../components/Map";
import { Checkbox, TextInput } from "../components/Form";
import { DispatchDuplicateSRModal } from "../components/Modals";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'leaflet/dist/leaflet.css';

function Deploy() {

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [totalSelectedState, setTotalSelectedState] = useState({'REPORTED':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}});
  const [selectedCount, setSelectedCount] = useState({count:0, disabled:true});
  const [statusOptions, setStatusOptions] = useState({aco_required:false, pending_only: true});
  const [teamData, setTeamData] = useState({teams: [], options: [], isFetching: false});
  const [selected, setSelected] = useState([]);
  const [teamName, setTeamName] = useState('');
  const handleClose = () => setShow(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [showDispatchDuplicateSRModal, setShowDispatchDuplicateSRModal] = useState(false);
  const [duplicateSRs, setDuplicateSRs] = useState([]);
  const handleCloseDispatchDuplicateSRModal = () => setShowDispatchDuplicateSRModal(false);

  // Handle aco_required toggle.
  const handleACO = async event => {
    setStatusOptions({aco_required:!statusOptions.aco_required, pending_only:statusOptions.pending_only})
  }

  // Handle pending_only toggle.
  const handlePendingOnly = async event => {
    setStatusOptions({aco_required:statusOptions.aco_required, pending_only:!statusOptions.pending_only})
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
          let team_option = {id: [value.id[index]], label:name.replace(' ', '')};
          // Add to list if not already selected.
          if (!selected_list.some(option => option.id[0] === team_option.id[0])) {
            selected_list.push(team_option);
          }
        });
      }
      // Else handle as an individual TeamMember.
      else {
        selected_list.push({id: value.id, label:value.label})
      }
    });
    // If deselecting.
    if (selected.length > selected_list.length) {
      let team_options = [];
      teamData.teams.filter(team => !team.is_assigned && team.team_members.filter(value => id_list.includes(value)).length === 0).forEach(function(team) {
        // Add selectable options back if if not already available.
        if (!teamData.options.some(option => option.label === team.name + ": " + team.display_name)) {
          team_options.push({id: team.team_members, label: team.name + ": " + team.display_name});
        }
      });
      setTeamData(prevState => ({ ...prevState, "options":team_options.concat(teamData.options.concat(selected.filter(option => !id_list.includes(option.id[0])))) }));
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
    if (teamData.teams.map(team => team.name.toLowerCase()).includes(props.values.temp_team_name.toLowerCase())) {
      setError("This team name is already in use.");
    }
    else if (props.values.temp_team_name.length === 0) {
      setError("Team name cannot be blank.");
    }
    else {
      setError('');
      setShow(false);
      props.setFieldValue("team_name", props.values.temp_team_name);
    }
  }

  // Handle reselecting after hitting dupe assigned SR error.
  const handleReselect = async event => {
    setData(prevState => ({ ...prevState, 'service_requests': prevState.service_requests.filter(sr => !duplicateSRs.includes(sr.id))}));
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
          matches[key] = total;
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

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchTeamMembers = async () => {
      setTeamData({teams: [], options: [], isFetching: true});
      // Fetch all TeamMembers.
      await axios.get('/evac/api/evacteammember/', {
        cancelToken: source.token,
      })
      .then(response => {
        let options = [];
        let team_names = [];
        let team_name = '';
        response.data.forEach(function(teammember) {
          options.push({id: [teammember.id], label: teammember.display_name})
        });
        // Then fetch all recent Teams.
        axios.get('/evac/api/dispatchteam/', {
          params: {
            map: true
          },
          cancelToken: source.token,
        })
        .then(response => {
          response.data.forEach(function(team) {
            // Only add to option list if not actively assigned and not already in the list which is sorted by newest.
            if (!team.is_assigned && !team_names.includes(team.name)) {
              options.unshift({id: team.team_members, label: team.name + ": " + team.display_name});
            }
            team_names.push(team.name);
          });
          // Provide a default "TeamN" team name that hasn't already be used.
          let i = 1;
          do {
            if (!team_names.includes("Team " + String(i))){
              team_name = "Team " + String(i);
            }
            i++;
          }
          while (team_name === '');
          setTeamData({teams: response.data, options: options, isFetching: false});
          setTeamName(team_name);
        })
        .catch(error => {
          console.log(error.response);
          setTeamData({teams: [], options: [], isFetching: false});
        });
      })
      .catch(error => {
        console.log(error.response);
        setTeamData({teams: [], options: [], isFetching: false});
      });
    };

    const fetchServiceRequests = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/', {
        params: {
          status: 'open',
          aco_required: statusOptions.aco_required,
          pending_only: statusOptions.pending_only,
          map: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds([[0,0]])});
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
            map_dict[service_request.id] = {checked:false, hidden:false, color:color, matches:matches, status_matches:status_matches, radius:"disabled", has_reported_animals:service_request.reported_animals > 0, latitude:service_request.latitude, longitude:service_request.longitude};
          }
          bounds.push([service_request.latitude, service_request.longitude]);
        }
        setMapState(map_dict);
        if (bounds.length > 0) {
          setData(prevState => ({ ...prevState, "bounds":L.latLngBounds(bounds) }));
        }
      })
      .catch(error => {
        console.log(error.response);
        setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
      });
    };

    fetchTeamMembers();
    fetchServiceRequests();

    // Cleanup.
    return () => {
      source.cancel();
    };
  }, [statusOptions]);

  return (
    <Formik
      initialValues={{
        team_name: teamName,
        temp_team_name: teamName,
        team_members: [],
        service_requests: [],
      }}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        values.service_requests = Object.keys(mapState).filter(key => mapState[key].checked === true);
        // Remove duplicate assignments from POST values.
        if (duplicateSRs.length > 0) {
          values.service_requests = values.service_requests.filter(sr_id => !duplicateSRs.includes(sr_id));
        }
        setTimeout(() => {
          axios.post('/evac/api/evacassignment/', values)
          .then(response => {
            navigate('/dispatch/summary/' + response.data.id);
          })
          .catch(error => {
            console.log(error.response);
            if (error.response.data && error.response.data[0].includes('Duplicate assigned service request error')) {
              setDuplicateSRs(error.response.data[1]);
              setShowDispatchDuplicateSRModal(true);
            }
          });
          setSubmitting(false);
        }, 500);
      }}
    >
    {props => (
      <Form>
        <Row className="d-flex flex-wrap" style={{marginTop:"10px", marginRight:"-7px"}}>
          <Col xs={2} className="border rounded" style={{marginLeft:"-5px", marginRight:"5px"}}>
            <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px"}}>
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
                  <FontAwesomeIcon icon={faExclamationCircle} className="ml-1"/>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["REPORTED"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[1], key.split(',')[0], totalSelectedState["REPORTED"][key])}</div>
              ))}
            </div>
            <div className="card-header border rounded mt-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px"}}>
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
                  <span className="fa-layers ml-1">
                    <FontAwesomeIcon icon={faCircle} transform={'grow-1'} />
                    <FontAwesomeIcon icon={faHomeAlt} style={{color:"#444"}} transform={'shrink-3'} size="sm" inverse />
                  </span>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["SHELTERED IN PLACE"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[1], key.split(',')[0], totalSelectedState["SHELTERED IN PLACE"][key])}</div>
              ))}
            </div>
            <div className="card-header border rounded mt-3 mb-3 text-center" style={{paddingRight:"15px", paddingLeft:"15px"}}>
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
                  <FontAwesomeIcon icon={faQuestionCircle} className="ml-1"/>
                </OverlayTrigger>
              </p>
              <hr className="mt-1 mb-1"/>
              {Object.keys(totalSelectedState["UNABLE TO LOCATE"]).map(key => (
                <div key={key} style={{textTransform:"capitalize", marginTop:"5px", marginBottom:"-5px"}}>{prettyText(key.split(',')[1], key.split(',')[0], totalSelectedState["UNABLE TO LOCATE"][key])}</div>
              ))}
            </div>
          </Col>
          <Col xs={10} className="border rounded pl-0 pr-0">
            <Map style={{marginRight:"0px"}} bounds={data.bounds} onMoveEnd={onMove}>
              {data.service_requests.map(service_request => (
                <span key={service_request.id}> {mapState[service_request.id] ? 
                  <Marker
                    position={[service_request.latitude, service_request.longitude]}
                    icon={mapState[service_request.id] && mapState[service_request.id].checked ? checkMarkerIcon : service_request.sheltered_in_place > 0 ? SIPMarkerIcon : service_request.unable_to_locate > 0 ? UTLMarkerIcon : reportedMarkerIcon}
                    onClick={() => handleMapState(service_request.id)}
                  >
                    <MapTooltip autoPan={false}>
                      <span>
                        {mapState[service_request.id] ?
                          <span>
                            {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                              <span key={key} style={{textTransform:"capitalize"}}>
                                {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[service_request.id].matches[key])}
                              </span>
                            ))}
                          </span>
                        :""}
                        <br />
                        {service_request.full_address}
                        {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                        <div>
                          {service_request.aco_required ? <img width={16} height={16} src={badge} alt="" className="mr-1" /> : ""}
                          {service_request.injured ? <img width={16} height={16} src={bandaid} alt="" className="mr-1" /> : ""}
                          {service_request.accessible ? <img width={16} height={16} src={car} alt="" className="mr-1" /> : ""}
                          {service_request.turn_around ? <img width={16} height={16} src={trailer} alt="" /> : ""}
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
        <Row className="mt-2">
          <Col xs={2} className="pl-0 pr-0" style={{marginLeft:"-7px", paddingRight:"2px"}}>
            <Button type="submit" className="btn-block mt-auto" style={{marginBottom:"-33px"}} disabled={selectedCount.disabled || props.values.team_members.length === 0}>DEPLOY</Button>
          </Col>
          <Col xs={2} className="pl-0 pr-0" style={{marginLeft:"-7px", paddingRight:"2px"}}>
            <div className="card-header border rounded text-center" style={{height:"37px", marginLeft:"12px", paddingTop:"6px"}}>{props.values.team_name || teamName}
            <OverlayTrigger
              key={"edit-team-name"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-edit-team-name`}>
                  Update team name
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faPencilAlt} className="ml-1" style={{cursor:'pointer'}} onClick={() => setShow(true)} />
            </OverlayTrigger>
            </div>
          </Col>
          <Col xs={8} className="pl-0">
            <Typeahead
              id="team_members"
              multiple
              onChange={(values) => handleChange(values, props)}
              selected={selected}
              options={teamData.options}
              placeholder="Choose team members..."
              style={{marginLeft:"3px", marginRight:"-22px"}}
            />
          </Col>
        </Row>
        <Row className="d-flex flex-wrap" style={{marginTop:"8px", marginRight:"-23px", marginLeft:"-14px", minHeight:"36vh", paddingRight:"14px"}}>
          <Col xs={2} className="d-flex flex-column pl-0 pr-0" style={{marginLeft:"-7px", marginRight:"5px"}}>
            <div className="card-header border rounded pl-3 pr-3" style={{height:"100%"}}>
              <h5 className="mb-0 text-center">Options</h5>
              <hr/>
              <FormCheck id="aco_required" name="aco_required" type="switch" label="ACO Required" checked={statusOptions.aco_required} onChange={handleACO} />
              <FormCheck id="pending_only" className="mt-3" name="pending_only" type="switch" label="Pending Only" checked={statusOptions.pending_only} onChange={handlePendingOnly} />
            </div>
          </Col>
          <Col xs={10} className="border rounded" style={{marginLeft:"1px", height:"36vh", overflowY:"auto", paddingRight:"-1px"}}>
            {data.service_requests.map(service_request => (
              <span key={service_request.id}>{mapState[service_request.id] && (mapState[service_request.id].checked || !mapState[service_request.id].hidden) ?
              <div className="mt-1 mb-1" style={{marginLeft:"-10px", marginRight:"-10px"}}>
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
                        {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[service_request.id].matches[key])}
                      </span>
                    ))}
                  </span>
                  :""}
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
                    <FontAwesomeIcon icon={faCar} className="ml-1"/>
                  </OverlayTrigger>
                  : ""}
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
                    <FontAwesomeIcon icon={faTrailer} className="ml-1"/>
                  </OverlayTrigger>
                  : ""}
                  <span className="ml-2">|
                  &nbsp;{service_request.full_address}</span>
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
                  {service_request.followup_date ?
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
                  </OverlayTrigger> : ""}
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
                            <div key={owner.id}>{owner.first_name} {owner.last_name}</div>
                          ))}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faUserAlt} className="mr-1" size="sm" />
                    </OverlayTrigger>
                  }
                  <OverlayTrigger
                    key={"request-details"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-request-details`}>
                        Service request details
                      </Tooltip>
                    }
                  >
                    <Link href={"/hotline/servicerequest/" + service_request.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                  </OverlayTrigger>
                </div>
              </div>
              : ""}
              </span>
            ))}
            <div className="card-header mt-1 mb-1 rounded" style={{marginLeft:"-10px", marginRight:"-10px"}} hidden={data.service_requests.length > 0}>
              No open Service Requests found.
            </div>
          </Col>
        </Row>
        <DispatchDuplicateSRModal sr_list={data.service_requests.filter(sr => duplicateSRs.includes(sr.id))} show={showDispatchDuplicateSRModal} handleClose={handleCloseDispatchDuplicateSRModal} handleSubmit={props.handleSubmit} handleReselect={handleReselect} />
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
      </Form>
    )}
  </Formik>
  )
}

export default Deploy;
