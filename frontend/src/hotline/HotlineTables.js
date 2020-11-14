import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup} from 'react-bootstrap';
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

export function ServiceRequestTable() {

  const [data, setData] = useState({service_requests: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"all", allColor: "primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"});

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
    await axios.get('/hotline/api/servicerequests/?search=' + searchTerm + '&status=' + statusOptions.status, {
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
      await axios.get('/hotline/api/servicerequests/?search=' + searchTerm + '&status=' + statusOptions.status, {
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
            <Button variant="outline-light">Search</Button>
          </InputGroup.Append>
            <ButtonGroup className="ml-3">
              <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status:"all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>
              <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Open</Button>
              <Button variant={statusOptions.assignedColor} onClick={() => setStatusOptions({status:"assigned", allColor:"secondary", openColor:"secondary", assignedColor:"primary", closedColor:"secondary"})}>Assigned</Button>
              <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary"})}>Closed</Button>
            </ButtonGroup>
          </InputGroup>
      </Form>

      {data.service_requests.map(service_request => (
        <div key={service_request.id} className="mt-3">
          <div className="card-header">{service_request.full_address} ({service_request.status})<Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
            <div><Moment format="LLL">{service_request.timestamp}</Moment></div>
          </div>
        <CardGroup>
          <Card key={service_request.id}>
            <Card.Body>
              <Card.Title>Contacts</Card.Title>
              <ListGroup>
                <ListGroup.Item className='owner'>Owner: {service_request.owner ? <span>{service_request.owner_object.first_name} {service_request.owner_object.last_name} {service_request.owner_object.display_phone} <Link href={"/hotline/owner/" + service_request.owner}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "N/A"}</ListGroup.Item>
                <ListGroup.Item className='reporter'>Reporter: {service_request.reporter ? <span>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name} {service_request.reporter_object.phone} <Link href={"/hotline/reporter/" + service_request.reporter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "N/A"}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Animals</Card.Title>
              <ListGroup>
              {service_request.animals && service_request.animals.length ? <span>{service_request.animals.map(animal => (<ListGroup.Item key={animal.id}>{animal.name} ({animal.species}) - {animal.status} <Link href={"/animals/animal/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>))}</span> : <span><li>None</li></span>}
              </ListGroup>
            </Card.Body>
          </Card>
        </CardGroup>
        </div>
      ))}
      <p>{data.isFetching ? 'Fetching service requests...' : <span>{data.service_requests && data.service_requests.length ? '' : 'No Service Requests found.'}</span>}</p>
    </div>
  )
}
