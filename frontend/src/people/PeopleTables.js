import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, CardGroup, Form, FormControl, InputGroup, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';

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
        <>
        <Header>Owner Search</Header>
        <hr/>
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
                </InputGroup>
            </Form>
            {data.owners.map(owner => (
                <div key={owner.id} className="mt-3">
                    <div className="mt-3">
                        <div className="card-header"> {owner.first_name ?
                            <h4 style={{marginBottom:"-2px"}}>{owner.first_name} {owner.last_name}
                                {owner.is_owner  ?
                                    <Link href={"/hotline/owner/" + owner.id} target="_blank"> <FontAwesomeIcon icon={faClipboardList} inverse/></Link>
                                    : <Link href={"/hotline/reporter/" + owner.id} target="_blank"> <FontAwesomeIcon icon={faClipboardList} inverse/></Link>}
                    </h4> : "Unknown"}
                        </div>
                        <CardGroup>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Information</Card.Title>
                                    <ListGroup>
                                        <ListGroup.Item><b>Phone: </b>{owner.phone ? <span>{owner.display_phone} </span> : "None"}</ListGroup.Item>
                                        <ListGroup.Item><b>Email: </b>{owner.email ? <span>{owner.email} </span> : "None"}</ListGroup.Item>
                                        <ListGroup.Item><b>Service Request: </b>
                                            {owner.request ?
                                                <span>
                                                    {owner.request.full_address}&nbsp;
                                                    <Link href={"/hotline/servicerequest/" + owner.request.id} target="_blank">
                                                        <FontAwesomeIcon
                                                        icon={faClipboardList} inverse/>
                                                    </Link> | <span style={{textTransform:"capitalize"}}>{owner.request.status}</span>
                                                </span>
                                                : "None"
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
                                            {owner.animals.length ?
                                                <span>
                                                    {owner.animals.map((animal, i) => (
                                                        <span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"} ({animal.species})</span>))}
                                                </span> : "None"}
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
    </>
    )
}
