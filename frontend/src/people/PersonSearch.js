import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';

import { ITEMS_PER_PAGE } from '../constants';

function PersonSearch() {

	// Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    person = 'owners',
  } = queryParams;

	const [data, setData] = useState({owners: [], isFetching: false});
	const [searchState, setSearchState] = useState({});
	const [statusOptions, setStatusOptions] = useState(person);
	const [searchTerm, setSearchTerm] = useState(search);
	const [tempSearchTerm, setTempSearchTerm] = useState(search);
	const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);

	// Update searchTerm when field input changes.
	const handleChange = event => {
		setTempSearchTerm(event.target.value);
	};

	// Use searchTerm to filter owners.
	const handleSubmit = async event => {
			event.preventDefault();
			setSearchTerm(tempSearchTerm);
	}

	// Hook for initializing data.
	useEffect(() => {
		let unmounted = false;
		let source = axios.CancelToken.source();

		const fetchOwners = async () => {
			setData({owners: [], isFetching: true});
			// Fetch People data.
			await axios.get('/people/api/person/?search=' + searchTerm + '&status=' + statusOptions, {
				cancelToken: source.token,
			})
			.then(response => {
				if (!unmounted) {
					setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
					setData({owners: response.data, isFetching: false});
					let search_state = {};
					response.data.forEach(owner => {
						let species = [];
						owner.animals.forEach(animal => {
							if (!species.includes(animal.species)) {
								species.push(animal.species)
							}
						})
						search_state[owner.id] = {species:species, selectedSpecies:species[0]}
						})
					setSearchState(search_state);
				}
			})
			.catch(error => {
				if (!unmounted) {
					console.log(error.response);
					setData({owners: [], isFetching: false});
				}
			});
		};
		fetchOwners();
		// Cleanup.
		return () => {
			unmounted = true;
			source.cancel();
		};
	}, [searchTerm, statusOptions]);

	return (
			<div className="ml-2 mr-2">
			<Header>Search Owners and Reporters</Header>
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
								<Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search</Button>
							</InputGroup.Append>
							<ButtonGroup className="ml-3">
								<Button variant={statusOptions === "owners" ? "primary" : "secondary"} onClick={statusOptions !== "owners" ? () => {setPage(1);setStatusOptions("owners")} : () => {setPage(1);setStatusOptions("")}}>Owners</Button>
								<Button variant={statusOptions === "reporters" ? "primary" : "secondary"} onClick={statusOptions !== "reporters" ? () => {setPage(1);setStatusOptions("reporters")} : () => {setPage(1);setStatusOptions("")}}>Reporters</Button>
							</ButtonGroup>
						</InputGroup>
					</Form>
					{data.owners.map((owner, index) => (
							<div key={owner.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
									<div className="card-header"> {owner.first_name ?
										<h4 style={{marginBottom: "-2px",  marginLeft:"-12px"}}>{owner.first_name} {owner.last_name}
											{owner.agency ? <span> ({owner.agency})</span> : ""}
											{statusOptions === 'owners' ?
											<OverlayTrigger
												key={"owner-details"}
												placement="top"
												overlay={
													<Tooltip id={`tooltip-owner-details`}>
														Owner details
													</Tooltip>
												}
											>
												<Link href={"/people/owner/" + owner.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse/></Link>
											</OverlayTrigger>
											:
											<OverlayTrigger
												key={"reporter-details"}
												placement="top"
												overlay={
													<Tooltip id={`tooltip-reporter-details`}>
														Reporter details
													</Tooltip>
												}
											>
												<Link href={"/people/reporter/" + owner.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse/></Link>
											</OverlayTrigger>
											}
										</h4> : "Unknown"}
									</div>
									<CardGroup>
										<Card style={{marginBottom:"6px"}}>
											<Card.Body>
												<Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Information</Card.Title>
												<ListGroup>
													<ListGroup.Item><b>Phone: </b>{owner.phone ? <span>{owner.display_phone} </span> : "None"}</ListGroup.Item>
													<ListGroup.Item><b>Email: </b>{owner.email ? <span>{owner.email} </span> : "None"}</ListGroup.Item>
													<ListGroup.Item><b>Service Request: </b>
													{owner.request ?
														<span>{owner.request.full_address}</span>
													: "None"
													}
													</ListGroup.Item>
												</ListGroup>
											</Card.Body>
										</Card>
										{searchState[owner.id] ?
										<Card style={{marginBottom:"6px"}}>
											<Card.Body>
												<Card.Title style={{marginTop:"-10px"}}>
													<ListGroup horizontal>
													{searchState[owner.id].species.map(species => (
														<ListGroup.Item key={species} active={searchState[owner.id].selectedSpecies === species ? true : false} style={{textTransform:"capitalize", cursor:'pointer', paddingTop:"4px", paddingBottom:"4px"}} onClick={() => setSearchState(prevState => ({ ...prevState, [owner.id]:{...prevState[owner.id], selectedSpecies:species} }))}>{species}{species !== "other" ? "s" : ""}</ListGroup.Item>
													))}
													</ListGroup>
												</Card.Title>
												<ListGroup style={{height:"144px", overflowY:"auto", marginTop:"-12px"}}>
													<Scrollbar style={{height:"144px"}}>
														{owner.animals.filter(animal => animal.species === searchState[owner.id].selectedSpecies).map((animal, i) => (
															<ListGroup.Item key={animal.id}>
																<b>#{animal.id}:</b>&nbsp;&nbsp;{animal.name || "Unknown"} - {animal.status}
															</ListGroup.Item>
														))}
													{owner.animals.length < 1 ? <ListGroup.Item style={{marginTop:"32px"}}>No Animals</ListGroup.Item> : ""}
													</Scrollbar>
												</ListGroup>
										</Card.Body>
									</Card>
									: ""}
								</CardGroup>
						</div>
					))}
					<p>{data.isFetching ? 'Fetching ' + statusOptions + '...' :
						<span>{data.owners && data.owners.length ? '' : 'No ' + statusOptions + ' found.'}</span>}
					</p>
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

export default PersonSearch;
