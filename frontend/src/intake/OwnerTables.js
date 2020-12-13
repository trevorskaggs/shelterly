import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Moment from "react-moment";

export function OwnerTable() {

    const [data, setData] = useState({owners: [], isFetching: false});
    const [searchTerm, setSearchTerm] = useState("");
    // const [statusOptions, setStatusOptions] = useState({status:"all", allColor: "primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"});

    // Update searchTerm when field input changes.
    const handleChange = event => {
        setSearchTerm(event.target.value);
    };

    // Use searchTerm to filter owners.
    const handleSubmit = async event => {
        event.preventDefault();

        let source = axios.CancelToken.source();
        setData({owners: [], isFetching: true});
        // Fetch Persons data filtered searchTerm.
        await axios.get('/people/api/person/?search=' + searchTerm, {
            cancelToken: source.token,
        })
            .then(response => {
                setData({owners: response.data, isFetching: false});
            })
            .catch(error => {
                console.log(error.response);
                setData({owners: [], isFetching: false});
            });
    }

    // Hook for initializing data.
    useEffect(() => {
        let source = axios.CancelToken.source();
        const fetchOwners = async () => {
            setData({owners: [], isFetching: true});
            // Fetch ServiceRequest data.
            await axios.get('/people/api/person/?search=' + searchTerm, {
                cancelToken: source.token,
            })
                .then(response => {
                    setData({owners: response.data, isFetching: false});
                    console.log(response.data); //TESTING
                })
                .catch(error => {
                    console.log(error.response);
                    setData({owners: [], isFetching: false});
                });
        };
        fetchOwners();
        // Cleanup.
        return () => {
            source.cancel();
        };
    }, []);
    // }, [statusOptions.status]);

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
                    {/*<ButtonGroup className="ml-3">*/}
                    {/*    <Button variant={statusOptions.allColor} onClick={() => setStatusOptions({status:"all", allColor:"primary", openColor:"secondary", assignedColor:"secondary", closedColor:"secondary"})}>All</Button>*/}
                    {/*    <Button variant={statusOptions.openColor} onClick={() => setStatusOptions({status:"open", allColor:"secondary", openColor:"primary", assignedColor:"secondary", closedColor:"secondary"})}>Open</Button>*/}
                    {/*    <Button variant={statusOptions.assignedColor} onClick={() => setStatusOptions({status:"assigned", allColor:"secondary", openColor:"secondary", assignedColor:"primary", closedColor:"secondary"})}>Assigned</Button>*/}
                    {/*    <Button variant={statusOptions.closedColor} onClick={() => setStatusOptions({status:"closed", allColor:"secondary", openColor:"secondary", assignedColor:"secondary", closedColor:"primary"})}>Closed</Button>*/}
                    {/*</ButtonGroup>*/}
                </InputGroup>
            </Form>
            {data.owners.map(owner => (
                // <div key={owner.id} className="mt-3">
                <div className="mt-3">
                    {/*{owner.animals && owner.animals.length ?*/}
                    {/*    <span>*/}
                    <div className="card-header"> Owner: {owner.first_name ? <span>{owner.first_name} {owner.last_name} <Link href={"/hotline/owner/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                    <br/>
                        Phone: { owner.phone ? <span>{owner.phone} </span> : "N/A"}
                    </span> : "N/A"}
                    </div>
                    <CardGroup>
                        <Card key={owner.id}>
                            <Card.Body>
                                <Card.Title>Service Requests</Card.Title>
                                <ListGroup>
                                    {/*<div className="card-header"> Service Request #{owner.id}<Link href={"/hotline/servicerequest/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>*/}
                                    {/*<ListGroup.Item className='service_request'>Owner: {owner.first_name ? <span>{owner.first_name} {owner.last_name} {owner.phone} <Link href={"/hotline/owner/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></span> : "N/A"}</ListGroup.Item>*/}
                                <ListGroup.Item>

                                    {owner.service_request.length ?
                                        <span>{
                                            owner.service_request.map(service_request => (
                                                <span>
                                                    {service_request.address} ({service_request.status})
                                                    <Link href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link> | <Moment format="LLL">{service_request.timestamp}</Moment>
                                                </span>

                                            ))
                                        }</span> : "None"
                                    }
                                </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Body>
                                <Card.Title>Animals</Card.Title>
                                <ListGroup>
                                    {/*{owner.animals && owner.animals.length ? <span>{owner.animals.map(animal => (<ListGroup.Item key={animal.id}>{animal.name} ({animal.species}) - {animal.status} <Link href={"/animals/animal/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>))}</span> : <span><li>None</li></span>}*/}

                                    <ListGroup.Item>
                  {owner.animals.map((animal, i) => (
                      <span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"} ({animal.species})

                                                    </span>
                  ))}
                </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </CardGroup>
                {/*        </span>*/}
                {/*: <span></span>}*/}
                </div>
            ))}
            <p>{data.isFetching ? 'Fetching Owners...' : <span>{data.owners && data.owners.length ? '' : 'No Owners found.'}</span>}</p>
        </div>
    )
}
