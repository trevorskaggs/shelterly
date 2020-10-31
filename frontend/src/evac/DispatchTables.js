import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from '../components/Table';



export function DispatchTeamTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Dispatch Team',
        accessor: 'id',
        Cell: ({ cell: { value } }) =>
          <div><a href={"/dispatch/dispatchteam/"+value+"/"}>Dispatch Team {value}</a></div>
      },
      {
        Header: 'Team Members',
        accessor: 'dispatch_team_member_names',
      }
    ],
    []
  )
  const [data, setData] = useState({dispatch_teams: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchDispatchTeams = async () => {
      setData({dispatch_teams: [], isFetching: true});
      // Fetch DispatchTeam data.
      await axios.get('http://localhost:8000/dispatch/api/dispatchteam/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({dispatch_teams: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({dispatch_teams: [], isFetching: false});
      });
    };
    fetchDispatchTeams();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <div>
      <Table columns={columns} data={data.dispatch_teams}/>
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}
