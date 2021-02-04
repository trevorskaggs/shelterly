import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button, Card, CardGroup, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faCircle, faExclamationCircle, faQuestionCircle, faHome, faHelicopter, faHeart, faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons';
import { faHomeAlt } from '@fortawesome/pro-solid-svg-icons';
import Header from '../components/Header';

function PersonSearch() {

	const [data, setData] = useState({owners: [], isFetching: false});
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
	}, [searchTerm]);

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
								value={tempSearchTerm}
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
												<h4 style={{marginBottom: "-2px"}}>{owner.first_name} {owner.last_name}
													{owner.agency ? <span> ({owner.agency})</span> : ""}
													{owner.is_owner ?
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
																						<FontAwesomeIcon icon={faClipboardList} inverse />
																					</Link>
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
																{['cats', 'dogs', 'horses', 'other'].map(species => (
																		<ListGroup key={species}>
																				{owner.animals.filter(animal => species.includes(animal.species)).length > 0 ?
																				<ListGroup.Item style={{borderRadius: 0}}><b style={{textTransform:"capitalize"}}>{species}: </b>
																				{owner.animals.filter(animal => species.includes(animal.species)).map((animal, i) => (
																				<span key={animal.id}>{i > 0 && ", "}{animal.name || "Unknown"}
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
																		</ListGroup.Item>
																		: ""}
																		</ListGroup>
																))}
																{owner.animals.length < 1 ? <ListGroup><ListGroup.Item>No Animals</ListGroup.Item></ListGroup> : ""}
														</Card.Body>
													</Card>
											</CardGroup>
									</div>
							</div>
					))}
					<p>{data.isFetching ? 'Fetching Owners...' :
						<span>{data.owners && data.owners.length ? '' : 'No Owners found.'}</span>}
					</p>
			</div>
	</>
	)
}

export default PersonSearch;