import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, } from 'raviger';
import Table from '../components/Table';
import { Input } from 'reactstrap';
import Moment from 'react-moment';
import 'bootstrap/dist/css/bootstrap.min.css';

export function ServiceRequestTable() {

  const columns = React.useMemo(
    () => [
      {
        accessor: 'id',
        Cell: ({ cell: { value } }) =>
          <Link href={"/hotline/servicerequest/" + value} className="btn btn-primary">SR Details</Link>
      },
      {
        accessor: 'timestamp',
        Cell: ({ cell: { value } }) =>
          <Moment format="LLL">{value}</Moment>
      },
      {
        accessor: 'owner_name',
        Cell: props =>
        <>
            {props.data[props.row.index].owner ? <div className='owner'>Owner: <Link href={"/people/person/" + props.data[props.row.index].owner} className="btn btn-sm btn-success mb-1">{props.data[props.row.index].owner_name}</Link></div> : ""}
            {props.data[props.row.index].reporter ? <div className='reporter'>Reporter: <Link href={"/people/person/" + props.data[props.row.index].owner} className="btn btn-sm btn-success">{props.data[props.row.index].reporter_name}</Link></div> : ""}
        </>
      },
      // {
      //   accessor: 'full_address',
      // },
      {
        accessor: 'animals',
        Cell: props =>
        <>
          {props.data[props.row.index].animals.map(animal => (<span key={animal.id}>{<Link href={"/animals/animal/" + animal.id} className="btn btn-sm btn-danger">{animal.name}</Link>}</span>))}
        </>
      },
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

  // const TheadComponent = props => null;

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
      <Table data={data.service_requests} columns={columns} />
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}
