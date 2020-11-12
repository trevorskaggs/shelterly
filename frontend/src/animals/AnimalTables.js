import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormControl, InputGroup, ListGroup} from 'react-bootstrap';
import { Fab } from '@material-ui/core';
import AssignmentIcon from '@material-ui/icons/Assignment';
import EditIcon from '@material-ui/icons/Edit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';

const input_style = {
  width: "40%",
  display: "inline-block",
  position: 'relative',
}

export function AnimalSearch() {

  const [data, setData] = useState({animals: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"all", allColor: "primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"});

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  // Use searchTerm to filter animals.
  const handleSubmit = async event => {
    event.preventDefault();

    let source = axios.CancelToken.source();
    setData({animals: [], isFetching: true});
    // Fetch Animal data filtered searchTerm.
    await axios.get('/animals/api/animal/?search=' + searchTerm, {
      cancelToken: source.token,
    })
    .then(response => {
      setData({animals: response.data, isFetching: false});
    })
    .catch(error => {
      console.log(error.response);
      setData({animals: [], isFetching: false});
    });
  }

    // Hook for initializing data.
    useEffect(() => {
      let source = axios.CancelToken.source();
      const fetchAnimals = async () => {
        setData({animals: [], isFetching: true});
        // Fetch ServiceRequest data.
        await axios.get('/animals/api/animal/?search=' + searchTerm, {
          cancelToken: source.token,
        })
        .then(response => {
          setData({animals: response.data, isFetching: false});
        })
        .catch(error => {
          console.log(error.response);
          setData({animals: [], isFetching: false});
        });
      };
      fetchAnimals();
      // Cleanup.
      return () => {
        source.cancel();
      };
    }, [statusOptions.status]);

  return (
    <div className="ml-2 mr-2">
      <Header>Animal Search</Header>
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
        </InputGroup>
      </Form>

      {data.animals.map(animal => (
        <div key={animal.id} className="mt-3">
          <div className="card-header"> Name: {animal.name} - {animal.status}
            <Link href={"/animals/animal/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          </div>
          <CardGroup>
            <Card key={animal.id}>
              <Card.Body>
                <Card.Title>Animal Info</Card.Title>
                <ListGroup>
                  <ListGroup.Item className='species-sex'>{animal.species}{animal.species && animal.sex ? ", " : ""}{animal.sex}</ListGroup.Item>
                  <ListGroup.Item className='size-age'>{animal.size}{animal.size && animal.age ? ", " : ""}{animal.age}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Request Info</Card.Title>
                <ListGroup>
                  <ListGroup.Item className='request'>{animal.request ? <span><b>Request #{animal.request}</b> <Link href={"/hotline/servicerequest/" + animal.request}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : ""}</ListGroup.Item>
                  <ListGroup.Item className='owner'>{animal.owner ? <span><b>Owner:</b> {animal.owner_object.first_name} {animal.owner_object.last_name} <Link href={"/hotline/owner/" + animal.owner}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span>  : ""}</ListGroup.Item>
                  {/* <ListGroup.Item className='owner'>{animal.owner ? <span><b>Owner:</b> {animal.owner_object.first_name} {animal.owner_object.last_name} {animal.owner_object.phone} {animal.owner_object.first_name !== 'Unknown' ? <Link href={"/hotline/owner/" + animal.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Owner details" aria-label="owner_details"><AssignmentIcon style={{fontSize:10}} /></Fab> : <Fab href={"/hotline/owner/edit/" + animal.owner} className="mb-1" style={{width:23,height:23, minHeight:23, color:"#fff", backgroundColor: "#28a745"}} title="Edit Owner" aria-label="edit_owner"><EditIcon style={{fontSize:10}} /></Fab>}</div> : ""}</ListGroup.Item> */}
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
          </div>

      ))}
      <p>{data.isFetching ? 'Fetching Animals...' : <span>{!data.animals.length && searchTerm ? 'No Animals found.' : ''}</span>}</p>
    </div>
  )
}
