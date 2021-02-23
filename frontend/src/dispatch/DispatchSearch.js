import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Link, useQueryParams } from "raviger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck, faClipboardList, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import Moment from "react-moment";
import Header from '../components/Header';

function DispatchAssignmentSearch() {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    status = 'open',
  } = queryParams;

  const [data, setData] = useState({evacuation_assignments: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState(search);
  const [tempSearchTerm, setTempSearchTerm] = useState(search);
  const [statusOptions, setStatusOptions] = useState(status);

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setTempSearchTerm(event.target.value);
  };

  // Use searchTerm to filter evacuation_assignments.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm);
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      setData({evacuation_assignments: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/evac/api/evacassignment/?search=' + searchTerm + '&status=' + statusOptions, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData({evacuation_assignments: response.data, isFetching: false});
        }
      })
      .catch(error => {
        if (!unmounted) {
          console.log(error.response);
          setData({evacuation_assignments: [], isFetching: false});
        }
      });
    };
    fetchServiceRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, statusOptions]);

  return (
      <div className="ml-2 mr-2">
        <Header>Search Dispatch Assignments</Header>
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
              <Button variant={statusOptions === "open" ? "primary" : "secondary"} onClick={statusOptions !== "open" ? () => setStatusOptions("open") : () => setStatusOptions("")}>Open</Button>
              <Button variant={statusOptions === "closed" ? "primary" : "secondary"} onClick={statusOptions !== "closed" ? () => setStatusOptions("closed") : () => setStatusOptions("")}>Closed</Button>
            </ButtonGroup>
          </InputGroup>
        </Form>
        {data.evacuation_assignments.map(evacuation_assignment => (
          <div key={evacuation_assignment.id} className="mt-3">
            <div className="card-header"><h4 style={{marginBottom:"-2px"}}>
              <Moment format="L">{evacuation_assignment.start_time}</Moment>
              <OverlayTrigger
                key={"dispatch-assignment-summary"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-dispatch-assignment-summary`}>
                    Dispatch assignment summary
                  </Tooltip>
                }
              >
                <Link href={"/dispatch/summary/" + evacuation_assignment.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
              </OverlayTrigger>
              {evacuation_assignment.end_time ? "" :
                <OverlayTrigger
                  key={"close-dispatch-assignment"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-close-dispatch-assignment`}>
                      Close dispatch assignment
                    </Tooltip>
                  }
                >
                  <Link href={"/dispatch/resolution/" + evacuation_assignment.id}><FontAwesomeIcon icon={faClipboardCheck} className="ml-1" inverse /></Link>
                </OverlayTrigger>
              }
              &nbsp;&nbsp;|&nbsp;
              Team Members: {evacuation_assignment.team_member_objects.map((member, i) => (
                  <span key={member.id}>{i > 0 && ", "}{member.first_name} {member.last_name}</span>))}
            </h4></div>
            <CardGroup>
              <Card key={evacuation_assignment.id}>
                <Card.Body>
                  <Row>
                    <Col>
                      <Card.Title>Service Requests</Card.Title>
                    </Col>
                    <Col>
                      <Card.Title>Animals</Card.Title>
                    </Col>
                  </Row>
                  <ListGroup>
                    {evacuation_assignment.service_request_objects.map(service_request => (
                      <ListGroup.Item key={service_request.id}>
                        <Row>
                          <Col>
                            <b>Address: </b>{service_request.full_address}
                            <Link
                              href={"/hotline/servicerequest/" + service_request.id} target="_blank"> <FontAwesomeIcon
                              icon={faClipboardList} inverse/>
                            </Link>
                            <div>
                              <b>Owners: </b>
                              {service_request.owners.length < 1 ? "No Owners" : <span>
                              {service_request.owner_objects.map((owner, i) => (
                              <span key={owner.id}>
                                {i > 0 && " | "}{owner.first_name} {owner.last_name}
                                <Link
                                  href={"/people/owner/" + owner.id} target="_blank"> <FontAwesomeIcon
                                  icon={faClipboardList} inverse/>
                                </Link>
                              </span>
                              ))}</span>}
                            </div>
                            {evacuation_assignment.end_time ?
                            <div>
                              <b>Visit Note: </b>{(service_request.visit_notes.filter(note => String(note.evac_assignment) === String(evacuation_assignment.id)).length && service_request.visit_notes.filter(note => String(note.evac_assignment) === String(evacuation_assignment.id))[0].notes) || "No information available."}
                            </div> :
                            <div>
                              <b>Previous Visit: </b>{(service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime()).length && service_request.visit_notes.sort((a,b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime())[0].notes) || "No information available."}
                            </div>
                            }
                          </Col>
                          <Col>
                            {['cats', 'dogs', 'horses', 'other'].map(species => (
                              <div key={species}>
                                {service_request.animals.filter(animal => animal.evacuation_assignments.includes(evacuation_assignment.id)).filter(animal => species.includes(animal.species)).length > 0 ?
                                <span><b style={{textTransform:"capitalize"}}>{species}: </b>
                                {service_request.animals.filter(animal => animal.evacuation_assignments.includes(evacuation_assignment.id)).filter(animal => species.includes(animal.species)).map((animal, i) => (
                                <span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"}
                                  <Link href={"/animals/animal/" + animal.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1 mr-1" inverse/></Link>
                                  (
                                  {animal.status === "SHELTERED IN PLACE" ?
                                      <OverlayTrigger key={"sip"} placement="top"
                                                      overlay={<Tooltip id={`tooltip-sip`}>SHELTERED IN PLACE</Tooltip>}>
                                          <span className="fa-layers fa-fw">
                                            <FontAwesomeIcon icon={faCircle} transform={'grow-1'} />
                                            <FontAwesomeIcon icon={faHomeAlt} style={{color:"#444"}} transform={'shrink-3'} size="sm" inverse />
                                          </span>
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
                              </span>
                              : ""}
                              </div>
                            ))}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </CardGroup>
          </div>
        ))}
        <p>{data.isFetching ? 'Fetching dispatch assignments...' : <span>{data.evacuation_assignments && data.evacuation_assignments.length ? '' : 'No dispatch assignments found.'}</span>}</p>
      </div>
  )
}

export default DispatchAssignmentSearch;
