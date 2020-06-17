import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Button, ButtonGroup, Form, FormControl, InputGroup} from 'react-bootstrap';
import Moment from 'react-moment';
import { Fab } from '@material-ui/core';
import AssignmentIcon from '@material-ui/icons/Assignment';

const input_style = {
  width: "40%",
  display: "inline-block",
  position: 'relative',
}

export function ServiceRequestTable() {

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
    <div className="ml-2 mr-2">
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            value={searchTerm}
            onChange={handleChange}
          />
        <InputGroup.Append>
          <Button variant="outline-secondary">Search</Button>
        </InputGroup.Append>
        </InputGroup>

          <div className="ml-auto">
            <ButtonGroup>
              <Button color={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", openColor:"primary", closedColor:"secondary"})}>Open</Button>
              <Button color={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", openColor:"secondary", closedColor:"danger"})}>Closed</Button>
            </ButtonGroup>
          </div>
      </Form>
      <hr/>
      {data.service_requests.map(service_request => (
        <div key={service_request.id} style={{width:"90%"}} className="card card-body bg-light mb-2">
          <div className="row">
            <div className="col-sm-2">
              <b>Service Request #{service_request.id}</b> <Fab color="primary" href={"/hotline/servicerequest/" + service_request.id} className="mb-1" style={{width:23,height:23, minHeight:23}} title="Service Request details" aria-label="details"><AssignmentIcon style={{fontSize:10}} /></Fab>
              <div className="mt-1 mb-1"><Moment format="LLL">{service_request.timestamp}</Moment></div>
            </div>
            <div className="col-sm">
            <b>Contacts:</b>
              <li className='owner'>Owner: {service_request.owner ? <span>{service_request.owner_object.first_name} {service_request.owner_object.last_name} {service_request.owner_object.phone} <Fab color="primary" href={"/hotline/owner/" + service_request.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Owner details" aria-label="owner_details"><AssignmentIcon style={{fontSize:10}} /></Fab></span> : "N/A"}</li>
              <li className='reporter '>Reporter: {service_request.reporter ? <span>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name} {service_request.reporter_object.phone} <Fab href={"/hotline/reporter/" + service_request.reporter} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Reporter details" aria-label="reporter_details"><AssignmentIcon style={{fontSize:10}} /></Fab></span> : "N/A"}</li>
            </div>
            <div className="col-sm">
            <b>Animals:</b> {service_request.animals && service_request.animals.length ? <span>{service_request.animals.map(animal => (<li key={animal.id}>{animal.name} ({animal.species}) - {animal.status} <Fab color="primary" href={"/animals/animal/" + animal.id} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#c82333"}} title="Animal details" aria-label="animal_details"><AssignmentIcon style={{fontSize:10}} /></Fab></li>))}</span> : <span><li>None</li></span>}
            </div>
          </div>
        </div>
      ))}
      <p>{data.isFetching ? 'Fetching service requests...' : <span>{data.service_requests && data.service_requests.length ? '' : 'No Service Requests found.'}</span>}</p>
    </div>
  )
}
