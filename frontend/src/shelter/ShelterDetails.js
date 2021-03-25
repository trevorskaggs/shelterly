import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, Col, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsAltH, faBuilding, faDoorOpen, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquare,
} from '@fortawesome/free-regular-svg-icons';
import {
  faTimesSquare,
} from '@fortawesome/pro-regular-svg-icons';
import History from '../components/History';
import Header from '../components/Header';

function ShelterDetails({id}) {

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

  const [showModal, setShowModal] = useState(false);
  const removeShelterSubmit = () => {
    axios.delete('/shelter/api/shelter/' + id + '/')
    .then(response => {
      navigate('/shelter')
    })
    .catch(e => {
      console.log(e);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
      // Fetch Shelter Details data.
      await axios.get('/shelter/api/shelter/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(e => {
        console.log(e);
      });
    };
    fetchShelterData();
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
          <Link href={"/shelter/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
        </OverlayTrigger>
        <OverlayTrigger
          key={"remove-shelter"}
          placement="bottom"
          overlay={
            <Tooltip id={`tooltip-remove-shelter`}>
              Remove shelter
            </Tooltip>
          }
        >
          <FontAwesomeIcon icon={faTimesSquare} className="ml-1 fa-move-down" style={{cursor:'pointer'}} inverse onClick={() => {setShowModal(true)}}/>
        </OverlayTrigger>
      </Header>
      <hr/>
      <Row className="d-flex">
        <Col>
          <Card className="border rounded d-flex" style={{width:"100%"}}>
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
                <ListGroup.Item className="rounded" action><Link href={"/intake/workflow/owner?shelter_id=" + id} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Walk-In (Owner)</b></Link></ListGroup.Item>
                <ListGroup.Item className="rounded" action><Link href={"/intake/workflow/reporter?shelter_id=" + id} style={{color:"#FFF"}}><FontAwesomeIcon icon={faDoorOpen} inverse/> <b>Intake from Walk-In (Non-Owner)</b></Link></ListGroup.Item>
                <ListGroup.Item>
                  <b>Currently Sheltering:</b> {data.animal_count} Animal{data.animal_count === 1 ? "" : "s"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <b>Awaiting Room:</b> {data.unroomed_animals.length} Animal{data.unroomed_animals.length === 1 ? "" : "s"}
                  <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
                    <Link href={"/shelter/" + id + "/assign"}>
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
      <Card className="border rounded d-flex mt-3" >
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
                <Link href={"/shelter/building/new?shelter_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
              </OverlayTrigger>
            </h4>
          </Card.Title>
          <hr/>
          <span className="d-flex flex-wrap ml-0">
          {data.buildings.map(building => (
            <Col key={building.id} xs="4" className="pl-0 pr-0">
              <Card className="border rounded mr-3 mb-3" style={{minWidth:"300px", whiteSpace:"nowrap", overflow:"hidden"}}>
                <div className="row no-gutters" style={{textTransform:"capitalize", marginRight:"-2px"}}>
                    <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
                      <div className="border-right hover-div" style={{width:"100px", minWidth:"100px"}}>
                        <Link href={"/shelter/building/" + building.id}><FontAwesomeIcon icon={faBuilding} size="6x" className="ml-3 building-icon" style={{paddingRight:"10px"}} inverse /></Link>
                      </div>
                      <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                        <h4 className="card-header border" title={building.name} style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"8px", marginLeft:"-11px", marginTop:"-1px", width:"100%", backgroundColor:"#808080", whiteSpace:"nowrap", overflow:"hidden"}}>{building.name}</h4>
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
            </Col>
          ))}
          </span>
        </Card.Body>
      </Card>
      <History action_history={data.action_history} />
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Shelter Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to remove this shelter and all of the associated buildings and rooms?</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => removeShelterSubmit()}>
            Yes
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShelterDetails;
