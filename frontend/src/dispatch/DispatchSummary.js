import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit
} from '@fortawesome/free-solid-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';

function DispatchSummary({id}) {

  // Initial animal data.
  const [data, setData] = useState({
    team_members: [],
    team_member_objects: [],
    service_requests: [],
    service_request_objects: [],
    start_time: null,
    end_time: null,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchDispatchSummaryData = async () => {
      // Fetch Animal data.
      await axios.get('/evac/api/evacassignment/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchDispatchSummaryData();
  }, [id]);

  return (
    <>
    <Header>Dispatch Assignment Summary {data.end_time ? <span><Link href={"/dispatch/resolution/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link></span> : <Link href={"/dispatch/resolution/" + id} className="btn btn-danger ml-1" style={{paddingTop:"10px", paddingBottom:"10px"}}>Close</Link>}
    <div style={{fontSize:"18px", marginTop:"12px"}}><b>Opened: </b><Moment format="MMMM Do YYYY, HH:mm">{data.start_time}</Moment>{data.end_time ? <span> | <b>Closed: </b><Moment format="MMMM Do YYYY, HH:mm:ss">{data.end_time}</Moment></span> : ""}</div>
    </Header>
    <hr/>
    <Card border="secondary" className="mt-1">
      <Card.Body>
        <Card.Title>
          <h4>Team Members</h4>
        </Card.Title>
        <hr/>
        <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px", textTransform:"capitalize"}}>
          {data.team_member_objects.map(team_member => (
            <ListGroup.Item key={team_member.id}>
              {team_member.first_name + " " + team_member.last_name + " - " + team_member.display_phone}{team_member.agency ? <span>({team_member.agency})</span> : ""}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
    {data.service_request_objects.map((service_request, index) => (
    <Card key={service_request.id} border="secondary" className="mt-3 mb-2">
      <Card.Body>
        <Card.Title>
          <h4>Service Request <Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> | <span style={{textTransform:"capitalize"}}>{service_request.status}</span></h4>
        </Card.Title>
        <hr/>
        <ListGroup variant="flush" style={{marginTop:"-5px", marginBottom:"-13px"}}>
          <ListGroup.Item style={{marginTop:"-8px"}}><b>Address: </b>{service_request.full_address}</ListGroup.Item>
          {service_request.owner_objects.map(owner => (
            <ListGroup.Item key={owner.id}><b>Owner: </b>{owner.first_name} {owner.last_name} | {owner.display_phone||owner.email||"No Contact"}</ListGroup.Item>
          ))}
          {service_request.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
        </ListGroup>
        <hr/>
        <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
          <h4 className="mt-2" style={{marginBottom:"-2px"}}>Animals</h4>
          {service_request.animals.filter(animal => animal.evacuation_assignments.includes(Number(id))).map((animal, inception) => (
            <ListGroup.Item key={animal.id}>
              <span style={{textTransform:"capitalize"}}>{animal.name||"Unknown"}</span> ({animal.species}) - {animal.status}
            </ListGroup.Item>
          ))}
        </ListGroup>
        {!data.end_time && service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0].date_completed ?
        <span>
          <hr/>
          <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
            <h4 className="mt-2" style={{marginBottom:"-2px"}}>Previous Visit Notes on <Moment format="L">{service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0].date_completed}</Moment></h4>
              <ListGroup.Item>
              {service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0].notes || "No information available."}
              </ListGroup.Item>
          </ListGroup>
        </span>
        : "" }
        {service_request.visit_notes.filter(note => String(note.evac_assignment) === String(id))[0].date_completed ?
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
    ))}
    </>
  )
}

export default DispatchSummary;
