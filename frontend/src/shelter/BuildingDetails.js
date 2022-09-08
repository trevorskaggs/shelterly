import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { Link, navigate } from 'raviger';
import { Button, Card, ListGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faArrowDownToSquare } from '@fortawesome/pro-regular-svg-icons';
import { faTimesSquare } from '@fortawesome/pro-regular-svg-icons';
import History from '../components/History';
import Header from '../components/Header';
import { SystemErrorContext } from '../components/SystemError';

function BuildingDetails({ id, incident }) {

  const { setShowSystemError } = useContext(SystemErrorContext);

  const [data, setData] = useState({name:'', description: '', shelter: null, shelter_name:'', rooms:[], action_history:[]});
  const [showModal, setShowModal] = useState(false);
  const removeBuildingSubmit = () => {
    axios.delete('/shelter/api/building/' + id + '/')
    .then(response => {
      navigate('/' + incident + '/shelter/' + data.shelter)
    })
    .catch(error => {
      setShowSystemError(true);
    });
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchBuildingData = async () => {
      // Fetch Building Details data.
      await axios.get('/shelter/api/building/' + id + '/?incident=' + incident, {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData(response.data);
        }
      })
      .catch(error => {
        setShowSystemError(true);
      });
    };
    fetchBuildingData();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, [id, incident]);

  return (
    <>
    <Header>
      Building Details
      <OverlayTrigger
        key={"edit-building"}
        placement="bottom"
        overlay={
          <Tooltip id={`tooltip-edit-building`}>
            Update building
          </Tooltip>
        }
      >
        <Link href={"/" + incident + "/shelter/building/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
      <OverlayTrigger
          key={"remove-building"}
          placement="bottom"
          overlay={
            <Tooltip id={`tooltip-remove-building`}>
              Remove building
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
            <b>Shelter:</b> <Link href={"/" + incident + "/shelter/" + data.shelter} className="text-link" style={{textDecoration:"none", color:"white"}}>{data.shelter_name}</Link>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
    <Card className="mt-3 border rounded d-flex">
      <Card.Body style={{marginBottom:"-20px"}}>
        <Card.Title>
          <h4>Rooms ({data.rooms.length})
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
              <Link href={"/" + incident + "/shelter/" + data.shelter + "/assign?building_id=" + id}><FontAwesomeIcon icon={faArrowDownToSquare} className="ml-1 fa-move-up" inverse /></Link>
            </OverlayTrigger>
            <OverlayTrigger
              key={"add-room"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-add-room`}>
                  Add a room
                </Tooltip>
              }
            >
            <Link href={"/" + incident + "/shelter/building/room/new?building_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
          </OverlayTrigger>
          </h4>
        </Card.Title>
        <hr/>
        <span className="d-flex flex-wrap align-items-end">
          {data.rooms.map(room => (
            <span key={room.id} className="mr-3 mb-3">
              <Link href={"/" + incident + "/shelter/room/" + room.id} className="building-link" style={{textDecoration:"none", color:"white"}}>
                <Card className="border rounded shelter-hover-div" style={{width:"110px", height:"110px"}}>
                  <div style={{marginRight:"-2px"}}>
                    <div className="card-header border pr-0" title={room.name} style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"3px", marginLeft:"-1px", marginTop:"-1px", width:"100%", backgroundColor:"#615e5e", fontSize:"16px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                      {room.name}
                    </div>
                  </div>
                  <Card.Text className="mb-0 pl-1">
                    {room.animal_count} Animal{room.animal_count === 1 ? "" : "s"}
                  </Card.Text>
                </Card>
              </Link>
            </span>
          ))}
          {data.rooms.length < 1 ? <p>No rooms have been created yet.</p> : ""}
        </span>
      </Card.Body>
    </Card>
    <History action_history={data.action_history} />
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Building Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to remove this building and all of the associated rooms?</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => removeBuildingSubmit()}>
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

export default BuildingDetails;
