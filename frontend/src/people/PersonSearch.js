import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Link, navigate, useQueryParams } from 'raviger';
import { Button, ButtonGroup, Card, CardGroup, Col, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faInfoCircle,
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { useMark, useSubmitting } from '../hooks';
import Header from '../components/Header';
import { titleCase } from '../components/Utils';
import Scrollbar from '../components/Scrollbars';
import ButtonSpinner from '../components/ButtonSpinner';
import { ITEMS_PER_PAGE } from '../constants';
import { SystemErrorContext } from '../components/SystemError';
import { AuthContext } from "../accounts/AccountsReducer";
import { printAllOwnersDetails } from './Utils';

function PersonSearch({ incident, organization }) {

  const { dispatch, state } = useContext(AuthContext);
  const { setShowSystemError } = useContext(SystemErrorContext);

	// Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
    person = 'owners',
  } = queryParams;

	const [data, setData] = useState({owners: [], isFetching: false});
  const [organizationData, setOrganizationData] = useState({
    name: '',
    short_name: '',
    liability_name: '',
    liability_short_name: '',
  });
	const [searchState, setSearchState] = useState({});
	const [statusOptions, setStatusOptions] = useState(person);
	const [searchTerm, setSearchTerm] = useState(search);
	const tempSearchTerm = useRef(null);
	const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [goToID, setGoToID] = useState('');
	const { markInstances } = useMark();
  const {
    isSubmittingById,
    handleSubmitting,
    submittingComplete,
    submittingLabel
  } = useSubmitting();

  // Update searchTerm when field input changes.
  const handleChange = event => {
    tempSearchTerm.current.value = event.target.value;
  };

  const handleIDChange = async event => {
    setGoToID(event.target.value);
  };

  // Use searchTerm to filter owners.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm.current.value);
		setPage(1);
  }

  function handlePrintAllClick(e) {
    e.preventDefault();

    handleSubmitting()
      .then(() => printAllOwnersDetails(data.owners, organizationData))
      .then(submittingComplete);
  }

	function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  }

	// Hook for initializing data.
	useEffect(() => {
		let unmounted = false;
		let source = axios.CancelToken.source();

		const fetchOwners = () => {
			setData({owners: [], isFetching: true});
			// Fetch People data.
			axios.get('/people/api/person/?search=' + searchTerm + '&status=' + statusOptions + '&incident=' + incident + '&organization=' + organization +'&training=' + (state && state.incident.training), {
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
							if (!species.includes(animal.species_string)) {
								species.push(animal.species_string)
							}
						})
            owner.reporter_animals.forEach(animal => {
							if (!species.includes(animal.species_string)) {
								species.push(animal.species_string)
							}
						})
            species.sort(function(a, b) {
              return a.localeCompare(b);
            });
						search_state[owner.id] = {species:species, selectedSpecies:species[0]}
						})
					setSearchState(search_state);

					// highlight search terms
          markInstances(searchTerm);
				}
			})
			.catch(error => {
				if (!unmounted) {
					setData({owners: [], isFetching: false});
          setShowSystemError(true);
				}
			});
		};

    fetchOwners();

    const fetchOrganizationData = async () => {
      // Fetch Organization data.
      await axios.get('/incident/api/organization/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setOrganizationData(response.data[0]);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchOrganizationData();

		// Cleanup.
		return () => {
			unmounted = true;
			source.cancel();
		};
	}, [searchTerm, statusOptions, incident]);

	return (
    <div className="ml-2 mr-2">
    <Header>Search Owners</Header>
    <hr/>
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col xs="2" style={{maxWidth:"150px", marginRight:"-10px", paddingRight:"0px"}}>
          <InputGroup>
            <FormControl
              type="text"
              placeholder="ID #"
              name="searchIDTerm"
              onChange={handleIDChange}
            />
            <InputGroup.Append>
              <Button variant="outline-light" type="submit" disabled={!goToID} style={{borderRadius:"0 5px 5px 0"}} onClick={(e) => {navigate("/" + organization + "/" + incident + "/people/owner/" + goToID)}}>Go</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <FormControl
              type="text"
              placeholder="Search"
              name="searchTerm"
              onChange={handleChange}
              ref={tempSearchTerm}
              />
            <InputGroup.Append>
              <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search
                <OverlayTrigger
                  key={"search-information"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-search-information`}>
                      Searchable fields: name, phone number, email, drivers license, address fields, and animal names.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="ml-1" size="sm" inverse />
                </OverlayTrigger>
              </Button>
            </InputGroup.Append>
            <ButtonGroup className="ml-1">
              <Button variant={statusOptions === "owners" ? "primary" : "secondary"} onClick={statusOptions !== "owners" ? () => {setPage(1);setStatusOptions("owners")} : () => {setPage(1);setStatusOptions("")}}>Owners</Button>
              <Button variant={statusOptions === "reporters" ? "primary" : "secondary"} onClick={statusOptions !== "reporters" ? () => {setPage(1);setStatusOptions("reporters")} : () => {setPage(1);setStatusOptions("")}}>Reporters</Button>
            </ButtonGroup>
            <ButtonSpinner
              variant="outline-light"
              className="ml-1 print-all-btn-icon"
              onClick={handlePrintAllClick}
              isSubmitting={isSubmittingById()}
              isSubmittingText={submittingLabel}
            >
              Print All ({`${data.owners.length}`})
              <FontAwesomeIcon icon={faPrint} className="ml-2 text-light" inverse />
            </ButtonSpinner>
          </InputGroup>
        </Col>
      </Row>
    </Form>
    {data.owners.map((owner, index) => (
      <div key={owner.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
        <div className="card-header"> {owner.first_name ?
          <h4 style={{marginBottom: "-2px",  marginLeft:"-12px"}}>
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
              <Link href={"/" + organization + "/" + incident + "/people/owner/" + owner.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse/></Link>
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
              <Link href={"/" + organization + "/" + incident + "/people/reporter/" + owner.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse/></Link>
            </OverlayTrigger>
            }
            {owner.first_name} {owner.last_name}
            {owner.agency ? <span> ({owner.agency})</span> : ""}
          </h4> : "Unknown"}
        </div>
        <CardGroup>
          <Card style={{marginBottom:"6px"}}>
            <Card.Body>
              <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Information</Card.Title>
              <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                <ListGroup>
                  <ListGroup.Item><b>Phone: </b>{owner.phone ? <span>{owner.display_phone} </span> : "None"}</ListGroup.Item>
                  <ListGroup.Item><b>Email: </b>{owner.email ? <span>{owner.email} </span> : "None"}</ListGroup.Item>
                  {owner.full_address ?
                    <ListGroup.Item><b>Address: </b>{owner.full_address}</ListGroup.Item>
                  : ""}
                  {owner.requests && owner.requests.map(request => (
                    <ListGroup.Item key={request.id}><b>Service Request: </b><Link href={"/" + organization + "/" + incident + "/hotline/servicerequest/" + request.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{request.full_address}</Link></ListGroup.Item>
                  ))}
                </ListGroup>
              </Scrollbar>
            </Card.Body>
          </Card>
          {searchState[owner.id] ?
          <Card style={{marginBottom:"6px"}}>
            <Card.Body style={{width:"525px"}}>
              <Card.Title style={{marginTop:"-10px"}}>
                <Scrollbar horizontal="true" autoHide style={{height:"32px", width:"485px"}} renderView={props => <div {...props} style={{...props.style, marginBottom:"-18px", marginRight:"0px", overflowX:"auto", overflowY: "hidden"}}/>} renderThumbVertical={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup horizontal>
                  {searchState[owner.id].species.map(species => (
                    <ListGroup.Item key={species} active={searchState[owner.id].selectedSpecies === species ? true : false} style={{textTransform:"capitalize", cursor:'pointer', paddingTop:"4px", paddingBottom:"4px"}} onClick={() => setSearchState(prevState => ({ ...prevState, [owner.id]:{...prevState[owner.id], selectedSpecies:species} }))}>{species}{!["other", "sheep", "cattle"].includes(species) ? "s" : ""}</ListGroup.Item>
                  ))}
                  </ListGroup>
                </Scrollbar>
              </Card.Title>
              {statusOptions === 'owners' ?
              <ListGroup style={{height:"144px", overflowY:"auto", marginTop:"-12px"}}>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {owner.animals.filter(animal => animal.species_string === searchState[owner.id].selectedSpecies).map((animal, i) => (
                    <ListGroup.Item key={animal.id}>
                      <b><Link href={"/" + organization + "/" + incident + "/animals/" + animal.id} className="text-link" style={{textDecoration:"none", color:"white"}}>#{animal.id}</Link>:</b>&nbsp;&nbsp;{Number(animal.animal_count) === 1 ? <span>{animal.name || "Unknown"}</span> : <span>{animal.animal_count} {titleCase(animal.species_string)}{["cattle", "sheep"].includes(animal.species_string) ? "" : "s"}</span>}
                      {animal.color_notes ?
                      <OverlayTrigger
                        key={"animal-color-notes"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-animal-color-notes`}>
                            {animal.color_notes}
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faClipboardList} style={{marginLeft:"3px"}} size="sm" inverse />
                      </OverlayTrigger>
                      : ""}
                      &nbsp;- {animal.status}
                    </ListGroup.Item>
                  ))}
                  {owner.animals.length < 1 ? <ListGroup.Item>No Animals</ListGroup.Item> : ""}
                </Scrollbar>
              </ListGroup> : ""}
              {statusOptions === 'reporters' ?
              <ListGroup style={{height:"144px", overflowY:"auto", marginTop:"-12px"}}>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  {owner.reporter_animals.filter(animal => animal.species_string === searchState[owner.id].selectedSpecies).map((animal, i) => (
                    <ListGroup.Item key={animal.id}>
                      <b>#{animal.id}:</b>&nbsp;&nbsp;<Link href={"/" + organization + "/" + incident + "/animals/" + animal.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{animal.name || "Unknown"}</Link>
                      {animal.color_notes ?
                      <OverlayTrigger
                        key={"animal-color-notes"}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-animal-color-notes`}>
                            {animal.color_notes}
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon icon={faClipboardList} style={{marginLeft:"3px"}} size="sm" inverse />
                      </OverlayTrigger>
                      : ""}
                      &nbsp;- {animal.status}
                    </ListGroup.Item>
                  ))}
                  {owner.reporter_animals.length < 1 ? <ListGroup.Item style={{}}>No Animals</ListGroup.Item> : ""}
                </Scrollbar>
              </ListGroup> : ""}
            </Card.Body>
          </Card>
          : ""}
        </CardGroup>
      </div>
    ))}
    <p>{data.isFetching ? 'Fetching ' + statusOptions + '...' :
      <span>{data.owners && data.owners.length ? '' : 'No ' + statusOptions + ' found.'}</span>}
    </p>
    <Pagination className="custom-page-links" size="lg" onClick={(e) => {setFocus(parseInt(e.target.innerText));setPage(parseInt(e.target.innerText))}}>
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
