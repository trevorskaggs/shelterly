import React, { useEffect, useState } from 'react';
import axios from "axios";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { A } from "hookrouter";
import { BuildingList } from "./Building";


export function ShelterDetailsTable({sid}) {
  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    console.log('shelter: ' + sid)
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
    // Fetch Shelter Details data.
    await axios.get('http://localhost:8000/shelter/api/shelter/' + sid + '/', {
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
  }, [sid]);

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
      <h3>Shelter Buildings</h3>
      <BuildingList sid={data.id} />
      <hr/>
      <A className="btn btn-secondary btn-lg btn-block"  href="/shelter/list">BACK</A>
    </>
  );
};

export function BuildingDetailsTable({bid}) {
  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    console.log('builing: ' + bid)
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
    // Fetch Shelter Details data.
    await axios.get('http://localhost:8000/shelter/api/building/' + bid, {
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
  }, [bid]);

  return (
    <>
      <p><b>Name:</b> {String(data.name)}</p>
      <p><b>Shelter:</b> {String(data.shelter)}</p>
      <p><b>Description:</b> {String(data.description)}</p>
      <hr/>
      <h3>Building Rooms</h3>
      <hr/>
      <A className="btn btn-secondary btn-lg btn-block"  href="/shelter/list">BACK</A>
    </>
  );
};