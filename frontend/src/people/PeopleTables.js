import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Link} from 'raviger';
import {Button, Card, CardGroup, Form, FormControl, InputGroup, ListGroup} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Moment from "react-moment";

export function PeopleTable() {

    const [data, setData] = useState({owners: [], isFetching: false});
    const [searchTerm, setSearchTerm] = useState("");

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
            // Fetch People data.
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
        };
        fetchOwners();
        // Cleanup.
        return () => {
            source.cancel();
        };
    }, []);

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
                </InputGroup>
            </Form>
            {data.owners.map(owner => (
                <div key={owner.id} className="mt-3">
                    <div className="mt-3">
                        <div className="card-header"> {owner.first_name ?
                            <span>{owner.first_name} {owner.last_name}
                                {owner.is_owner  ?
                                    <Link href={"/hotline/owner/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse/></Link>
                                    : <Link href={"/hotline/reporter/" + owner.id}> <FontAwesomeIcon icon={faClipboardList} inverse/></Link>}
                    <br/>
                        Phone: {owner.phone ? <span>{owner.phone} </span> : "N/A"}
                    </span> : "N/A"}
                        </div>
                        <CardGroup>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Service Requests</Card.Title>
                                    <ListGroup>
                                        <ListGroup.Item>
                                            {owner.service_request.length ?
                                                <span>{
                                                    owner.service_request.map(service_request => (
                                                        <span>
                                                    {service_request.address} ({service_request.status})
                                                    <Link
                                                        href={"/hotline/servicerequest/" + service_request.id}> <FontAwesomeIcon
                                                        icon={faClipboardList} inverse/></Link> | <Moment
                                                            format="LLL">{service_request.timestamp}</Moment>
                                                </span>))
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
                                        <ListGroup.Item>
                                            {owner.animals.map((animal, i) => (
                                                <span
                                                    key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"} ({animal.species})
                                                    </span>
                                            ))}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </CardGroup>
                    </div>
                </div>
            ))}
            <p>{data.isFetching ? 'Fetching Owners...' :
                <span>{data.owners && data.owners.length ? '' : 'No Owners found.'}</span>}</p>
        </div>
    )
}
