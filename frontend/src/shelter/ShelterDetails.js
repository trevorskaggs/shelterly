import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsAltH, faBuilding, faDoorOpen, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquare,
} from '@fortawesome/free-regular-svg-icons';
import History from '../components/History';
import Header from '../components/Header';

function ShelterDetails({ id, incident }) {

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
    action_history: [],
    unroomed_animals: [],
    animal_count: 0,
    room_count: 0,
  });

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchShelterData = async () => {
      // Fetch Shelter Details data.
      await axios.get('/shelter/api/shelter/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
        }
      })
      .catch(error => {
      });
    };
    fetchShelterData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id]);

  return (
    <>
      <Header>
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
          <Link href={"/" + incident + "/shelter/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
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
                  <b>Name:</b> {data.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Address:</b> {data.full_address}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Phone:</b> {data.display_phone || "No contact number listed"}
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
                <ListGroup.Item className="rounded" action><Link href={"/" + incident + "/intake/workflow/owner?shelter_id=" + id} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Walk-In (Owner)</b></Link></ListGroup.Item>
                <ListGroup.Item className="rounded" action><Link href={"/" + incident + "/intake/workflow/reporter?shelter_id=" + id} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Walk-In (Non-Owner)</b></Link></ListGroup.Item>
                <ListGroup.Item className="rounded" action><Link href={"/" + incident + "/dispatch/dispatchassignment/search"} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Dispatch Assignment</b></Link></ListGroup.Item>
                <ListGroup.Item>
                  <b>Currently Sheltering:</b> {data.animal_count + data.unroomed_animals.length} Animal{data.animal_count + data.unroomed_animals.length === 1 ? "" : "s"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Roomless:</b> {data.unroomed_animals.length} Animal{data.unroomed_animals.length === 1 ? "" : "s"}
                  <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
                    <Link href={"/" + incident + "/shelter/" + id + "/assign"}>
                      <span className="fa-layers" style={{marginLeft:"3px"}}>
                        <FontAwesomeIcon icon={faSquare} size="lg" inverse />
                        <FontAwesomeIcon icon={faArrowsAltH} transform={'shrink-4 right-1'} inverse />
                      </span>
                    </Link>
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
                <Link href={"/" + incident + "/shelter/building/new?shelter_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
              </OverlayTrigger>
            </h4>
          </Card.Title>
          <hr/>
          <span className="d-flex flex-wrap ml-0">
          {data.buildings.map(building => (
            <span key={building.id} className="pl-0 pr-0 mr-3 mb-3">
              <Link href={"/" + incident + "/shelter/building/" + building.id} className="building-link" style={{textDecoration:"none", color:"white"}}>
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
                          {building.animal_count} animal{building.animal_count !== 1 ? "s" : ""}
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
      <History action_history={data.action_history} />
    </>
  );
};

export default ShelterDetails;
