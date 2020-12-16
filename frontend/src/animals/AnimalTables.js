import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormControl, InputGroup, ListGroup } from 'react-bootstrap';
import ReactImageFallback from 'react-image-fallback';
import noImageFound from '../static/images/image-not-found.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import { titleCase } from '../components/Utils';

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
    await axios.get('/animals/api/animal/?search=' + searchTerm + '&is_stray=' + statusOptions.status, {
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
        await axios.get('/animals/api/animal/?search=' + searchTerm + '&is_stray=' + statusOptions.status, {
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
      <hr/>
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
            <Button variant="outline-light" type="submit">Search</Button>
          </InputGroup.Append>
          <ButtonGroup className="ml-3">
              <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status:"", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>
              <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status:"true", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Stray</Button>
              <Button variant={statusOptions.assignedColor} onClick={() => setStatusOptions({status:"false", allColor:"secondary", openColor:"secondary", assignedColor:"primary", closedColor:"secondary"})}>Owned</Button>
          </ButtonGroup>
        </InputGroup>
      </Form>

      {data.animals.map(animal => (
        <div key={animal.id} className="mt-3">
          <div className="card-header"> {animal.name ? titleCase(animal.name) : "Name Unknown"} - {animal.species ? titleCase(animal.species) : "Species Unknown"} - {titleCase(animal.status)}
            <Link href={"/animals/animal/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          </div>
          <CardGroup>
          <Card key={animal.id}>
              <Card.Body>
                <Card.Title>Animal Picture</Card.Title>
                <ListGroup>
                  <ListGroup.Item style={{width:"194px"}}><ReactImageFallback style={{width:"151px"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} /></ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Animal Info</Card.Title>
                <ListGroup>
                  <ListGroup.Item className='stray'>{animal.is_stray ? <span><b>Stray Animal:</b> Yes</span> : <span><b>Stray Animal:</b> No</span>}</ListGroup.Item>
                  <ListGroup.Item>{titleCase(animal.species)}{animal.sex ? <span>, {titleCase(animal.sex)}</span> : ""}{animal.age ? <span>, {titleCase(animal.age)}</span> : ""}{animal.size ? <span>, {titleCase(animal.size)}</span> : ""}
                    &nbsp;{animal.request ? <Link href={"/hotline/servicerequest/" + animal.request}><FontAwesomeIcon icon={faClipboardList} inverse /></Link> : ""}</ListGroup.Item>
                  <ListGroup.Item><b>Address: </b>{animal.full_address ? <span>{titleCase(animal.full_address)}</span> : "Unknown"} </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Owner Info</Card.Title>
                <ListGroup>
                  {animal.owners.map(owner => (
                    <ListGroup.Item key={owner.id}><b>Owner:</b> {owner.first_name} {owner.last_name} {owner.display_phone} <Link href={"/hotline/owner/" + owner.id}><FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>
                  ))}
                  {animal.owners < 1 && animal.reporter ? <ListGroup.Item><b>Reporter: </b> {animal.reporter.first_name} {animal.reporter.last_name} {animal.reporter.display_phone} <Link href={"/hotline/reporter/" + animal.reporter.id}><FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item> : ""}
                  {animal.owners < 1 && !animal.reporter ? <ListGroup.Item>No Owner</ListGroup.Item> : ""}
                  {animal.request ? <ListGroup.Item className='request'><b>Service Request #{animal.request}</b> <Link href={"/hotline/servicerequest/" + animal.request}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item> : ""}
                </ListGroup>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Shelter Info</Card.Title>
                <ListGroup>
                  <ListGroup.Item className='Shelter'>{animal.shelter_name ? <span><b>Shelter {animal.request}</b> <Link href={"/shelter/" + animal.shelter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "Not Sheltered"}</ListGroup.Item>
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
