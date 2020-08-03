import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import Moment from 'react-moment';
import { Card, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const link_style = {
  textDecoration: "none",
};

const card_style = {
  width: "90%",
}

const header_style = {
  textAlign: "center",
}

export function PersonView({id}) {

  // Determine if this is an owner or reporter when creating a Person.
  var is_owner = window.location.pathname.includes("owner")

  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    best_contact: '',
    agency: '',
    drivers_license: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchPersonData = async () => {
      // Fetch Person data.
      await axios.get('/people/api/person/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchPersonData();
  }, [id]);

  return (
      <Card className="d-flex" border="primary">
      <Card.Body>
        {is_owner ?
        <Card.Title>Owner Details<Link href={"/hotline/owner/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link></Card.Title>
        :
        <Card.Title>Reporter Details <Link href={"/hotline/reporter/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link></ Card.Title>
        }
        <ListGroup variant="flush">
            <ListGroup.Item>Name: {data.first_name} {data.last_name}</ListGroup.Item>
            <ListGroup.Item>Phone: {data.phone ? data.phone : 'N/A' }</ListGroup.Item>
            <ListGroup.Item>Email: {data.email ? data.email : 'N/A'}</ListGroup.Item>
            {data.best_contact ? 
              <ListGroup.Item>Best Contact: {data.best_contact}</ListGroup.Item>: ''}
            {data.agency ? 
              <ListGroup.Item>Agency: {data.agency}</ListGroup.Item>: ''}
            <ListGroup.Item>Address: {data.address ? data.full_address: 'N/A'}</ListGroup.Item>
          </ListGroup>
        <Card.Footer>
        <Link href="/hotline/">BACK</Link>
        </Card.Footer>
      </Card.Body>
      </Card>
  );
};

export function ServiceRequestView({id}) {

  const [data, setData] = useState({
    owner: '',
    reporter: '',
    directions: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    verbal_permission: false,
    key_provided: false,
    accessible: false,
    turn_around: false,
    forced_entry: false,
    outcome: '',
    owner_notification_notes: '',
    recovery_time: null,
    owner_notification_tstamp: null,
    status:'',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequestData = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchServiceRequestData();
  }, [id]);

  return (
    <>
      <h1 style={header_style}>Service Request #{data.id}<Link href={"/hotline/servicerequest/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link> - {data.status}</h1>
      <br/>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p className="mb-3"><b>Owner:</b> {data.owner ? <span>{data.owner_object.first_name} {data.owner_object.last_name} {data.owner_object.first_name === 'Unknown' ? "":<Link href={"/hotline/owner/" + data.owner}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>}<Link href={"/hotline/owner/edit/" + data.owner}> <FontAwesomeIcon icon={faEdit} inverse /></Link></span>:""}</p>
            <p className="mb-3"><b>Reporter:</b> {data.reporter ? <span>{data.reporter_object.first_name} {data.reporter_object.last_name} <Link href={"/hotline/reporter/" + data.reporter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link><Link href={"/hotline/reporter/edit/" + data.reporter}> <FontAwesomeIcon icon={faEdit} inverse /></Link></span> : 'N/A'}</p>
            <p><b>Address:</b> {data.address ? <span>{data.full_address}</span> : 'N/A'}</p>
            <p><b>Directions:</b> {data.directions}</p>
          </div>
          <div className="col-4">
            <p><b>Verbal Permission:</b> {String(data.verbal_permission)}</p>
            <p><b>Key Provided:</b> {String(data.key_provided)}</p>
            <p><b>Accessible:</b> {String(data.accessible)}</p>
            <p><b>Turn Around:</b> {String(data.turn_around)}</p>
          </div>
        </div>
      </div>
      {data.outcome ?
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p><b>Outcome:</b> {data.outcome}</p>
            {data.owner_notification_notes ? <p><b>Owner Notification Notes:</b> {data.owner_notification_notes}</p> : ''}
            {data.recovery_time ? <p><b>Recovery Time:</b> <Moment format="LLL">{data.recovery_time}</Moment></p> : ''}
            {data.owner_notification_tstamp ? <p><b>Owner Notified:</b> <Moment format="LLL">{data.owner_notification_tstamp}</Moment></p> : ''}
          </div>
          <div className="col-4">
            <p><b>Forced Entry:</b> {String(data.forced_entry)}</p>
          </div>
        </div>
      </div> : ""}
      {data.animals && data.animals.length ?
      <div style={card_style} className="card card-body bg-light mx-auto">
        <p><b>Animals:</b> <Link href={"/animals/animal/new?servicerequest_id=" + id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link></p>
         <span>
          {data.animals.map(animal => (
            <li key={animal.id}>{animal.name} (<span style={{textTransform:"capitalize"}}>{animal.species}</span>) - {animal.status}
              <Link href={"/animals/animal/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
              <Link href={"/animals/animal/edit/" + animal.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
            </li>
          ))}
        </span>
      </div> : ""}
      <hr/>
      <div style={btn_style}>
        <Link href={"/animals/animal/new?servicerequest_id=" + id} style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD ANIMAL</Link>
        <br/>
        <Link href={"/hotline/servicerequest/edit/" + id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">UPDATE REQUEST</Link>
        <br/>
        <br/>
        <Link className="btn btn-secondary btn-lg btn-block"  href="/hotline">BACK</Link>
      </div>
    </>
  );
};
