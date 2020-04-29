import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useQueryParams } from 'raviger';
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const columns = [
  {
    dataField: 'id',
    text: 'SR',
  }, 
  {
    dataField: 'owner_name',
    text: 'Owner'
  },
  {
    dataField: 'reporter_name',
    text: 'Reporter'
  },
]

export function ServiceRequestTable() {

  const [data, setData] = useState({service_requests: [], isFetching: false});

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
  } = queryParams;

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      setData({service_requests: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('http://localhost:8000/hotline/api/servicerequests/?search=' + search, {
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
  }, [search]);

  return (
    <div>
      <BootstrapTable keyField='id' data={ data.service_requests } columns={columns}/>
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}
