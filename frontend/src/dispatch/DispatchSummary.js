import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, Col, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay, faClipboardCheck, faClipboardList, faEdit, faEnvelope, faHouseDamage, faBriefcaseMedical, faMinusSquare, faPencilAlt, faPrint, faUserCheck, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { faExclamationSquare, faPhoneRotary } from '@fortawesome/pro-solid-svg-icons';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import Map, { countMatches, prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { printDispatchResolutionForm } from './Utils'

function DispatchSummary({ id, incident }) {

  // Initial animal data.
  const [data, setData] = useState({
    id: '',
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
  const [teamName, setTeamName] = useState('')
  const [showTeamName, setShowTeamName] = useState(false)
  const handleTeamNameClose = () => {setShowTeamName(false);}
  const [teamMembers, setTeamMembers] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => {setShow(false);}
  const [teamMemberToDelete, setTeamMemberToDelete] = useState({id: 0, name: '', display_name: ''});
  const [showTeamMemberConfirm, setShowTeamMemberConfirm] = useState(false);
  const handleTeamMemberClose = () => setShowTeamMemberConfirm(false);
  const [error, setError] = useState('');

  const handleTeamNameSubmit = async () => {
    if (teamName.replace(/ /g, '').length === 0) {
      setError("Team name cannot be blank.");
    }
    else if (teamName.length > 18) {
      setError("Team name must be 18 characters or less.");
    }
    else {
      await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'name':teamName})
      .then(response => {
        setData(prevState => ({ ...prevState, "team_object":{"name": teamName} }));
        handleTeamNameClose();
        setError('');
      })
      .catch(error => {
      });
    }
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

  const handleAddTeamMemberSubmit = async () => {
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'dispatch_id':data.id, 'new_team_members':teamMembers.map(item => item.id[0])})
    .then(response => {
      setData(prevState => ({ ...prevState, "team_member_objects":response.data.team_member_objects, "team_members":response.data.team_members }));
      setTeamData(prevState => ({ ...prevState, "options":prevState.options.filter(option => !response.data.team_members.includes(option.id)) }));
      setTeamMembers([]);
      handleClose();
    })
    .catch(error => {
    });
  }

  const handleRemoveTeamMemberSubmit = async () => {
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'remove_team_member':teamMemberToDelete.id})
    .then(response => {
      setData(prevState => ({ ...prevState, "team_member_objects":response.data.team_member_objects, "team_members":response.data.team_members }));
      setTeamData(prevState => ({ ...prevState, "options":prevState.options.concat([{id: [teamMemberToDelete.id], label: teamMemberToDelete.display_name}]) }));
      handleTeamMemberClose();
    })
    .catch(error => {
    });
  }

  const handleDownloadPdfClick = (e) => {
    e.preventDefault();

    printDispatchResolutionForm(data);
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchDispatchSummaryData = async () => {
      // Fetch Animal data.
      await axios.get('/evac/api/evacassignment/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          const map_dict = {};
          const bounds = [];
          for (const assigned_request of response.data.assigned_requests) {
            const matches = countMatches(assigned_request.service_request_object)[0];
            map_dict[assigned_request.service_request_object.id] = {matches:matches, has_reported_animals:assigned_request.service_request_object.reported_animals > 0, latitude:assigned_request.service_request_object.latitude, longitude:assigned_request.service_request_object.longitude};
            bounds.push([assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]);
          }
          response.data['team_members'] = response.data.team.team_members;
          response.data['team_member_objects'] = response.data.team_object.team_member_objects;
          response.data['bounds'] = bounds.length > 0 ? bounds : L.latLngBounds([[0,0]]);
          setData(response.data);
          setMapState(map_dict);
          setTeamData({teams: [], options: [], isFetching: true});
          setTeamName(response.data.team_object.name);
          axios.get('/evac/api/evacteammember/', {
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
              }
            });
          })
          .catch(error => {
            setTeamData({options: [], isFetching: false});
          });
        }
      })
      .catch(error => {
      });
    };

    fetchDispatchSummaryData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };

  }, [id]);

  return (
    <>
    <Header>Dispatch Assignment Summary
      <OverlayTrigger
        key={"offline-dispatch-assignment"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-offline-dispatch-assignment`}>
            Print dispatch assignment
          </Tooltip>
        }
      >
        {({ ref, ...triggerHandler }) => (
          <Link onClick={handleDownloadPdfClick} {...triggerHandler} href="#">
            <span ref={ref}><FontAwesomeIcon icon={faPrint} className="ml-1 mr-1"  inverse /></span>
          </Link>
        )}
      </OverlayTrigger>
      {data.end_time ?
      <OverlayTrigger
        key={"edit-dispatch-assignment"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-dispatch-assignment`}>
            Update dispatch assignment
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/dispatch/resolution/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
      :
      <OverlayTrigger
        key={"resolve-dispatch-assignment"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-resolve-dispatch-assignment`}>
            Resolve dispatch assignment
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/dispatch/resolution/" + id}><FontAwesomeIcon icon={faClipboardCheck} className="ml-1"  inverse /></Link>
      </OverlayTrigger>
      }
    <div style={{fontSize:"18px", marginTop:"10px"}}><b>Opened: </b><Moment format="MMMM Do YYYY, HH:mm">{data.start_time}</Moment>{data.end_time ? <span> | <b>Resolved: </b><Moment format="MMMM Do YYYY, HH:mm">{data.end_time}</Moment></span> : ""}</div>
    </Header>
    <hr/>
    <Row className="mb-3">
      <Col>
        <Card className="mt-1 border rounded" style={{minHeight:"313px", maxHeight:"313px"}}>
          <Card.Body>
            <Card.Title>
              <h4>{data.team_object ? data.team_object.name : "Preplanned"}
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
              <OverlayTrigger
                key={"add-team-member"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-add-team-member`}>
                    Add team member
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faUserPlus} className="ml-1 fa-move-up" size="sm" onClick={() => {setShow(true)}} style={{cursor:'pointer'}} inverse />
              </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            {data.team_member_objects && data.team_member_objects.length > 0 ?
            <Scrollbar no_shadow="true" style={{height:"225px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
                {data.team_member_objects.map(team_member => (
                  <ListGroup.Item key={team_member.id}>
                    {team_member.first_name + " " + team_member.last_name}{team_member.agency_id ?
                    <span>&nbsp;({team_member.agency_id})</span> : ""}
                    {team_member.display_phone ?
                    <OverlayTrigger
                      key={"owner-phone"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-owner-phone`}>
                          Phone: {team_member.display_phone}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faPhoneRotary} className="ml-1" inverse />
                    </OverlayTrigger>
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
      <Col className="border rounded pl-0 pr-0" style={{marginTop:"4px", marginRight:"15px", maxHeight:"311px"}}>
        <Map className="d-block dispatch-leaflet-container" bounds={data.bounds}>
          {data.assigned_requests.map(assigned_request => (
            <Marker
              key={assigned_request.service_request_object.id}
              position={[assigned_request.service_request_object.latitude, assigned_request.service_request_object.longitude]}
              icon={assigned_request.service_request_object.sheltered_in_place > 0 ? SIPMarkerIcon : assigned_request.service_request_object.unable_to_locate > 0 ? UTLMarkerIcon : reportedMarkerIcon}
            >
              <MapTooltip autoPan={false}>
                <span>
                  {mapState[assigned_request.service_request_object.id] ?
                    <span>
                      {Object.keys(mapState[assigned_request.service_request_object.id].matches).map((key,i) => (
                        <span key={key} style={{textTransform:"capitalize"}}>
                          {i > 0 && ", "}{prettyText(key.split(',')[1], key.split(',')[0], mapState[assigned_request.service_request_object.id].matches[key])}
                        </span>
                      ))}
                    </span>
                  :""}
                  <br />
                  SR#{assigned_request.service_request_object.id}: {assigned_request.service_request_object.full_address}
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
                SR#{assigned_request.service_request_object.id} -&nbsp;
                <Link href={"/" + incident + "/hotline/servicerequest/" + assigned_request.service_request_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{assigned_request.service_request_object.full_address}</Link>
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
                &nbsp;| {assigned_request.visit_note ? "Completed" : <span style={{textTransform:"capitalize"}}>{assigned_request.service_request_object.status}</span>} {assigned_request.visit_note ? <Moment format="[ on ]l[,] HH:mm">{assigned_request.visit_note.date_completed}</Moment> : ""}
              </h4>
            </Card.Title>
            <hr style={{marginBottom:"7px"}}/>
            <ListGroup variant="flush" style={{marginTop:"-5px", marginBottom:"-13px"}}>
              <ListGroup.Item>
                <b>Latitude: </b>{assigned_request.service_request_object.latitude}
                <br />
                <b>Longitude: </b>{assigned_request.service_request_object.longitude}
              </ListGroup.Item>
              {assigned_request.service_request_object.owner_objects.map(owner => (
                <ListGroup.Item key={owner.id}>
                  <b>Owner: </b><Link href={"/" + incident + "/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
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
                    <div><b>Contact Note: </b>{assigned_request.owner_contact.owner_contact_note}</div>
                  </span>
                  : ""}
                </ListGroup.Item>
              ))}
            {assigned_request.service_request_object.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
            <ListGroup.Item><b>Additional Information:</b> {assigned_request.service_request_object.directions||"No additional information available."}</ListGroup.Item>
          </ListGroup>
          <hr/>
          <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
            <h4 className="mt-2" style={{marginBottom:"-2px"}}>Animals</h4>
            {assigned_request.service_request_object.animals.filter(animal => Object.keys(assigned_request.animals).includes(String(animal.id))).map((animal, inception) => (
              <ListGroup.Item key={animal.id}>
                <span style={{textTransform:"capitalize"}}>A#{animal.id} - <Link href={"/" + incident + "/animals/" + animal.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.name||"Unknown"}</Link>&nbsp;-&nbsp;{animal.species}</span>
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
                    <FontAwesomeIcon icon={faBriefcaseMedical} className="ml-1 mr-1" size="sm" inverse />
                  </OverlayTrigger>
                : ""}
                {animal.pcolor || animal.scolor ? <span style={{textTransform:"capitalize"}}>({animal.pcolor ? animal.pcolor : "" }{animal.scolor ? <span>{animal.pcolor ? <span>, </span> : ""}{animal.scolor}</span> : ""})</span>: ""}
                &nbsp;- {animal.status}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {assigned_request.previous_visit ?
          <span>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <h4 className="mt-2" style={{marginBottom:"-2px"}}>Previous Visit: <Link href={"/" + incident + "/dispatch/summary/" + assigned_request.previous_visit.dispatch_assignment} className="text-link" style={{textDecoration:"none", color:"white"}}><Moment format="L">{assigned_request.previous_visit.date_completed}</Moment></Link></h4>
                <ListGroup.Item>
                  {assigned_request.previous_visit.notes || "No information available."}
                </ListGroup.Item>
            </ListGroup>
          </span>
          : "" }
          {assigned_request.visit_note ?
          <span>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <h4 className="mt-2" style={{marginBottom:"-2px"}}>Visit Notes</h4>
              <ListGroup.Item key={assigned_request.visit_note.id}>
                {assigned_request.visit_note.notes || "No information available."}
              </ListGroup.Item>
            </ListGroup>
          </span>
          : ""}
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
        />
        {error ? <div style={{ color: "#e74c3c", marginTop: "-8px", marginLeft: "16px", fontSize: "80%" }}>{error}</div> : ""}
      </Modal.Body>
      <Modal.Footer>
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
    </>
  )
}

export default DispatchSummary;
