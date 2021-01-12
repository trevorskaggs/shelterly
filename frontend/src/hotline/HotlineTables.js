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

import { ITEMS_PER_PAGE } from '.././constants'

export function ServiceRequestTable() {

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
        console.log(response.data)
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
          <div className="card-header">{service_request.full_address}<Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>&nbsp;| <span style={{textTransform:"capitalize"}}>{service_request.status}</span></div>
          <CardGroup>
            <Card key={service_request.id}>
              <Card.Body>
                <Card.Title>Information</Card.Title>
                <ListGroup>
                  {service_request.owners.map(owner => (
                    <ListGroup.Item key={owner.id}>Owner: {owner.first_name} {owner.last_name} {owner.display_phone} <Link href={"/hotline/owner/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>
                  ))}
                  {service_request.owners.length < 1 ? <ListGroup.Item>Owner: No Owner</ListGroup.Item> : ""}
                  <ListGroup.Item>Reporter: {service_request.reporter ? <span>{service_request.reporter_object.first_name} {service_request.reporter_object.last_name} {service_request.reporter_object.phone} <Link href={"/hotline/reporter/" + service_request.reporter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "No Reporter"}</ListGroup.Item>
                  {service_request.evacuation_assignments.map(evacuation_assignment => (
                    <span key={evacuation_assignment.id}>
                      {evacuation_assignment.end_time ? "" :
                        <ListGroup.Item>
                          <span> Evacuation Assignment #{evacuation_assignment.id} <Link href={"/evac/summary/" + evacuation_assignment.id}>
                              <FontAwesomeIcon icon={faClipboardList} inverse/></Link>
                            <div>
                              Opened: {moment(evacuation_assignment.start_time).format="MMMM Do YYYY, HH:mm:ss"} |
                              <Link href={"/evac/resolution/" + evacuation_assignment.id}
                                className="btn btn-danger ml-1"
                                style={{paddingTop: "0px", paddingBottom: "0px"}}>Close</Link>
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
                <ListGroup>
                  <ListGroup.Item>
                    {service_request.animals.map((animal, i) => (
                        <span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"} ({animal.species})
                          {animal.status === "SHELTERED IN PLACE" ?
                              <OverlayTrigger key={"sip"} placement="top"
                                              overlay={<Tooltip id={`tooltip-sip`}>SHELTERED IN PLACE</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faIgloo} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                          {animal.status === "REPORTED" ?
                              <OverlayTrigger key={"reported"} placement="top"
                                              overlay={<Tooltip id={`tooltip-reported`}>REPORTED</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faExclamationCircle} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                          {animal.status === "UNABLE TO LOCATE" ?
                              <OverlayTrigger key={"unable-to-locate"} placement="top"
                                              overlay={<Tooltip id={`tooltip-unable-to-locate`}>UNABLE TO LOCATE</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faQuestionCircle} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                          {animal.status === "EVACUATED" ?
                              <OverlayTrigger key={"evacuated"} placement="top"
                                              overlay={<Tooltip id={`tooltip-evacuated`}>EVACUATED</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faHelicopter} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                          {animal.status === "REUNITED" ?
                              <OverlayTrigger key={"reunited"} placement="top"
                                              overlay={<Tooltip id={`tooltip-reunited`}>REUNITED</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faHeart} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                          {animal.status === "SHELTERED" ?
                              <OverlayTrigger key={"sheltered"} placement="top"
                                              overlay={<Tooltip id={`tooltip-sheltered`}>SHELTERED</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faHome} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                          {animal.status === "DECEASED" ?
                              <OverlayTrigger key={"deceased"} placement="top"
                                              overlay={<Tooltip id={`tooltip-deceased`}>DECEASED</Tooltip>}>
                                <Link href={"/animals/animal/" + animal.id}>
                                  <FontAwesomeIcon icon={faSkullCrossbones} className="ml-1" inverse/>
                                </Link>
                              </OverlayTrigger> : ""}
                        </span>))}
                  </ListGroup.Item>
                </ListGroup>
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
