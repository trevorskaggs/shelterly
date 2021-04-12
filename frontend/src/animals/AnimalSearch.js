import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Tooltip } from 'react-bootstrap';
import noImageFound from '../static/images/image-not-found.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBandAid, faClipboardList, faCut, faLink, faNotesMedical, faStickyNote, faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import { faClawMarks } from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { titleCase } from '../components/Utils';

import { ITEMS_PER_PAGE } from '../constants';

function AnimalSearch() {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    owned = 'owned',
  } = queryParams;

  const [data, setData] = useState({animals: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState(search);
  const [tempSearchTerm, setTempSearchTerm] = useState(search);
  const [statusOptions, setStatusOptions] = useState(owned);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const topRef = useRef(null);

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setTempSearchTerm(event.target.value);
  };

  // Use searchTerm to filter animals.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm);
  }

  function setFocus(pageNum) {
    if (pageNum !== page) {
      topRef.current.focus();
    }
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchAnimals = async () => {
      setData({animals: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/animals/api/animal/?search=' + searchTerm + '&owned=' + statusOptions, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({animals: response.data, isFetching: false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({animals: [], isFetching: false});
        }
      });
    };
    fetchAnimals();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, statusOptions]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Animals</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            value={tempSearchTerm}
            onChange={handleChange}
            ref={topRef}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search</Button>
          </InputGroup.Append>
          <ButtonGroup className="ml-1">
            <Button variant={statusOptions === "owned" ? "primary" : "secondary"} onClick={statusOptions !== "owned" ? () => {setPage(1);setStatusOptions("owned")} : () => {setPage(1);setStatusOptions("")}}>Owned</Button>
            <Button variant={statusOptions === "stray" ? "primary" : "secondary"} onClick={statusOptions !== "stray" ? () => {setPage(1);setStatusOptions("stray")} : () => {setPage(1);setStatusOptions("")}}>Stray</Button>
          </ButtonGroup>
        </InputGroup>
      </Form>
      {data.animals.map((animal, index) => (
        <div key={animal.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header"><h4 style={{marginBottom:"-2px",  marginLeft:"-12px"}}>#{animal.id} {animal.name ? titleCase(animal.name) : "Unknown"}
          <OverlayTrigger
            key={"animal-details"}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-animal-details`}>
                Animal details
              </Tooltip>
            }
          >
            <Link href={"/animals/" + animal.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
          </OverlayTrigger>
          &nbsp;| {titleCase(animal.status)}</h4></div>
          <CardGroup>
            <Card style={{maxWidth:"206px", maxHeight:"206px"}}>
              <Card.Body className="p-0 m-0">
                <img alt="Animal" style={{width:"206px", height:"206px", objectFit: "cover", overflow: "hidden"}} src={animal.front_image || animal.side_image || noImageFound} />
              </Card.Body>
            </Card>
            <Card style={{marginBottom:"6px", maxWidth:"335px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Information
                  {animal.owner_objects.length < 1 ?
                    <OverlayTrigger
                      key={"stray"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-stray`}>
                          Animal is stray
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faUserAltSlash} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.confined === 'yes' ?
                    <OverlayTrigger
                      key={"confined"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-confined`}>
                          Animal is confined
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faLink} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.fixed === 'yes' ?
                    <OverlayTrigger
                      key={"fixed"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-fixed`}>
                          Animal is fixed or neutered
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faCut} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.aggressive === 'yes' ?
                    <OverlayTrigger
                      key={"aggressive"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-aggressive`}>
                          Animal is aggressive
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faClawMarks} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.injured === 'yes' ?
                    <OverlayTrigger
                      key={"injured"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-injured`}>
                          Animal is injured
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faBandAid} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.behavior_notes ?
                    <OverlayTrigger
                      key={"behavior-notes"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-behavior-notes`}>
                          {animal.behavior_notes}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faStickyNote} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                  {animal.medical_notes ?
                    <OverlayTrigger
                      key={"medical-notes"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-medical-notes`}>
                          {animal.medical_notes}
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faNotesMedical} size="sm" className="ml-1" />
                    </OverlayTrigger> :
                  ""}
                </Card.Title>
                <Scrollbar style={{height:"144px"}}>
                  <ListGroup>
                    <ListGroup.Item>{titleCase(animal.species)}{animal.size ? <span>,&nbsp;{titleCase(animal.size)}</span> : ""}{animal.sex ? <span>,&nbsp;{titleCase(animal.sex)}</span> : ""}{animal.age ? <span>,&nbsp;{titleCase(animal.age)}</span> : ""}</ListGroup.Item>
                    <ListGroup.Item style={{textTransform:"capitalize"}}><b>Color: </b>{animal.pcolor ? <span>{animal.pcolor}{animal.scolor ? <span> / {animal.scolor}</span> : ""}</span> : "Unknown"}</ListGroup.Item>
                    {animal.owner_objects.map(owner => (
                      <ListGroup.Item key={owner.id}><b>Owner:</b> {owner.first_name} {owner.last_name}</ListGroup.Item>
                    ))}
                    {animal.owner_objects < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
                    {animal.reporter ? <ListGroup.Item><b>Reporter: </b>{animal.reporter_object.first_name} {animal.reporter_object.last_name}</ListGroup.Item> : ""}
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
              <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Location</Card.Title>
                <ListGroup>
                  <ListGroup.Item className='request'><b>Service Request: </b>{animal.request_address || "None"}</ListGroup.Item>
                    <ListGroup.Item><b>Shelter: </b>{animal.shelter_name || "None"}</ListGroup.Item>
                    {animal.shelter ? <ListGroup.Item><b>Address: </b>{animal.full_address}</ListGroup.Item> : ""}
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
          </div>
      ))}
      <p>{data.isFetching ? 'Fetching Animals...' : <span>{!data.animals.length && searchTerm ? 'No Animals found.' : ''}</span>}</p>
      <Pagination className="custom-page-links" size="lg" onClick={(e) => {setFocus(parseInt(e.target.innerText));setPage(parseInt(e.target.innerText))}}>
        {[...Array(numPages).keys()].map(x =>
        <Pagination.Item key={x+1} active={x+1 === page}>
          {x+1}
        </Pagination.Item>)
        }
      </Pagination>
    </div>
  )
}

export default AnimalSearch;
