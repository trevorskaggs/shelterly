import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowDownToSquare } from '@fortawesome/pro-regular-svg-icons';
import {
  faTimesSquare,
} from '@fortawesome/pro-regular-svg-icons';
import History from '../components/History';
import Header from '../components/Header';
import AnimalCards from '../components/AnimalCards';
import { SystemErrorContext } from '../components/SystemError';
import ShelterlyPrintifyButton from '../components/ShelterlyPrintifyButton';
import { printRoomAnimalCareSchedules } from './Utils';
import { useLocationWithRoutes } from '../hooks';

function RoomDetails({ id, incident, organization }) {

  const { setShowSystemError } = useContext(SystemErrorContext);
  const { getFullLocationFromPath } = useLocationWithRoutes();

  const [data, setData] = useState({name:'', description:'', building:null, building_name: '', shelter_name:'', shelter: null, animals:[], action_history:[]});
  const [showModal, setShowModal] = useState(false);
  const removeRoomSubmit = () => {
    axios.delete('/shelter/api/room/' + id + '/')
    .then(response => {
      navigate('/' + organization + '/' + incident + '/shelter/building/' + data.building)
    })
    .catch(error => {
      setShowSystemError(true);
    });
  }

  function buildAnimalUrl(animal) {
    return getFullLocationFromPath(`/${organization}/${incident}/animals/${animal.id_for_incident}`)
  }

  const handlePrintAllAnimalsClick = () =>
    printRoomAnimalCareSchedules(data.animals.map((animal) => ({
      ...animal,
      url: buildAnimalUrl(animal)
    })), id)

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchRoomData = async () => {
      // Fetch Room Details data.
      await axios.get('/shelter/api/room/' + id + '/?incident=' + incident, {
          cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
        }
      })
      .catch(error => {
        if (!unmounted) {
          setShowSystemError(true);
        }
      });
    };
    fetchRoomData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>
      <span style={{cursor:'pointer'}} onClick={() => navigate("/" + organization + "/" + incident + "/shelter/building/" + data.building)} className="mr-2"><FontAwesomeIcon icon={faArrowAltCircleLeft} size="sm" inverse /></span>
      {data.shelter_name} -&nbsp;
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
        <Link href={"/" + organization + "/" + incident + "/shelter/room/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
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
            <b>Building:</b> <Link href={"/" + organization + "/" + incident + "/shelter/building/" + data.building} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.building_name}</Link>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
    <div className="row mt-3">
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body style={{marginBottom:"-17px"}}>
            <Card.Title>
              <h4 className="mb-0">Animals ({data.animal_count || 0})
                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
                  <Link href={"/" + organization + "/" + incident + "/shelter/" + data.shelter + "/assign?building_id=" + data.building}><FontAwesomeIcon icon={faArrowDownToSquare} className="ml-1 fa-move-up" inverse /></Link>
                </OverlayTrigger>
                {data.animals?.length > 0 && (
                  <ShelterlyPrintifyButton
                    id="room-details-animal-schedules"
                    spinnerSize={1.5}
                    tooltipPlacement='top'
                    tooltipText='Print All Animal Care Schedules'
                    printFunc={handlePrintAllAnimalsClick}
                  />
                  
                )}
              </h4>
            </Card.Title>
            <hr/>
            <AnimalCards animals={data.animals} show_owner={true} organization={organization} incident={"/" + incident} />
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
