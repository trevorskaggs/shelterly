import React, { useEffect, useState } from 'react';
import axios from "axios";
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { A } from "hookrouter";
import { ShelterDetailsTable } from "./ShelterDetails";

const header_style = {
  textAlign: "center",
};

const link_style = {
  textDecoration: "none",
};

function CellFormatter(cell) {
  return (<div><a href={"/shelter/"+cell}>shelter {cell}</a></div>);
}

const columns = [
  {
    dataField: 'id',
    text: 'Shelter Id',
    formatter: CellFormatter
  },
  {
    dataField: 'name',
    text: 'Name',
  }, 
  {
    dataField: 'address',
    text: 'Address'
  },
]

export function ShelterTable() {
  const [data, setData] = useState({shelters: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchEvacTeams = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch EvacTeam data.
      await axios.get('http://localhost:8000/shelter/api/shelter', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({shelters: response.data, isFetching: false});
      })
      .catch(e => {
        console.log(e);
        setData({shelters: [], isFetching: false});
      });
    };
    fetchEvacTeams();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <div>
      <BootstrapTable keyField='id' data={ data.shelters } columns={columns}/>
      <p>{data.isFetching ? 'Fetching shelters...' : ''}</p>
      <br/>
      <br/>
      <A href="/shelter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW SHELTER</A>
      <A className="btn btn-secondary btn-lg btn-block"  href="/shelter">BACK</A>
    </div>
  )
}

export const ShelterDetails = ({sid}) => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <br/>
    <ShelterDetailsTable sid={sid} />
  </div>
)
