import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
import Moment from 'react-moment';
import { Fab } from '@material-ui/core';
import AssignmentIcon from '@material-ui/icons/Assignment';
import EditIcon from '@material-ui/icons/Edit';

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

export function AnimalView({id}) {

  // Initial animal data.
  const [data, setData] = useState({
    owner: null,
    request: null,
    name: '',
    species: '',
    sex: '',
    size: '',
    age: '',
    pcolor: '',
    scolor: '',
    color_notes: '',
    fixed: 'unknown',
    aggressive: 'unknown',
    confined: 'unknown',
    attended_to: 'unknown',
    collared: 'unknown',
    behavior_notes: '',
    last_seen: null,
  });

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchAnimalData = async () => {
      // Fetch Animal data.
      await axios.get('/animals/api/animal/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error.response);
      });
    };
    fetchAnimalData();
  }, [id]);

  return (
    <>
      <h1 style={header_style}>
        Animal Details - {data.status} <Fab color="primary" size="small" href={"/animals/animal/edit/" + id} className="mb-2" title="Edit animal" aria-label="edit"><EditIcon /></Fab>
      </h1>
      <br/>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-6">
            <p><b>Name:</b> {data.name}</p>
            <p><b>Species:</b> {data.species}</p>
            <p><b>Age:</b> {data.age||"Unknown"}</p>
            <p><b>Sex:</b> {data.sex||"Unknown"}</p>
            <p><b>Size:</b> {data.size||"Unknown"}</p>
            {data.last_seen ? <p><b>Last Seen:</b> <Moment format="LLL">{data.last_seen}</Moment></p> : ""}
            {data.pcolor ? <p><b>Primary Color:</b> {data.pcolor}</p> : ""}
            {data.scolor ? <p><b>Secondary Color:</b> {data.scolor}</p> : ""}
            {data.color_notes ? <p><b>Color Notes:</b> {data.color_notes}</p> : ""}
            {data.behavior_notes ? <p><b>Behavior Notes:</b> {data.behavior_notes}</p> : ""}
          </div>
          <div className="col-6">
            <p><b>Fixed:</b> {data.fixed}</p>
            <p><b>Aggressive:</b> {data.aggressive}</p>
            <p><b>Confined:</b> {data.confined}</p>
            <p><b>Attended To:</b> {data.attended_to}</p>
            <p><b>Collared:</b> {data.collared}</p>
          </div>
        </div>
      </div>
      <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
        <div className="row">
          <div className="col-10">
            {data.request ? <div><b>Request #{data.request}</b> <Fab color="primary" href={"/hotline/servicerequest/" + data.request} className="mb-1" style={{width:23,height:23, minHeight:23}} title="request details" aria-label="request_details"><AssignmentIcon style={{fontSize:10}} /></Fab></div> : ""}
            {data.owner ? <div><b>Owner:</b> {data.owner_object.first_name} {data.owner_object.last_name} {data.owner_object.phone} {data.owner_object.first_name !== 'Unknown' ? <Fab href={"/hotline/owner/" + data.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Owner details" aria-label="owner_details"><AssignmentIcon style={{fontSize:10}} /></Fab> : <Fab href={"/hotline/owner/edit/" + data.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Edit Owner" aria-label="edit_owner"><EditIcon style={{fontSize:10}} /></Fab>}</div> : ""}
            <div><b>Location:</b> {data.full_address ? data.full_address : "Unknown"}</div>
          </div>
        </div>
      </div>
      <hr/>
      <div style={btn_style}>
        <Link href={"/animals/animal/edit/" + id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT ANIMAL</Link>
        <br/>
        <br/>
        <Link className="btn btn-secondary btn-lg btn-block" href="/hotline/">BACK</Link>
      </div>
    </>
  );
};
