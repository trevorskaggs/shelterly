import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from '.././components/Table';



export function EvacTeamTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Evac Team',
        accessor: 'id',
        Cell: ({ cell: { value } }) =>
          <div><a href={"/evac/evacteam/"+value+"/"}>Evac Team {value}</a></div>
      },
      {
        Header: 'Team Members',
        accessor: 'evac_team_member_names',
      }
    ],
    []
  )
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
      <Table columns={columns} data={data.evac_teams}/>
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}
