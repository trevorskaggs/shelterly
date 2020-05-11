import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import 'bootstrap/dist/css/bootstrap.min.css';
import Moment from 'react-moment';

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
    // drivers_license: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchOwnerData = async () => {
      // Fetch Person data.
      await axios.get('http://localhost:3000/people/api/person/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchOwnerData();
  }, [id]);

  return (
    <>
      <h1 style={header_style}>{is_owner ? "Owner" : "Reporter"} Details</h1>
      <br/>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p><b>Name:</b> {data.first_name} {data.last_name}</p>
            <p><b>Phone:</b> {data.phone ? <span>{data.phone}</span> : 'N/A'}</p>
            <p><b>Email:</b> {data.email ? <span>{data.email}</span> : 'N/A'}</p>
            <p><b>Best Contact:</b> {data.best_contact ? <span>{data.best_contact}</span> : 'N/A'}</p>
            <p><b>Address:</b> {data.address ? <span>{data.full_address}</span> : 'N/A'}</p>
          </div>
          <div className="col-4">
          </div>
        </div>
      </div>
      <hr/>
      <div style={btn_style}>
        {is_owner ?
        <Link href={"/hotline/owner/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT OWNER</Link> :
        <Link href={"/hotline/reporter/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT REPORTER</Link>}
        <br/>
        <br/>
        <Link className="btn btn-secondary btn-lg btn-block"  href="/hotline/servicerequest/">BACK</Link>
      </div>
    </>
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
      await axios.get('http://localhost:3000/hotline/api/servicerequests/' + id + '/', {
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
      <h1 style={header_style}>Service Request #{data.id} - {data.status}</h1>
      <br/>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-8">
            <p><b>Owner:</b> {data.owner ? <span>{data.owner_name}</span> : 'N/A'}</p>
            <p><b>Reporter:</b> {data.reporter ? <span>{data.reporter_name}</span> : 'N/A'}</p>
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
        <p><b>Animals:</b></p>
         <span>{data.animals.map(animal => (<li key={animal.id}>{animal.name} ({animal.species}) - {animal.status}<Link href={"/animals/animal/" + animal.id} className="btn btn-sm btn-danger ml-1 mb-1">Details</Link></li>))}</span> 
      </div> : ""}
      <hr/>
      <div style={btn_style}>
        <Link href="/animals/dog/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD DOG</Link>
        <Link href="/animals/cat/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD CAT</Link>
        <Link href="/animals/horse/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD HORSE</Link>
        <Link href="/animals/other/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD OTHER</Link>
        <br/>
        {data.owner ? <Link href={"/hotline/owner/edit/" + data.owner +"?servicerequest_id=" + id} style={link_style} className="btn btn-success btn-lg btn-block mb-2">EDIT OWNER</Link> : <Link href={"/hotline/owner/new?servicerequest_id=" + id} style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD OWNER</Link>}
        <Link href={"/hotline/servicerequest/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">UPDATE REQUEST</Link>
        <br/>
        <br/>
        <Link className="btn btn-secondary btn-lg btn-block"  href="/hotline">BACK</Link>
      </div>
    </>
  );
};
