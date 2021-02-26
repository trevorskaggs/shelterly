import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import ReactImageFallback from 'react-image-fallback';
import History from '../components/History';
import Header from '../components/Header';
import S3_BUCKET from '../constants';


function RoomDetails({id}) {

  const [data, setData] = useState({name:'', description:'', building_name: '', shelter_name:'', shelter: null, animals:[], action_history:[]});

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
    </Header>
    <hr/>
    <Card className="border rounded d-flex" style={{width:"100%"}}>
      <Card.Body>
        <Card.Title>
          <h4>Information
            <OverlayTrigger key={"assign"} placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign animals to rooms</Tooltip>}>
              <Link href={"/shelter/" + data.shelter + "/assign?building_id=" + data.building}><FontAwesomeIcon className="ml-1" icon={faWarehouse} inverse/></Link>
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
    <div className="row mb-2 mt-3" hidden={data.animals.length === 0}>
      <div className="col-12 d-flex">
        <Card className="mb-2 border rounded" style={{width:"100%"}}>
          <Card.Body>
            <Card.Title>
              <h4 className="mb-0">Animals</h4>
            </Card.Title>
            <hr/>
            <span className="d-flex flex-wrap align-items-end">
            {data.animals.map(animal => (
              <Card key={animal.id} className="border rounded mr-3 mb-3" style={{border:"none"}}>
                <ReactImageFallback style={{width:"151px", height:"151px", objectFit: "cover", overflow: "hidden"}} src={animal.front_image} fallbackImage={[animal.side_image, `${S3_BUCKET}images/image-not-found.png`]} />
                <Card.Text className="text-center mb-0" style={{textTransform:"capitalize"}}>
                {animal.species === 'horse' ? animal.size : animal.species} - {animal.name||"Unknown"}
                  <OverlayTrigger
                    key={"animal-details"}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-animal-details`}>
                        Animal details
                      </Tooltip>
                    }
                  >
                    <Link href={"/animals/" + animal.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                  </OverlayTrigger>
                </Card.Text>
              </Card>
            ))}
            </span>
          </Card.Body>
        </Card>
      </div>
    </div>
    <History action_history={data.action_history} />
    </>
  );
};

export default RoomDetails;
