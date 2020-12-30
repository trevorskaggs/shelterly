import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from '.././components/Table';
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Link } from "raviger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList, faIgloo, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import Moment from "react-moment";
import Header from '../components/Header';

export function EvacTeamTable() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Evac Team',
        accessor: 'id',
        Cell: ({ cell: { value } }) =>
          <div><a href={"/evac/evacteam/"+value+"/"}>Evac Team {value}</a></div>
      },
      {
        Header: 'Team Members',
        accessor: 'evac_team_member_names',
      }
    ],
    []
  )
  const [data, setData] = useState({evac_teams: [], isFetching: false});
  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchEvacTeams = async () => {
      setData({evac_teams: [], isFetching: true});
      // Fetch EvacTeam data.
      await axios.get('http://localhost:8000/evac/api/evacteam/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({evac_teams: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({evac_teams: [], isFetching: false});
      });
    };
    fetchEvacTeams();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <div>
      <Table columns={columns} data={data.evac_teams}/>
      <p>{data.isFetching ? 'Fetching teams...' : ''}</p>
    </div>
  )
}

export function EvacuationAssignmentTable() {

  const [data, setData] = useState({evacuation_assignments: [], isFetching: false});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusOptions, setStatusOptions] = useState({status: "open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"});

  // Update searchTerm when field input changes.
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  // Use searchTerm to filter evacuation_assignments.
  const handleSubmit = async event => {
    event.preventDefault();

    let source = axios.CancelToken.source();
    setData({evacuation_assignments: [], isFetching: true});
    // Fetch EvacuationAssignments data filtered searchTerm.
    await axios.get('/evac/api/evacassignment/?search=' + searchTerm + '&status=' + statusOptions.status, {
      cancelToken: source.token,
    })
        .then(response => {
          setData({evacuation_assignments: response.data, isFetching: false});
        })
        .catch(error => {
          console.log(error.response);
          setData({evacuation_assignments: [], isFetching: false});
        });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchServiceRequests = async () => {
      setData({evacuation_assignments: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/evac/api/evacassignment/?search=' + searchTerm + '&status=' + statusOptions.status, {
        cancelToken: source.token,
      })
          .then(response => {
            setData({evacuation_assignments: response.data, isFetching: false});
          })
          .catch(error => {
            console.log(error.response);
            setData({evacuation_assignments: [], isFetching: false});
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
        <Header>Dispatch Assignment Search</Header>
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
              <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status: "all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>
              <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status: "open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Open</Button>
              <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status: "closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary"})}>Closed</Button>
            </ButtonGroup>
          </InputGroup>
        </Form>
        {data.evacuation_assignments.map(evacuation_assignment => (
          <div key={evacuation_assignment.id} className="mt-3">
            <div className="card-header"><h4 style={{marginBottom:"-2px"}}>
              <Moment format="L">{evacuation_assignment.start_time}</Moment> <Link href={"/evac/summary/" + evacuation_assignment.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} inverse /></Link>&nbsp;&nbsp;|&nbsp;
              Team Members: {evacuation_assignment.team_member_objects.map((member, i) => (
                  <span key={member.id}>{i > 0 && ", "}{member.first_name} {member.last_name}</span>))}
              {evacuation_assignment.end_time ? "" : <Link href={"/evac/resolution/" + evacuation_assignment.id} className="btn btn-danger ml-1" style={{paddingTop:"0px", paddingBottom:"0px"}}>Close</Link>}
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
                      <span>
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
                                {service_request.owners.map((owner, i) => (
                                <span>
                                  {i > 0 && " | "}{owner.first_name} {owner.last_name}
                                  <Link
                                    href={"/hotline/owner/" + owner.id} target="_blank"> <FontAwesomeIcon
                                    icon={faClipboardList} inverse/>
                                  </Link>
                                </span>
                                ))}</span>}
                              </div>
                            </Col>
                            <Col>
                              {['cats', 'dogs', 'horses', 'other'].map(species => (
                                <div>
                                  {service_request.animals.filter(animal => animal.evacuation_assignments.includes(evacuation_assignment.id)).filter(animal => species.includes(animal.species)).length > 0 ?
                                  <span><b style={{textTransform:"capitalize"}}>{species}: </b>
                                  {service_request.animals.filter(animal => animal.evacuation_assignments.includes(evacuation_assignment.id)).filter(animal => species.includes(animal.species)).map((animal, i) => (
                                  <span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"}
                                    <Link href={"/animals/animal/" + animal.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1 mr-1" inverse/></Link>
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
                                </span>
                                : ""}
                                </div>
                              ))}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      </span>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </CardGroup>
          </div>
        ))}
        <p>{data.isFetching ? 'Fetching evacuation requests...' : <span>{data.evacuation_assignments && data.evacuation_assignments.length ? '' : 'No Evacuation Assignments found.'}</span>}</p>
      </div>
  )
}