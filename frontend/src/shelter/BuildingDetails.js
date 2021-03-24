import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faMinusSquare, faPlusSquare, faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import History from '../components/History';
import Header from '../components/Header';

function BuildingDetails({id}) {

  const [data, setData] = useState({name:'', description: '', shelter: null, shelter_name:'', rooms:[], action_history:[]});
  const [roomToDelete, setRoomToDelete] = useState({id:0, name:''});
  const [showRoomConfirm, setShowRoomConfirm] = useState(false);
  const handleRoomClose = () => setShowRoomConfirm(false);

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchBuildingData = async () => {
      // Fetch Building Details data.
      await axios.get('/shelter/api/building/' + id + '/', {
        cancelToken: source.token,
      })
      .then(response => {
        setData(response.data);
      })
      .catch(e => {
        console.log(e);
      });
    };
    fetchBuildingData();
  }, [id]);

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
        <Link href={"/shelter/building/edit/" + id}><FontAwesomeIcon icon={faEdit} className="ml-1" inverse /></Link>
      </OverlayTrigger>
    </Header>
    <hr/>
    <Card className="border rounded d-flex" style={{width:"100%"}}>
      <Card.Body>
        <Card.Title>
          <h4>Information
            <OverlayTrigger key={"assign"} placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
              <Link href={"/shelter/" + data.shelter + "/assign?building_id=" + id}><FontAwesomeIcon className="ml-1" icon={faWarehouse} inverse/></Link>
            </OverlayTrigger>
          </h4>
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
    <Card className="mt-3 border rounded d-flex">
      <Card.Body style={{marginBottom:"-15px"}}>
        <Card.Title>
          <h4>Rooms
            <OverlayTrigger
              key={"add-room"}
              placement="top"
              overlay={
                <Tooltip id={`tooltip-add-room`}>
                  Add a room
                </Tooltip>
              }
            >
            <Link href={"/shelter/building/room/new?building_id=" + id}><FontAwesomeIcon icon={faPlusSquare} className="ml-1" inverse /></Link>
          </OverlayTrigger>
          </h4>
        </Card.Title>
        <hr/>
        <span className="d-flex flex-wrap align-items-end">
          {data.rooms.map(room => (
            <Card key={room.id} className="border rounded mr-3 mb-3" style={{width:"110px", height:"110px"}}>
              <div style={{marginRight:"-2px"}}>
              <h5 className="card-header border" title={room.name} style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"3px", marginLeft:"-1px", marginTop:"-1px", width:"100%", backgroundColor:"#808080", whiteSpace:"nowrap", overflow:"hidden"}}>
                {room.name}
              </h5>
              </div>
              <Card.Text className="mb-0 pl-1">
                {room.animal_count} Animals
              </Card.Text>
              <Card.Text className="pl-1">
                <OverlayTrigger
                  key={"room-details"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-room-details`}>
                      Room details
                    </Tooltip>
                  }
                >
                  <Link href={"/shelter/room/" + room.id}><FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                </OverlayTrigger>
                <OverlayTrigger
                  key={"remove-room"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-remove-room`}>
                      Remove room
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faMinusSquare} style={{cursor:'pointer'}} className="ml-1" onClick={() => {setRoomToDelete({id:room.id, name: room.name});setShowRoomConfirm(true);}} inverse />
                </OverlayTrigger>
              </Card.Text>
            </Card>
          ))}
        </span>
      </Card.Body>
    </Card>
    <History action_history={data.action_history} />
    </>
  );
};

export default BuildingDetails;
