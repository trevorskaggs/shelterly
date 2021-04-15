import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, Col, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardCheck, faEdit, faEnvelope, faMinusSquare, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import { faPhoneRotary } from '@fortawesome/pro-solid-svg-icons';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import Map, { countMatches, prettyText, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';

function DispatchSummary({id}) {

  // Initial animal data.
  const [data, setData] = useState({
    team_members: [],
    team_member_objects: [],
    team: null,
    team_object: {name:''},
    service_requests: [],
    service_request_objects: [],
    start_time: null,
    end_time: null,
    bounds:L.latLngBounds([[0,0]])
  });

  const [mapState, setMapState] = useState({});
  const [teamData, setTeamData] = useState({options: [], isFetching: false});
  const [teamMembers, setNewTeamMembers] = useState(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState({id: 0, name: '', display_name: ''});
  const [showTeamMemberConfirm, setShowTeamMemberConfirm] = useState(false);
  const handleTeamMemberClose = () => setShowTeamMemberConfirm(false);

  const handleAddTeamMemberSubmit = async () => {
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'new_team_members':teamMembers.map(item => item.id)})
    .then(response => {
      setData(prevState => ({ ...prevState, "team_member_objects":response.data.team_member_objects, "team_members":response.data.team_members }));
      setTeamData(prevState => ({ ...prevState, "options":prevState.options.filter(option => !response.data.team_members.includes(option.id)) }));
      handleClose()
    })
    .catch(error => {
    });
  }

  const handleRemoveTeamMemberSubmit = async () => {
    await axios.patch('/evac/api/dispatchteam/' + data.team + '/', {'remove_team_member':teamMemberToDelete.id})
    .then(response => {
      setData(prevState => ({ ...prevState, "team_member_objects":response.data.team_member_objects, "team_members":response.data.team_members }));
      setTeamData(prevState => ({ ...prevState, "options":prevState.options.concat([{id: teamMemberToDelete.id, label: teamMemberToDelete.display_name}]) }));
      handleTeamMemberClose();
    })
    .catch(error => {
    });
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
          for (const service_request of response.data.service_request_objects) {
            const matches = countMatches(service_request)[0];
            map_dict[service_request.id] = {matches:matches, has_reported_animals:service_request.reported_animals > 0, latitude:service_request.latitude, longitude:service_request.longitude};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          response.data['team_members'] = response.data.team.team_members;
          response.data['team_member_objects'] = response.data.team_object.team_member_objects
          response.data['bounds'] = bounds.length > 0 ? bounds : L.latLngBounds([[0,0]]);
          setData(response.data);
          setMapState(map_dict);
          setTeamData({options: [], isFetching: true});
          axios.get('/evac/api/evacteammember/', {
            cancelToken: source.token,
          })
          .then(teamResponse => {
            let options = [];
            teamResponse.data.filter(team_member => !response.data.team_object.team_members.includes(team_member.id)).forEach(function(teammember){
              options.push({id: teammember.id, label: teammember.display_name})
            });
            setTeamData({options: options, isFetching: false});
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
        <Link href={"/dispatch/resolution/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
      :
      <OverlayTrigger
        key={"close-dispatch-assignment"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-close-dispatch-assignment`}>
            Close dispatch assignment
          </Tooltip>
        }
      >
        <Link href={"/dispatch/resolution/" + id}><FontAwesomeIcon icon={faClipboardCheck} className="ml-1"  inverse /></Link>
      </OverlayTrigger>
      }
    <div style={{fontSize:"18px", marginTop:"12px"}}><b>Opened: </b><Moment format="MMMM Do YYYY, HH:mm">{data.start_time}</Moment>{data.end_time ? <span> | <b>Closed: </b><Moment format="MMMM Do YYYY, HH:mm:ss">{data.end_time}</Moment></span> : ""}</div>
    </Header>
    <hr/>
    <Row className="mb-3">
      <Col>
        <Card border="secondary" className="mt-1" style={{minHeight:"313px", maxHeight:"313px"}}>
          <Card.Body>
            <Card.Title>
              <h4>{data.team_object.name}
              <OverlayTrigger
                key={"add-team-member"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-add-team-member`}>
                    Add team member
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faPlusSquare} className="ml-1" onClick={() => {setShow(true)}} style={{cursor:'pointer'}} inverse />
              </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            <Scrollbar no_shadow="true" style={{height:"225px"}}>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
                {data.team_member_objects.map(team_member => (
                  <ListGroup.Item key={team_member.id}>
                    {team_member.first_name + " " + team_member.last_name + " - " + team_member.display_phone}{team_member.agency ?
                    <span>({team_member.agency})</span> : ""}
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
            </Scrollbar>
          </Card.Body>
        </Card>
      </Col>
      <Col className="border rounded pl-0 pr-0" style={{marginTop:"4px", marginRight:"15px", maxHeight:"311px"}}>
        <Map className="d-block dispatch-leaflet-container" bounds={data.bounds}>
          {data.service_request_objects.map(service_request => (
            <Marker
              key={service_request.id}
              position={[service_request.latitude, service_request.longitude]}
              icon={service_request.sheltered_in_place > 0 ? SIPMarkerIcon : service_request.unable_to_locate > 0 ? UTLMarkerIcon : reportedMarkerIcon}
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
                </span>
              </MapTooltip>
            </Marker>
          ))}
        </Map>
      </Col>
    </Row>
    {data.service_request_objects.map((service_request, index) => (
    <Row key={service_request.id}>
      <Card border="secondary" className="mb-3 ml-3 mr-3" style={{width:"100%"}}>
        <Card.Body>
          <Card.Title>
            <h4>
              <Link href={"/hotline/servicerequest/" + service_request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{service_request.full_address}</Link>
              &nbsp;| <span style={{textTransform:"capitalize"}}>{service_request.status}</span>
            </h4>
          </Card.Title>
          <hr style={{marginBottom:"7px"}}/>
          <ListGroup variant="flush" style={{marginTop:"-5px", marginBottom:"-13px"}}>
            {service_request.owner_objects.map(owner => (
              <ListGroup.Item key={owner.id}>
                <b>Owner: </b><Link href={"/people/owner/" + owner.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{owner.first_name} {owner.last_name}</Link>
                {owner.display_phone ?
                <OverlayTrigger
                  key={"owner-phone"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-owner-phone`}>
                      {owner.display_phone}
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
                      {owner.email}
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faEnvelope} className="ml-1" inverse />
                </OverlayTrigger>
                : ""}
              </ListGroup.Item>
            ))}
            {service_request.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
          </ListGroup>
          <hr/>
          <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
            <h4 className="mt-2" style={{marginBottom:"-2px"}}>Animals</h4>
            {service_request.animals.filter(animal => animal.evacuation_assignments.includes(Number(id))).map((animal, inception) => (
              <ListGroup.Item key={animal.id}>
                <span style={{textTransform:"capitalize"}}>#{animal.id} - <Link href={"/animals/" + animal.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.name||"Unknown"}</Link> ({animal.species})</span> - {animal.status}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {!service_request.visit_notes.filter(note => String(note.evac_assignment) === String(id))[0] && service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0] ?
          <span>
            <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <h4 className="mt-2" style={{marginBottom:"-2px"}}>Previous Visit: <Link href={"/dispatch/summary/" + service_request.latest_evac.id} className="text-link" style={{textDecoration:"none", color:"white"}}><Moment format="L">{service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0].date_completed}</Moment></Link></h4>
                <ListGroup.Item>
                {service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0].notes || "No information available."}
                </ListGroup.Item>
            </ListGroup>
          </span>
          : "" }
          {service_request.visit_notes.filter(note => String(note.evac_assignment) === String(id))[0] ?
          <span>
          <hr/>
            <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
              <h4 className="mt-2" style={{marginBottom:"-2px"}}>Visit Notes</h4>
              {service_request.visit_notes.filter(note => String(note.evac_assignment) === String(id)).map((note) => (
                <ListGroup.Item key={note.id}>
                  {note.notes || "No information available."}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </span>
          : ""}
        </Card.Body>
      </Card>
    </Row>
    ))}
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Team Members</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Typeahead
          id="team_members"
          multiple
          onChange={(values) => {setNewTeamMembers(values)}}
          options={teamData.options}
          placeholder="Choose team members..."
          style={{marginLeft:"3px", marginRight:"-13px"}}
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
