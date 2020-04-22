import React, {useEffect, useState} from 'react';
import axios from "axios";
import { A, navigate } from "hookrouter";
import 'bootstrap/dist/css/bootstrap.min.css';

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const link_style = {
  textDecoration: "none",
};

export function ServiceRequestView({id}) {

  const [data, setData] = useState({});

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
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
    };
    fetchServiceRequestData();
  }, []);

  return (
    <>
      {data.reporter ? <p><b>Reporter:</b> {data.reporter}</p> : ''}
      {data.owner ? <p><b>Owner:</b> {data.owner}</p> : ''}
      <p><b>Directions:</b> {data.directions}</p>
      <p><b>Verbal Permission:</b> {String(data.verbal_permission)}</p>
      <p><b>Key Provided:</b> {String(data.key_provided)}</p>
      <p><b>Accessible:</b> {String(data.accessible)}</p>
      <p><b>Turn Around:</b> {String(data.turn_around)}</p>
      <div style={btn_style}>
        <A href="/animals/dog/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD DOG</A>
        <A href="/animals/cat/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD CAT</A>
        <A href="/animals/horse/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD HORSE</A>
        <A href="/animals/other/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD OTHER</A>
        <br/>
        {data.owner ? <A href={"/hotline/owner/edit/" + data.owner.id} style={link_style} className="btn btn-success btn-lg btn-block mb-2">EDIT OWNER</A> : <A href="/hotline/owner/new" style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD OWNER</A>}
        <A href={"/hotline/servicerequest/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">UPDATE REQUEST</A>
        <br/>
        <br/>
        <A className="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
      </div>
    </>
  );
};
