import React, {useEffect, useState} from 'react';
import axios from "axios";
import { Link } from 'raviger';
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
  }, [id]);

  return (
    <>
      {data.reporter ? <p><b>Reporter:</b> {data.reporter_name}</p> : ''}
      {data.owner ? <p><b>Owner:</b> {data.owner_name}</p> : ''}
      <p><b>Directions:</b> {data.directions}</p>
      <p><b>Verbal Permission:</b> {String(data.verbal_permission)}</p>
      <p><b>Key Provided:</b> {String(data.key_provided)}</p>
      <p><b>Accessible:</b> {String(data.accessible)}</p>
      <p><b>Turn Around:</b> {String(data.turn_around)}</p>
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
