import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from '../components/Table';
import { Input } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export function ServiceRequestTable() {

  const columns = React.useMemo(
    () => [
      {
        Header: 'SR',
        accessor: 'id'
      },
      {
        Header: 'Owner',
        accessor: 'owner_name'
      },
      {
        Header: 'Reporter',
        accessor: 'reporter_name'
      },
      // {
      //   Header: 'Team Members',
      //   accessor: 'evac_team_member_names',
      //   Cell: ({ cell: { value } }) =>
      //     <div><a href={"/evac/evacteam/"+value+"/"}>Evac Team {value}</a></div>
      // }
    ],
    []
  )

  const [data, setData] = useState({service_requests: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  // Use searchTerm to filter service_requests.
  const handleSubmit = async event => {
    event.preventDefault();

    let source = axios.CancelToken.source();
    setData({service_requests: [], isFetching: true});
    // Fetch ServiceRequest data filtered searchTerm.
    await axios.get('http://localhost:8000/hotline/api/servicerequests/?search=' + searchTerm, {
      cancelToken: source.token,
    })
    .then(response => {
      setData({service_requests: response.data, isFetching: false});
    })
    .catch(error => {
      console.log(error.response);
      setData({service_requests: [], isFetching: false});
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      setData({service_requests: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('http://localhost:8000/hotline/api/servicerequests/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({service_requests: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({service_requests: [], isFetching: false});
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <div>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Search"
            name="searchTerm"
            value={searchTerm}
            onChange={handleChange}
          />
        <button className="btn btn-warning btn-lg btn-block mb-2">Search!</button>
        </form>
      <Table data={data.service_requests} columns={columns}/>
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}
