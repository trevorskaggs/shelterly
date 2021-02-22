import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';

function PersonSearch() {

	const [data, setData] = useState({owners: [], isFetching: false});
	const [searchState, setSearchState] = useState({});
	const [statusOptions, setStatusOptions] = useState({status:"owner", ownerColor: "primary", reporterColor:"secondary"});
	const [searchTerm, setSearchTerm] = useState("");
	const [tempSearchTerm, setTempSearchTerm] = useState("");

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
			await axios.get('/people/api/person/?search=' + searchTerm + '&status=' + statusOptions.status, {
				cancelToken: source.token,
			})
			.then(response => {
				if (!unmounted) {
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
	}, [searchTerm, statusOptions.status]);

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
								<Button variant="outline-light" type="submit">Search</Button>
							</InputGroup.Append>
							<ButtonGroup className="ml-3">
								<Button variant={statusOptions.ownerColor} onClick={() => setStatusOptions({status:"owner", ownerColor:"primary", reporterColor:"secondary"})}>Owners</Button>
								<Button variant={statusOptions.reporterColor} onClick={() => setStatusOptions({status:"reporter", ownerColor:"secondary", reporterColor:"primary"})}>Reporters</Button>
							</ButtonGroup>
						</InputGroup>
					</Form>
					{data.owners.map(owner => (
							<div key={owner.id} className="mt-3">
									<div className="card-header"> {owner.first_name ?
										<h4 style={{marginBottom: "-2px"}}>{owner.first_name} {owner.last_name}
											{owner.agency ? <span> ({owner.agency})</span> : ""}
											{statusOptions.status === 'owner' ?
											<OverlayTrigger
												key={"owner-details"}
												placement="top"
												overlay={
													<Tooltip id={`tooltip-owner-details`}>
														Owner details
													</Tooltip>
												}
											>
												<Link href={"/people/owner/" + owner.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse/></Link>
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
												<Link href={"/people/reporter/" + owner.id} target="_blank"><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse/></Link>
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
													<Scrollbar autoHeight autoHide autoHeightMax={144} renderThumbVertical={props => <div {...props} style={{...props.style, backgroundColor: 'rgba(226, 226, 226, 0.2)'}} />}>
														{owner.animals.filter(animal => animal.species === searchState[owner.id].selectedSpecies).map((animal, i) => (
															<ListGroup.Item key={animal.id}>
																{animal.name || "Unknown"} - {animal.status}
															</ListGroup.Item>
														))}
													</Scrollbar>
													{owner.animals.length < 1 ? <ListGroup.Item style={{marginTop:"32px"}}>No Animals</ListGroup.Item> : ""}
												</ListGroup>
										</Card.Body>
									</Card>
									: ""}
								</CardGroup>
						</div>
					))}
					<p>{data.isFetching ? 'Fetching ' + statusOptions.status + 's...' :
						<span>{data.owners && data.owners.length ? '' : 'No ' + statusOptions.status + 's found.'}</span>}
					</p>
	</div>
	)
}

export default PersonSearch;
