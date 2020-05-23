import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from '.././components/Table';
import { Link } from 'raviger';
import { ShelterDetailsTable } from "./ShelterDetails";

const header_style = {
  textAlign: "center",
};

const link_style = {
  textDecoration: "none",
};

export function ShelterTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Shelters',
        accessor: 'id',
        Cell: ({ cell: { value } }) =>
          <div><a href={"/shelter/"+value}>{value}</a></div>
      },
      {
        Header: 'Name',
        accessor: 'name',
      }
    ],
    []
  )
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
      .catch(error => {
        console.log(error.response);
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
      <Table keyField='id' data={ data.shelters } columns={columns}/>
      <p>{data.isFetching ? 'Fetching shelters...' : ''}</p>
      <br/>
      <br/>
      <Link href="/shelter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">CREATE NEW SHELTER</Link>
      <Link className="btn btn-secondary btn-lg btn-block"  href="/shelter">BACK</Link>
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
