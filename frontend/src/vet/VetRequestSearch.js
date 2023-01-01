import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { Link, useQueryParams } from 'raviger';
import { Button, Card, CardGroup, Col, Form, FormControl, InputGroup, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDotCircle
} from '@fortawesome/free-regular-svg-icons';
import { faChevronDoubleDown, faChevronDoubleUp } from '@fortawesome/pro-solid-svg-icons';
import Moment from 'react-moment';
import { useMark } from '../hooks';
import Header from '../components/Header';
import Scrollbar from '../components/Scrollbars';
import { ITEMS_PER_PAGE } from '../constants';
import { SystemErrorContext } from '../components/SystemError';

function VetRequestSearch({ incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    search = '',
  } = queryParams;

  const priorityText = {urgent:'Urgent', when_available:'When Available'};

  const [data, setData] = useState({vet_requests: [], isFetching: false});
  // const [searchState, setSearchState] = useState({});
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const tempSearchTerm = useRef(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const { markInstances } = useMark();

  // Update searchTerm when field input changes.
  const handleChange = event => {
    tempSearchTerm.current.value = event.target.value;
  };

  // Use searchTerm to filter vet_requests.
  const handleSubmit = async event => {
    event.preventDefault();
    setSearchTerm(tempSearchTerm.current.value);
    setPage(1);
  }

  const handleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  function setFocus(pageNum) {
    if (pageNum !== page) {
      tempSearchTerm.current.focus();
    }
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchVetRequests = async () => {
      setData({vet_requests: [], isFetching: true});
      // Fetch ServiceRequest data.
      await axios.get('/vet/api/vetrequest/?search=' + searchTerm, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setNumPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
          setData({vet_requests: response.data, isFetching: false});

          // highlight search terms
          markInstances(searchTerm);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({vet_requests: [], isFetching: false});
          setShowSystemError(true);
        }
      });
    };
    fetchVetRequests();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [searchTerm, incident]);

  return (
    <div className="ml-2 mr-2">
      <Header>Search Veterinary Requests</Header>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Search"
            name="searchTerm"
            onChange={handleChange}
            ref={tempSearchTerm}
          />
          <InputGroup.Append>
            <Button variant="outline-light" type="submit" style={{borderRadius:"0 5px 5px 0"}}>Search</Button>
          </InputGroup.Append>
          <Button variant="outline-light" className="ml-1" onClick={handleShowFilters}>Advanced {showFilters ? <FontAwesomeIcon icon={faChevronDoubleUp} size="sm" /> : <FontAwesomeIcon icon={faChevronDoubleDown} size="sm" />}</Button>
        </InputGroup>
      </Form>
      {data.vet_requests.map((vet_request, index) => (
        <div key={vet_request.id} className="mt-3" hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div className="card-header">
            <h4 style={{marginBottom:"-2px",  marginLeft:"-12px"}}>
              <OverlayTrigger
                key={"request-details"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-request-details`}>
                    Veterinary request details
                  </Tooltip>
                }
              >
                <Link href={"/" + incident + "/vet/vetrequest/" + vet_request.id}><FontAwesomeIcon icon={faDotCircle} className="mr-2" inverse /></Link>
              </OverlayTrigger>
              VR#{vet_request.id}
              &nbsp;-&nbsp;<Moment format="L">{vet_request.open}</Moment>
              &nbsp;| {vet_request.status}
            </h4>
          </div>
          <CardGroup>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px", marginLeft:"0px"}} className="row">
                  Information
                </Card.Title>
                <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                  <ListGroup>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <b>Patient: </b><Link href={"/" + incident + "/animals/" + vet_request.animal_object.id} className="text-link" style={{textDecoration:"none", color:"white"}}>A#{vet_request.animal_object.id}</Link>
                        </Col>
                        <Col>
                          <b>Name:</b>&nbsp;{vet_request.animal_object.name || "Unknown"}
                        </Col>
                        <Col style={{textTransform:"capitalize"}}>
                          <b>Species:</b> {vet_request.animal_object.species}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <b>Priority: </b>{priorityText[vet_request.priority]}
                        </Col>
                        <Col>
                          <b>Assignee:</b> {vet_request.assignee_object ? <span>{vet_request.assignee_object.first_name} {vet_request.assignee_object.last_name}</span> : "Unassigned"}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <b>Presenting Complaints:</b> {vet_request.complaints_text || "None"}
                    </ListGroup.Item>
                  </ListGroup>
                </Scrollbar>
              </Card.Body>
            </Card>
            <Card style={{marginBottom:"6px"}}>
              <Card.Body>
                <Card.Title style={{marginTop:"-9px", marginBottom:"8px"}}>Treatments</Card.Title>
                <ListGroup style={{height:"144px", overflowY:"auto"}}>
                  <Scrollbar style={{height:"144px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
                    {vet_request.treatment_plans.map((treatment, i) => (
                      <ListGroup.Item key={treatment.id}>
                        <Link href={"/" + incident + "/vet/treatment/" + treatment.id} className="text-link" style={{textDecoration:"none", color:"white"}}>{treatment.treatment_object.description || "Unknown"}</Link>
                      </ListGroup.Item>
                    ))}
                  {vet_request.treatment_plans.length < 1 ? <ListGroup.Item style={{marginTop:"32px"}}>No Treatments</ListGroup.Item> : ""}
                  </Scrollbar>
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
        </div>
      ))}
      <p>{data.isFetching ? 'Fetching veterinary requests...' : <span>{data.vet_requests && data.vet_requests.length ? '' : 'No Veterinary Requests found.'}</span>}</p>
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

export default VetRequestSearch;
