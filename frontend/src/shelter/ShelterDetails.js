import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare, faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import ReactImageFallback from 'react-image-fallback';
import History from '../components/History';
import Header from '../components/Header';
import noImageFound from '../static/images/image-not-found.png';

export function ShelterDetails({id}) {

  const [data, setData] = useState({
    name: '',
    address: '',
    full_address: '',
    city: '',
    state: '',
    zip_code: '',
    description: '',
    image: '',
    buildings: [],
    action_history: [],
    unroomed_animals: [],
    animal_count: 0,
    rooms: [],
  });

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
        Shelter Details<Link href={"/shelter/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
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
            <ListGroup.Item>
              <b>Address:</b> {data.full_address}
            </ListGroup.Item>
            {data.description ? <ListGroup.Item>
            <b>Description: </b>{data.description}
          </ListGroup.Item> : ""}
          </ListGroup>
        </Card.Body>
      </Card>
      <Card className="border rounded d-flex mt-3" >
        <Card.Body>
          <Card.Title className="">
            <h4 className="mb-0">Buildings<Link href={"/shelter/building/new?shelter_id=" + id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link></h4>
          </Card.Title>
          <hr/>
          <span className="d-flex flex-wrap align-items-end">
            {data.buildings.map(building => (
              <Card key={building.id} className="border rounded mr-3" style={{width:"202px"}}>
                <Card.Title className="text-center mb-0 mt-3">
                  {building.name}
                  <Link href={"/shelter/building/" + building.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                </Card.Title>
                <hr style={{marginBottom:"0px"}} />
                <span className="d-flex flex-wrap align-items-end">
                  {building.rooms.map(room => (
                    <Card key={room.id} className="border rounded" style={{width:"100px", height:"100px"}}>
                      <Card.Text className="text-center mb-0">
                        {room.name}
                        <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                      </Card.Text>
                      <Card.Text className="text-center mb-0">
                        {room.animals.length} Animals
                      </Card.Text>
                    </Card>
                  ))}
                  <Link href={"/shelter/building/room/new?building_id=" + building.id}> <FontAwesomeIcon icon={faPlusSquare} style={{width:"100px", height:"100px", verticalAlign:"middle"}} inverse /></Link>
                </span>
              </Card>
            ))}
          </span>
        </Card.Body>
      </Card>
      {data.unroomed_animals.length ?
      <div className="row mt-3">
        <div className="col-12 d-flex">
          <Card className="border rounded" style={{width:"100%"}}>
            <Card.Body>
              <Card.Title>
                <h4 className="mb-0">Animals Needing Room
                <OverlayTrigger key={"assign"} placement="top" overlay={<Tooltip id={`tooltip-assign`}>Assign Animals to Rooms</Tooltip>}>
                  <Link href={"/shelter/" + id + "/assign"}><FontAwesomeIcon className="ml-1" icon={faWarehouse} inverse/></Link>
                </OverlayTrigger></h4>
              </Card.Title>
              <hr/>
              <span className="d-flex flex-wrap align-items-end">
              {data.unroomed_animals.map(animal => (
                <Card key={animal.id} className="border rounded mr-3" style={{border:"none"}}>
                  <ReactImageFallback style={{width:"151px"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
                  <Card.Text className="text-center mb-0">
                    {animal.name||"Unknown"}
                    <Link href={"/animals/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                    <Link href={"/animals/edit/" + animal.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                  </Card.Text>
                  <Card.Text className="text-center" style={{textTransform:"capitalize"}}>
                    {animal.size !== 'unknown' ? animal.size : ""} {animal.species}
                  </Card.Text>
                </Card>
              ))}
              </span>
            </Card.Body>
          </Card>
        </div>
      </div> : ""}
      <History action_history={data.action_history} />
    </>
  );
};

export function BuildingDetailsTable({id}) {

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
      Building Details<Link href={"/shelter/building/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
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
            <b>Shelter:</b> {data.shelter_name}<Link href={"/shelter/" + data.shelter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
    <Card className="mt-3 border rounded d-flex">
      <Card.Body>
        <Card.Title>
          <h4>Rooms<Link href={"/shelter/building/room/new?building_id=" + id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link></h4>
        </Card.Title>
        <hr/>
        <span className="d-flex flex-wrap align-items-end">
          {data.rooms.map(room => (
            <Card key={room.id} className="border rounded mr-3" style={{width:"100px", height:"100px"}}>
              <Card.Text className="text-center mb-0">
                {room.name}
                <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                <Link href={"/shelter/room/edit/" + room.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
              </Card.Text>
              <Card.Text className="text-center mb-0">
                {room.animals.length} Animals
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

export function RoomDetailsTable({id}) {

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
      Room Details<Link href={"/shelter/room/edit/" + id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
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
            <b>Building:</b> {data.building_name}<Link href={"/shelter/building/" + data.building}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
          </ListGroup.Item>
          <ListGroup.Item>
            <b>Shelter:</b> {data.shelter_name}<Link href={"/shelter/" + data.shelter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
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
              <Card key={animal.id} className="mr-3" style={{border:"none"}}>
                <ReactImageFallback style={{width:"151px"}} src={animal.front_image} fallbackImage={[animal.side_image, noImageFound]} />
                <Card.Text className="text-center mb-0">
                  {animal.name||"Unknown"}
                  <Link href={"/animals/" + animal.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                  <Link href={"/animals/edit/" + animal.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                </Card.Text>
                <Card.Text className="text-center mb-0">
                  {animal.status}
                </Card.Text>
                <Card.Text className="text-center" style={{textTransform:"capitalize"}}>
                  {animal.size} {animal.species}
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
