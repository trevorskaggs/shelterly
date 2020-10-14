import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, CardGroup, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const link_style = {
  textDecoration: "none",
};

const header_style = {
  textAlign: "center",
}

export function ShelterDetailsTable({id}) {

  const [data, setData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    description: '',
    image: '',
    buildings: [],
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
      <h1 style={header_style}>Shelter #{id}</h1>
      <br/>
      <CardGroup>
        <Card>
          <ListGroup.Item>
            <p><b>Name:</b> {data.name}</p>
            <p><b>Adress:</b> {data.address}</p>
            <p><b>City:</b> {data.city}</p>
            <p><b>State:</b> {data.state}</p>
            <p><b>Zip:</b> {data.zip_code}</p>
            <p><b>Description:</b> {data.description}</p>
          </ListGroup.Item>  
        </Card>
      </CardGroup>
      <CardGroup>
        <Card>
          <Card.Body>
          <Card.Title className="">
            <h4 className="mb-0">Buildings<Link href={"/shelter/building/new?shelter_id=" + id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link></h4>
          </Card.Title>
          <ListGroup variant="flush">
            {!data.buildings.length ? <span><ListGroup.Item><Link href={"/shelter/building/new?shelter_id=" + id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>&nbsp;<b>Add Building</b></ListGroup.Item></span> :
              <span>{data.buildings.map(building => (
                <ListGroup.Item key={building.id}>
                  &nbsp;<b>Name:</b> {building.name}
                  <Link href={"/shelter/building/" + building.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                  <Link href={"/shelter/building/edit/" + building.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                  {!building.rooms.length ? <span><ListGroup.Item><Link href={"/shelter/building/room/new?building_id=" + building.id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>&nbsp;<b>Add Rooms</b></ListGroup.Item></span>: 
                    <span>
                      {building.rooms.map(room => (
                        <ListGroup.Item key={room.id}>
                          <Link href={"/shelter/building/room/new?building_id=" + building.id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>
                          &nbsp;<b>Rooms:</b> {room.name}
                          <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                          <Link href={"/shelter/room/edit/" + room.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                        </ListGroup.Item>
                      ))}
                    </span>
                  }
                </ListGroup.Item>
              ))}</span>
            }
            </ListGroup>
          </Card.Body>
        </Card>
      </CardGroup>
      <hr/>
      <div style={btn_style}>
        <Link href={"/shelter/building/new?shelter_id=" + id} style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD BUILDING</Link>
        <br/>
        <Link href={"/shelter/edit/" + id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">UPDATE SHELTER</Link>
        <br/>
        <Link href="/shelter/list" className="btn btn-secondary btn-lg btn-block" >BACK</Link>
      </div>
    </>
  );
};

export function BuildingDetailsTable({id}) {

  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchBuildingData = async () => {
      // Fetch Building Details data.
      await axios.get('/shelter/api/building/' + id, {
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
      <h1 style={header_style}>{data.name}</h1>
      <br/>
        <Card>
          <ListGroup.Item>
              <p><b>Name:</b> {data.name}</p>
              <p><b>Shelter:</b> {data.shelter_name}<Link href={"/shelter/" + data.shelter}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></p>
              <p><b>Description:</b> {data.description}</p>
          </ListGroup.Item>
        </Card>
        <Card className="mt-3">
        <Card.Body>
          <Card.Title className="">
            <h4 className="mb-0">Rooms<Link href={"/shelter/building/room/new?building_id=" + id}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link></h4>
          </Card.Title>
          <ListGroup variant="flush">
          {data.rooms === undefined ? <span><ListGroup.Item><p>No Rooms Found</p></ListGroup.Item></span> :
            <span>{data.rooms.map(room => (
              <ListGroup.Item key={room.id}>
                &nbsp;<b>Name:</b> {room.name}
                <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                <Link href={"/shelter/room/edit/" + room.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
              </ListGroup.Item>
            ))}</span>
          } 
          </ListGroup>
          </Card.Body>
        </Card>
      <hr/>
      <div style={btn_style}>
        <Link href={"/shelter/building/room/new?building_id=" + id} style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD ROOM</Link>
        <br/>
        <Link href={"/shelter/building/edit/" + id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT BUILDING</Link>
        <br/>
        <Link href="/shelter/list" className="btn btn-secondary btn-lg btn-block">BACK</Link>
      </div>
    </>
  );
};

export function RoomDetailsTable({id}) {

  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchRoomData = async () => {
      // Fetch Room Details data.
      await axios.get('/shelter/api/room/' + id, {
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
      <h1 style={header_style}>{data.name}</h1>
      <br/>
      <CardGroup>
        <Card>
          <ListGroup.Item>
              <p><b>Name:</b> {data.name}</p>
              <p><b>Description:</b> {data.description}</p>
          </ListGroup.Item>
        </Card>
      </CardGroup>
      <hr/>
      <div style={btn_style}>
        <Link href={"/shelter/room/edit/" + id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT BUILDING</Link>
        <br/>
        <Link href="/shelter/list" className="btn btn-secondary btn-lg btn-block">BACK</Link>
      </div>
    </>
  );
};
