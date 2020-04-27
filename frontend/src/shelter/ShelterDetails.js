import React, { useEffect, useState } from 'react';
import axios from "axios";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { A } from "hookrouter";


export function ShelterDetailsTable({id}) {
  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    console.log('react url: ' + id)
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
    // Fetch Shelter Details data.
    await axios.get('http://localhost:8000/shelter/api/shelter/' + id + '/', {
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
    fetchShelterData();
  }, [id]);

  return (
    <>
      <p><b>Name:</b> {String(data.name)}</p>
      <p><b>Adress:</b> {String(data.address)}</p>
      <p><b>City:</b> {String(data.city)}</p>
      <p><b>State:</b> {String(data.state)}</p>
      <p><b>Zip:</b> {String(data.zip_code)}</p>
      <p><b>Description:</b> {String(data.description)}</p>
      <p><b>Image:</b> {String(data.image)}</p>
      <hr/>
      <A className="btn btn-secondary btn-lg btn-block"  href="http://localhost:3000/shelter/list">BACK</A>
    </>
  );
};