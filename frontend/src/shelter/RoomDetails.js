import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsAltH, faClipboardList, faEdit,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquare,
} from '@fortawesome/free-regular-svg-icons';
import {
  faTimesSquare,
} from '@fortawesome/pro-regular-svg-icons';
import History from '../components/History';
import Header from '../components/Header';
import AnimalCards from '../components/AnimalCards';

function RoomDetails({id}) {

  const [data, setData] = useState({name:'', description:'', building:null, building_name: '', shelter_name:'', shelter: null, animals:[], action_history:[]});
  const [showModal, setShowModal] = useState(false);
  const removeRoomSubmit = () => {
    axios.delete('/shelter/api/room/' + id + '/')
    .then(response => {
      navigate('/shelter/building/' + data.building)
    })
    .catch(e => {
      console.log(e);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchRoomData = async () => {
      // Fetch Room Details data.
      await axios.get('/shelter/api/room/' + id + '/', {
          cancelToken: source.token,
      })
      .then(response => {
          setData(response.data);
      })
      .catch(e => {
          console.log(e);
      });
    };
    fetchRoomData();
  }, [id]);

  return (
    <>
    <Header>
      Room Details
      <OverlayTrigger
        key={"edit-room"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-room`}>
            Update room
          </Tooltip>
        }
      >
        <Link href={"/shelter/room/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
      <OverlayTrigger
          key={"remove-room"}
          placement="bottom"
          overlay={
            <Tooltip id={`tooltip-remove-room`}>
              Remove room
            </Tooltip>
          }
        >
          <FontAwesomeIcon icon={faTimesSquare} className="ml-1 fa-move-down" style={{cursor:'pointer'}} inverse onClick={() => {setShowModal(true)}}/>
        </OverlayTrigger>
    </Header>
    <hr/>
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
          {data.description ? <ListGroup.Item>
            <b>Description: </b>{data.description}
          </ListGroup.Item> : ""}
          <ListGroup.Item>
            <b>Building:</b> {data.building_name}
            <OverlayTrigger
              key={"building-details"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-building-details`}>
                  Building details
                </Tooltip>
              }
            >
              <Link href={"/shelter/building/" + data.building}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
            </OverlayTrigger>
          </ListGroup.Item>
          <ListGroup.Item>
            <b>Shelter:</b> {data.shelter_name}
            <OverlayTrigger
              key={"shelter-details"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-shelter-details`}>
                  Shelter details
                </Tooltip>
              }
            >
              <Link href={"/shelter/" + data.shelter}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
            </OverlayTrigger>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Animals ({data.animals.length})
                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
                  <Link href={"/shelter/" + data.shelter + "/assign?building_id=" + data.building}>
                    <span className="fa-layers" style={{marginLeft:"3px"}}>
                      <FontAwesomeIcon icon={faSquare} inverse />
                      <FontAwesomeIcon icon={faArrowsAltH} size="sm" transform={'shrink-4'} inverse />
                    </span>
                  </Link>
                </OverlayTrigger>
              </h4>
            </Card.Title>
            <hr/>
            <AnimalCards animals={data.animals} show_owner={true} />
            {data.animals.length < 1 ? <p>No animals have been assigned to this room.</p> : ""}
          </Card.Body>
        </Card>
      </div>
    </div>
    <History action_history={data.action_history} />
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Room Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to remove this room?</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => removeRoomSubmit()}>
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

export default RoomDetails;
