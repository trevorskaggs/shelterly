import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from '.././components/Table';
import {Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup} from "react-bootstrap";
import {Link} from "raviger";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardList} from "@fortawesome/free-solid-svg-icons";
import Moment from "react-moment";
import {datetime} from "react-table/src/sortTypes";


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
  const [statusOptions, setStatusOptions] = useState({status: "all", allColor: "primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"});

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
    // await axios.get('/hotline/api/servicerequests/?search=' + searchTerm + '&status=' + statusOptions.status, {
    // await axios.get('/evac/api/evacassignment/?search=' + searchTerm, {
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
      // await axios.get('/evac/api/evacassignment/?search=' + searchTerm, {
        cancelToken: source.token,
      })
          .then(response => {
            setData({evacuation_assignments: response.data, isFetching: false});
            //for testing purposes
            console.log(response.data);
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
  // }, []);
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
              <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status: "all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>
              <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status: "open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Open</Button>
              <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status: "closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary"})}>Closed</Button>
            </ButtonGroup>
          </InputGroup>
        </Form>

        {data.evacuation_assignments.map(evacuation_assignment => (
            <div key={evacuation_assignment.id} className="mt-3">
              <div className="card-header">
                Evacuation Assignment #{evacuation_assignment.id}<Link href={"/evac/summary/" + evacuation_assignment.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                <div>Opened: <Moment format="LLL">{evacuation_assignment.start_time}</Moment></div>
                <div>Closed: {evacuation_assignment.end_time ?
                    <span>
                      <Moment format="LLL">{evacuation_assignment.end_time}</Moment>
                    </span> : "N/A"}
                </div>
                <span>Team Member(s): {evacuation_assignment.team_member_objects.map(member => (
                    <span key={member.id}>
                      {member.first_name} {member.last_name} &nbsp;
                    </span>))}
                </span>
                {/*<div>Team Member(s): <span>{evacuation_assignment.team_member_objects.map(member => (<ListGroup.Item key={member.id}>{member.first_name} {member.last_name} </ListGroup.Item>))} </span></div>*/}
              </div>
              <CardGroup>
                <Card key={evacuation_assignment.id}>
                  <Card.Body>
                    <Card.Title>Service Request(s)</Card.Title>
                    <ListGroup>
                      <span>{evacuation_assignment.service_request_objects.map(service_request => (
                          <ListGroup.Item key={service_request.id}>
                            Service Request #{service_request.id} <Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> |
                            Owner: {service_request.owner_object.first_name} {service_request.owner_object.last_name} |
                            Animals: {service_request.animals.length}
                          </ListGroup.Item>))}</span>
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