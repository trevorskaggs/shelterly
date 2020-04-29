import React, { useEffect, useState } from 'react';
import axios from "axios";
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

function CellFormatter(cell) {
  return (<div><a href={"/evac/evacteam/"+cell+"/"}>Evac Team {cell}</a></div>);
}

const columns = [
  {
    dataField: 'id',
    text: 'Evac Team',
    formatter: CellFormatter
  }, 
  {
    dataField: 'evac_team_member_names',
    text: 'Team Members'
  },
]

export function EvacTeamTable() {
  const [data, setData] = useState({evac_teams: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchEvacTeams = async () => {
      setData({evac_teams: [], isFetching: true});
      // Fetch EvacTeam data.
      await axios.get('http://localhost:8000/evac/api/evacteam/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({evac_teams: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({evac_teams: [], isFetching: false});
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
      <BootstrapTable keyField='id' data={ data.evac_teams } columns={columns}/>
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}
