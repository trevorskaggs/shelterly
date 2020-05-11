import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, } from 'raviger';
import Table from '../components/Table';
import { Button, ButtonGroup, Input, Form } from 'reactstrap';

import Moment from 'react-moment';
import './HotlineStyles.css'

const input_style = {
  width: "40%",
  display: "inline-block",
  position: 'relative',
}

export function ServiceRequestTable() {

  const columns = React.useMemo(
    () => [
      {
        accessor: 'owner_name',
        Cell: props =>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-2">
              <b>Service Request #{props.data[props.row.index].id}</b>
              <div className="mt-1 mb-1"><Moment format="LLL">{props.data[props.row.index].timestamp}</Moment></div>
              <Link href={"/hotline/servicerequest/" + props.data[props.row.index].id} className="btn btn-sm btn-primary">Details</Link>
            </div>
            <div className="col-sm">
            <b>Contacts:</b>
              <li className='owner'>Owner: {props.data[props.row.index].owner ? <span>{props.data[props.row.index].owner_name} (555) 555 5555<Link href={"/hotline/owner/" + props.data[props.row.index].owner} className="btn btn-sm btn-success ml-1 mb-1">Details</Link></span> : "N/A"}</li>
              <li className='reporter'>Reporter: {props.data[props.row.index].reporter ? <span>{props.data[props.row.index].reporter_name} (555) 555 5555<Link href={"/hotline/reporter/" + props.data[props.row.index].reporter} className="btn btn-sm btn-success ml-1">Details</Link></span> : "N/A"}</li>
            </div>
            <div className="col-sm">
            <b>Animals:</b> {props.data[props.row.index].animals && props.data[props.row.index].animals.length ? <span>{props.data[props.row.index].animals.map(animal => (<li key={animal.id}>{animal.name} ({animal.species}) - {animal.status}<Link href={"/animals/animal/" + animal.id} className="btn btn-sm btn-danger ml-1 mb-1">Details</Link></li>))}</span> : <span><li>None</li></span>}
            </div>
          </div>
        </div>
      },
    ],
    []
  )

  const [data, setData] = useState({service_requests: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"open", openColor:"primary", closedColor:"secondary"});

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
    await axios.get('http://localhost:8000/hotline/api/servicerequests/?search=' + searchTerm + '&status=' + statusOptions.status, {
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
      await axios.get('http://localhost:8000/hotline/api/servicerequests/?search=' + searchTerm + '&status=' + statusOptions.status, {
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
  }, [statusOptions.status]);

  return (
    <div className="ml-2 mr-2 search_table">
        <Form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              type="text"
              placeholder="Search"
              name="searchTerm"
              value={searchTerm}
              onChange={handleChange}
              style={input_style}
            />
            <button className="btn btn-warning ml-1">Search!</button>
            <div className="ml-auto">
              <ButtonGroup>
                <Button color={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", openColor:"primary", closedColor:"secondary"})}>Open</Button>
                <Button color={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", openColor:"secondary", closedColor:"danger"})}>Closed</Button>
              </ButtonGroup>
            </div>
          </div>
        </Form>
        <hr/>
      <Table hide_thead={true} show_border={false} data={data.service_requests} columns={columns} />
      <p>{data.isFetching ? 'Fetching service requests...' : ''}</p>
    </div>
  )
}
