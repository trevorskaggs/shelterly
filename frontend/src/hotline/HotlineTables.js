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
  faClipboardList, faIgloo, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import moment from "moment";
import Header from '../components/Header';

import { ITEMS_PER_PAGE } from '.././constants'

export function ServiceRequestSearch() {

  const [data, setData] = useState({service_requests: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status:"all", allColor: "primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"});
  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState(1)

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
      setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE))
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
        setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE))
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
      <Header>Service Request Search</Header>
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
              <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status:"all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>
              <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Open</Button>
              <Button variant={statusOptions.assignedColor} onClick={() => setStatusOptions({status:"assigned", allColor:"secondary", openColor:"secondary", assignedColor:"primary", closedColor:"secondary"})}>Assigned</Button>
              <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary"})}>Closed</Button>
            </ButtonGroup>
          </InputGroup>
      </Form>

      {data.service_requests.map((service_request, index) => (
        <div key={service_request.id} className="mt-3" hidden={page!= Math.ceil((index+1)/ITEMS_PER_PAGE)}>
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
            <Card key={service_request.id}>
              <Card.Body>
                <Card.Title>Information</Card.Title>
                <ListGroup>
                  {service_request.owners.map(owner => (
                    <ListGroup.Item key={owner.id}><b>Owner: </b>{owner.first_name} {owner.last_name}{owner.display_phone ? " " + owner.display_phone : ""}
                      <OverlayTrigger
                        key={"owner-details"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-owner-details`}>
                            Owner details
                          </Tooltip>
                        }
                      >
                        <Link href={"/hotline/owner/" + owner.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                      </OverlayTrigger>
                    </ListGroup.Item>
                  ))}
                  {service_request.owners.length < 1 ? <ListGroup.Item><b>Owner: </b>No Owner</ListGroup.Item> : ""}
                  {service_request.reporter ?
                    <ListGroup.Item><b>Reporter: </b>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name}{service_request.reporter_object.agency ? <span>&nbsp;({service_request.reporter_object.agency})</span> : ""}{service_request.reporter_object.display_phone ? " " + service_request.reporter_object.display_phone : ""}
                      <OverlayTrigger
                        key={"reporter-details"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-reporter-details`}>
                            Reporter details
                          </Tooltip>
                        }
                      >
                        <Link href={"/hotline/reporter/" + service_request.reporter} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                      </OverlayTrigger>
                    </ListGroup.Item> : ""}
                  {service_request.evacuation_assignments.map(evacuation_assignment => (
                    <span key={evacuation_assignment.id}>
                      {evacuation_assignment.end_time ? "" :
                        <ListGroup.Item>
                          <span>
                            <b>Dispatch Assignment </b>
                            <OverlayTrigger
                              key={"dispatch-assignment-summary"}
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-dispatch-assignment-summary`}>
                                  Dispatch assignment summary
                                </Tooltip>
                              }
                            >
                              <Link href={"/evac/summary/" + evacuation_assignment.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} inverse/></Link>
                            </OverlayTrigger>
                            <div>
                              <b>Opened: </b>{moment(evacuation_assignment.start_time).format="MMMM Do YYYY, HH:mm:ss"} |
                              <Link href={"/evac/resolution/" + evacuation_assignment.id}
                                className="btn btn-danger ml-1"
                                style={{paddingTop: "0px", paddingBottom: "0px"}} target="_blank">Close</Link>
                            </div>
                          </span>
                        </ListGroup.Item>
                      }
                    </span>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Animals</Card.Title>
                {['cats', 'dogs', 'horses', 'other'].map(species => (
                  <ListGroup key={species}>
                    {service_request.animals.filter(animal => species.includes(animal.species)).length > 0 ?
                    <ListGroup.Item style={{borderRadius: 0}}><b style={{textTransform:"capitalize"}}>{species}: </b>
                    {service_request.animals.filter(animal => species.includes(animal.species)).map((animal, i) => (
                    <span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"}
                      <Link href={"/animals/" + animal.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1 mr-1" inverse/></Link>
                      (
                      {animal.status === "SHELTERED IN PLACE" ?
                        <OverlayTrigger key={"sip"} placement="top"
                                        overlay={<Tooltip id={`tooltip-sip`}>SHELTERED IN PLACE</Tooltip>}>
                            <FontAwesomeIcon icon={faIgloo} inverse/>
                        </OverlayTrigger> : ""}
                      {animal.status === "REPORTED" ?
                        <OverlayTrigger key={"reported"} placement="top"
                                        overlay={<Tooltip id={`tooltip-reported`}>REPORTED</Tooltip>}>
                            <FontAwesomeIcon icon={faExclamationCircle} inverse/>
                        </OverlayTrigger> : ""}
                      {animal.status === "UNABLE TO LOCATE" ?
                        <OverlayTrigger key={"unable-to-locate"} placement="top"
                                        overlay={<Tooltip id={`tooltip-unable-to-locate`}>UNABLE TO LOCATE</Tooltip>}>
                            <FontAwesomeIcon icon={faQuestionCircle} inverse/>
                        </OverlayTrigger> : ""}
                      {animal.status === "EVACUATED" ?
                        <OverlayTrigger key={"evacuated"} placement="top"
                                        overlay={<Tooltip id={`tooltip-evacuated`}>EVACUATED</Tooltip>}>
                            <FontAwesomeIcon icon={faHelicopter} inverse/>
                        </OverlayTrigger> : ""}
                      {animal.status === "REUNITED" ?
                        <OverlayTrigger key={"reunited"} placement="top"
                                        overlay={<Tooltip id={`tooltip-reunited`}>REUNITED</Tooltip>}>
                            <FontAwesomeIcon icon={faHeart} inverse/>
                        </OverlayTrigger> : ""}
                      {animal.status === "SHELTERED" ?
                        <OverlayTrigger key={"sheltered"} placement="top"
                                        overlay={<Tooltip id={`tooltip-sheltered`}>SHELTERED</Tooltip>}>
                            <FontAwesomeIcon icon={faHome} inverse/>
                        </OverlayTrigger> : ""}
                      {animal.status === "DECEASED" ?
                        <OverlayTrigger key={"deceased"} placement="top"
                                        overlay={<Tooltip id={`tooltip-deceased`}>DECEASED</Tooltip>}>
                            <FontAwesomeIcon icon={faSkullCrossbones} inverse/>
                        </OverlayTrigger> : ""}
                      )
                    </span>
                  ))}
                  </ListGroup.Item>
                  : ""}
                  </ListGroup>
                ))}
              </Card.Body>
            </Card>
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
