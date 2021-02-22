import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import {
  Button,
  ButtonGroup,
  Card,
  CardGroup,
  Form,
  FormControl,
  InputGroup,
  ListGroup,
  OverlayTrigger,
  Pagination,
  Tooltip
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faClipboardCheck, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';

import { ITEMS_PER_PAGE } from '../constants'

function ServiceRequestSearch() {

  const [data, setData] = useState({service_requests: [], isFetching: false});
  const [searchState, setSearchState] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"open", allColor: "secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary", canceledColor:"secondary"});
  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState(1)

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setTempSearchTerm(event.target.value);
  };

  // Use searchTerm to filter service_requests.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm);
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      setData({service_requests: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/?search=' + searchTerm + '&status=' + statusOptions.status, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE))
          setData({service_requests: response.data, isFetching: false});
          let search_state = {};
					response.data.forEach(service_request => {
						let species = [];
						service_request.animals.forEach(animal => {
							if (!species.includes(animal.species)) {
								species.push(animal.species)
							}
						})
						search_state[service_request.id] = {species:species, selectedSpecies:species[0]}
						})
					setSearchState(search_state);
        }
      })
      .catch(error => {
        if (!unmounted) {
          console.log(error.response);
          setData({service_requests: [], isFetching: false});
        }
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, statusOptions.status]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Service Requests</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            value={tempSearchTerm}
            onChange={handleChange}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit">Search</Button>
          </InputGroup.Append>
          <ButtonGroup className="ml-3">
            <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status:"all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary", canceledColor:"secondary"})}>All</Button>
            <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary", canceledColor:"secondary"})}>Open</Button>
            <Button variant={statusOptions.assignedColor} onClick={() => setStatusOptions({status:"assigned", allColor:"secondary", openColor:"secondary", assignedColor:"primary", closedColor:"secondary", canceledColor:"secondary"})}>Assigned</Button>
            <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary", canceledColor:"secondary"})}>Closed</Button>
            <Button variant={statusOptions.canceledColor} onClick={() => setStatusOptions({status:"canceled", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary", canceledColor:"primary"})}>Canceled</Button>
          </ButtonGroup>
        </InputGroup>
      </Form>
      {data.service_requests.map((service_request, index) => (
        <div key={service_request.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header">
            <h4 style={{marginBottom:"-2px"}}>{service_request.full_address}
              <OverlayTrigger
                key={"request-details"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-request-details`}>
                    Service request details
                  </Tooltip>
                }
              >
                <Link href={"/hotline/servicerequest/" + service_request.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
              </OverlayTrigger>
              &nbsp;| <span style={{textTransform:"capitalize"}}>{service_request.status}</span>
            </h4>
          </div>
          <CardGroup>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Information</Card.Title>
                <ListGroup>
                  {service_request.owner_objects.map(owner => (
                    <ListGroup.Item key={owner.id}><b>Owner: </b>{owner.first_name} {owner.last_name}</ListGroup.Item>
                  ))}
                  {service_request.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
                  <ListGroup.Item><b>Reporter: </b>{service_request.reporter ? <span>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name}</span> : "No Reporter"}</ListGroup.Item>
                  <ListGroup.Item>
                  {service_request.latest_evac ?
                    <span>
                      <b>{service_request.latest_evac.end_time ? "Last" : "Active"} Dispatch Assignment: </b>
                      <Moment format="L">{service_request.latest_evac.start_time}</Moment>
                    </span>
                  :
                    <span>
                      <b>Dispatch Assignment: </b>
                      Never Serviced
                    </span>
                  }
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            {searchState[service_request.id] ?
              <Card style={{marginBottom:"6px"}}>
                <Card.Body>
                  <Card.Title style={{marginTop:"-10px"}}>
                    <ListGroup horizontal>
                    {searchState[service_request.id].species.map(species => (
                      <ListGroup.Item key={species} active={searchState[service_request.id].selectedSpecies === species ? true : false} style={{textTransform:"capitalize", cursor:'pointer', paddingTop:"4px", paddingBottom:"4px"}} onClick={() => setSearchState(prevState => ({ ...prevState, [service_request.id]:{...prevState[service_request.id], selectedSpecies:species} }))}>{species}{species !== "other" ? "s" : ""}</ListGroup.Item>
                    ))}
                    </ListGroup>
                  </Card.Title>
                  <ListGroup style={{height:"144px", overflowY:"auto", marginTop:"-12px"}}>
                    <Scrollbar autoHeight autoHide autoHeightMax={144} renderThumbVertical={props => <div {...props} style={{...props.style, backgroundColor: 'rgba(226, 226, 226, 0.2)'}} />}>
                      {service_request.animals.filter(animal => animal.species === searchState[service_request.id].selectedSpecies).map((animal, i) => (
                        <ListGroup.Item key={animal.id}>
                          {animal.name || "Unknown"} - {animal.status}
                        </ListGroup.Item>
                      ))}
                    </Scrollbar>
                    {service_request.animals.length < 1 ? <ListGroup.Item style={{marginTop:"32px"}}>No Animals</ListGroup.Item> : ""}
                  </ListGroup>
              </Card.Body>
            </Card>
            : ""}
          </CardGroup>
        </div>
      ))}
      <p>{data.isFetching ? 'Fetching service requests...' : <span>{data.service_requests && data.service_requests.length ? '' : 'No Service Requests found.'}</span>}</p>
    <Pagination className="custom-page-links" size="lg" onClick={(e) => {setPage(parseInt(e.target.innerText))}}>
      {[...Array(numPages).keys()].map(x => 
      <Pagination.Item key={x+1} active={x+1 === page}>
                {x+1}
              </Pagination.Item>)
      }
    </Pagination>
    </div>
    
  )
}

export default ServiceRequestSearch;
