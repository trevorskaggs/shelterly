import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, Col, Collapse, ListGroup, OverlayTrigger, Pagination, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faChevronCircleDown, faChevronCircleRight, faDoorOpen, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faArrowDownToSquare } from '@fortawesome/pro-regular-svg-icons';
import Moment from 'react-moment';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';
import { ITEMS_PER_PAGE } from '.././constants';

function ShelterDetails({ id, incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);

  const [data, setData] = useState({
    name: '',
    address: '',
    full_address: '',
    city: '',
    state: '',
    zip_code: '',
    description: '',
    image: '',
    phone: '',
    display_phone: '',
    buildings: [],
    unroomed_animals: [],
    intake_summaries: [],
    animal_count: 0,
  });

  useEffect(() => {
    setNumPages(Math.ceil(data.intake_summaries.length / ITEMS_PER_PAGE))
  }, [data.intake_summaries]);

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchShelterData = async () => {
      // Fetch Shelter Details data.
      await axios.get('/shelter/api/shelter/' + id + '/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          let count = 0;
          response.data.unroomed_animals.forEach(unroomed_animal => {
            count = count + unroomed_animal.animal_count;
          });
          response.data['unroomed_count'] = count;
          setData(response.data);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchShelterData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
      <Header>
        {data.name} -&nbsp;
        Shelter Details
        <OverlayTrigger
          key={"edit-shelter"}
          placement="bottom"
          overlay={
            <Tooltip id={`tooltip-edit-shelter`}>
              Update shelter
            </Tooltip>
          }
        >
          <Link href={"/" + organization + "/" + incident + "/shelter/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
        </OverlayTrigger>
      </Header>
      <hr/>
      <Row className="d-flex">
        <Col>
          <Card className="border rounded d-flex" style={{width:"100%", height: "100%"}}>
            <Card.Body>
              <Card.Title>
                <h4>Information</h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <ListGroup.Item>
                  <b>Address:</b> {data.full_address}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Phone:</b> {data.display_phone || "No contact number listed"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Currently Sheltering:</b> {data.animal_count} Animal{data.animal_count === 1 ? "" : "s"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Description: </b>{data.description || "None"}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col className="d-flex flex-column pl-0">
          <Card className="border rounded d-flex pl-0" style={{width:"100%", height:"100%"}}>
            <Card.Body>
              <Card.Title>
                <h4>Intake</h4>
              </Card.Title>
              <hr/>
              <ListGroup variant="flush" style={{marginTop:"-13px", marginBottom:"-13px"}}>
                <ListGroup.Item className="rounded" action><Link href={"/" + organization + "/" + incident + "/intake/workflow/owner?shelter_id=" + id} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Walk-In (Owner)</b></Link></ListGroup.Item>
                <ListGroup.Item className="rounded" action><Link href={"/" + organization + "/" + incident + "/intake/workflow/reporter?shelter_id=" + id} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Walk-In (Non-Owner)</b></Link></ListGroup.Item>
                <ListGroup.Item className="rounded" action><Link href={"/" + organization + "/" + incident + "/shelter/" + id + "/intake"} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Dispatch Assignment</b></Link></ListGroup.Item>
                <ListGroup.Item>
                  <b>Roomless:</b> {data.unroomed_count} Animal{data.unroomed_count === 1 ? "" : "s"}
                  <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
                    <Link href={"/" + organization + "/" + incident + "/shelter/" + id + "/assign"}><FontAwesomeIcon icon={faArrowDownToSquare} size="lg" className="ml-1 fa-move-up" inverse /></Link>
                  </OverlayTrigger>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="border rounded d-flex mt-3">
        <Card.Body style={{marginBottom:"-20px"}}>
          <Card.Title>
            <h4 className="mb-0">Buildings ({data.buildings.length})
              <OverlayTrigger
                key={"add-building"}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-add-building`}>
                    Add a building
                  </Tooltip>
                }
              >
                <Link href={"/" + organization + "/" + incident + "/shelter/building/new?shelter_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
              </OverlayTrigger>
            </h4>
          </Card.Title>
          <hr/>
          <span className="d-flex flex-wrap ml-0">
          {data.buildings.map(building => (
            <span key={building.id} className="pl-0 pr-0 mr-3 mb-3">
              <Link href={"/" + organization + "/" + incident + "/shelter/building/" + building.id} className="building-link" style={{textDecoration:"none", color:"white"}}>
                <Card className="border rounded shelter-hover-div" style={{minWidth:"315px", maxWidth:"315px", whiteSpace:"nowrap", overflow:"hidden"}}>
                  <div className="row no-gutters hover-div" style={{textTransform:"capitalize", marginRight:"-2px"}}>
                    <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                      <div className="border-right" style={{width:"100px", minWidth:"100px"}}>
                        <FontAwesomeIcon icon={faBuilding} size="6x" className="ml-3 building-icon" style={{paddingRight:"10px"}} inverse />
                      </div>
                      <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                        <div className="border" title={building.name} style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"8px", marginLeft:"-11px", marginRight:"-5px", marginTop:"-1px", width:"100%", fontSize:"18px", backgroundColor:"#615e5e", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{building.name}</div>
                        <div style={{marginTop:"2px"}}>
                          {building.rooms.length} room{building.rooms.length !== 1 ? "s" : ""}
                        </div>
                        <div>
                          {building.animal_count||0} animal{building.animal_count !== 1 ? "s" : ""}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Link>
            </span>
          ))}
          {data.buildings.length < 1 ? <p>No buildings have been created yet.</p> : ""}
          </span>
        </Card.Body>
      </Card>
      {/* <History action_history={data.action_history} /> */}
      {data.intake_summaries.length > 0 ? <hr/> : ""}
      {data.intake_summaries.length > 0 ? <h2 className="mb-3">Intake History<FontAwesomeIcon icon={faChevronCircleRight} hidden={showHistory} onClick={() => setShowHistory(!showHistory)} className="ml-2" style={{verticalAlign:"middle"}} inverse /><FontAwesomeIcon icon={faChevronCircleDown} hidden={!showHistory} onClick={() => setShowHistory(!showHistory)} className="ml-2" style={{verticalAlign:"middle"}} inverse /></h2> : ""}
      {data.intake_summaries.map((intakesummary, index) => (
        <Collapse key={intakesummary.id} in={showHistory} hidden={page !== Math.ceil((index+1)/ITEMS_PER_PAGE)}>
          <div>
            <Card className="border rounded d-flex mb-2">
              <Card.Body>
              {intakesummary.intake_type === 'owner_walkin' ? 'Owner Walk-In ' : intakesummary.intake_type === 'reporter_walkin' ? 'Reporter Walk-In ' : 'Dispatch '}<Link href={"/" + organization + "/" + incident + "/shelter/intakesummary/" + intakesummary.id} className="text-link" style={{textDecoration:"none", color:"white"}}>Intake Summary #{intakesummary.id}</Link> for {intakesummary.animal_count} animal{intakesummary.animal_count === 1 ? '' : 's'} on <Moment format="MMMM Do YYYY">{intakesummary.date}</Moment> at <Moment format="HH:mm">{intakesummary.date}</Moment>.
              </Card.Body>
            </Card>
          </div>
        </Collapse>
      ))}
      <Pagination className="custom-page-links" size="lg" hidden={!showHistory} onClick={(e) => {setPage(parseInt(e.target.innerText))}}>
          {[...Array(numPages).keys()].map(x =>
        <Pagination.Item key={x+1} active={x+1 === page}>
          {x+1}
        </Pagination.Item>)
          }
      </Pagination>
    </>
  );
};

export default ShelterDetails;
