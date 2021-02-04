import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare, faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import History from '../components/History';
import Header from '../components/Header';

function BuildingDetails({id}) {

  const [data, setData] = useState({name:'', description: '', shelter: null, shelter_name:'', rooms:[], action_history:[]});

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
              <Link href={"/shelter/" + data.shelter + "/assign"}><FontAwesomeIcon className="ml-1" icon={faWarehouse} inverse/></Link>
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
      <Card.Body>
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
            <Card key={room.id} className="border rounded mr-3" style={{width:"100px", height:"100px"}}>
              <Card.Text className="text-center mb-0">
                {room.name}
                <OverlayTrigger
                  key={"room-details"}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-room-details`}>
                      Room details
                    </Tooltip>
                  }
                >
                  <Link href={"/shelter/room/" + room.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                </OverlayTrigger>
              </Card.Text>
              <Card.Text className="text-center mb-0">
                {room.animal_count} Animals
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
