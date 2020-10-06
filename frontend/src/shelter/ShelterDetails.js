import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Button } from 'reactstrap';
import { BuildingList } from "./Building";
import { Card, CardGroup, ListGroup } from 'react-bootstrap';
import { RoomList } from "./Room";
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

const card_style = {
  width: "90%",
}

const header_style = {
  textAlign: "center",
}

export function ShelterDetailsTable({sid}) {
  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    console.log('shelter: ' + sid)
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
    // Fetch Shelter Details data.
    await axios.get('/shelter/api/shelter/' + sid + '/', {
        cancelToken: source.token,
    })
    .then(response => {
        setData(response.data);
        console.log(response.data);
    })
    .catch(e => {
        console.log(e);
    });
    };
    fetchShelterData();
  }, [sid]);

  return (
    <>
      <h1 style={header_style}>Shelter #{data.id}</h1>
      <br/>
      <CardGroup>
        <Card>
          <ListGroup.Item>
            <p><b>Name:</b> {String(data.name)}</p>
            <p><b>Adress:</b> {String(data.address)}</p>
            <p><b>City:</b> {String(data.city)}</p>
            <p><b>State:</b> {String(data.state)}</p>
            <p><b>Zip:</b> {String(data.zip_code)}</p>
            <p><b>Description:</b> {String(data.description)}</p>
            <p><b>Image:</b> {String(data.image)}</p>
          </ListGroup.Item>  
        </Card>
      </CardGroup>
      <CardGroup>
          <Card>
            <Card.Body>
                  {data.buildings == undefined ? <span><ListGroup.Item><p>No Buildings Found</p></ListGroup.Item></span> :
                    <span>{data.buildings.map(building => (
                      <ListGroup.Item>
                        <b>Building:</b> {building.name}
                        <Link href={"/shelter/building/" + building.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                          <ListGroup.Item>
                          {building.rooms == undefined ? <span><ListGroup.Item><p>No Rooms Found</p></ListGroup.Item></span>: 
                            <span>
                              {building.rooms.map(room => (
                                <ListGroup.Item>
                                  <b>Rooms:</b> {room.name}
                                  <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                                </ListGroup.Item>
                              ))}
                            </span>
                          }
                          </ListGroup.Item>
                      </ListGroup.Item>))
                    }</span>
                  }
            </Card.Body>
          </Card>
        </CardGroup>
      <hr/>
      <div style={btn_style}>
        <Link href={"/shelter/" + data.id + "/building/new"} style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD BUILDING</Link>
        <br/>
        <Link href={"/shelter/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">UPDATE SHELTER</Link>
        <br/>
        <Link href="/shelter/list" className="btn btn-secondary btn-lg btn-block" >BACK</Link>
      </div>
    </>
  );
};

export function BuildingDetailsTable({bid}) {
  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    console.log('builing: ' + bid)
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
    // Fetch Shelter Details data.
    await axios.get('/shelter/api/building/' + bid, {
        cancelToken: source.token,
    })
    .then(response => {
        setData(response.data);
        console.log(response.data);
    })
    .catch(e => {
        console.log(e);
    });
    };
    fetchShelterData();
  }, [bid]);

  return (
    <>
      <h1 style={header_style}>{data.name}</h1>
      <br/>
        <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
          <div className="row">
            <div className="col-8">
              <p><b>Name:</b> {data.name}</p>
              <p><b>Shelter:</b> {data.shelter}</p>
              <p><b>Description:</b> {data.description}</p>
          </div>
        </div>
      </div>
      {data.rooms == '' ? <div style={card_style} className="card card-body bg-light mb-2 mx-auto"><p><b>No Rooms Found</b></p></div> :
        <RoomList bid={data.id} />
      }
      <hr/>
      <div style={btn_style}>
        <Link href={"/shelter/building/" + data.id + "/room/new"} style={link_style} className="btn btn-success btn-lg btn-block mb-2">ADD ROOM</Link>
        <br/>
        <Link href={"/shelter/building/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT BUILDING</Link>
        <br/>
        <Link href="/shelter/list" className="btn btn-secondary btn-lg btn-block">BACK</Link>
      </div>
    </>
  );
};

export function RoomDetailsTable({rid}) {
  const [data, setData] = useState({});

  // Hook for initializing data.
  useEffect(() => {
    console.log('builing: ' + rid)
    let source = axios.CancelToken.source();
    const fetchShelterData = async () => {
    // Fetch Shelter Details data.
    await axios.get('/shelter/api/room/' + rid, {
        cancelToken: source.token,
    })
    .then(response => {
        setData(response.data);
        console.log(response.data);
    })
    .catch(e => {
        console.log(e);
    });
    };
    fetchShelterData();
  }, [rid]);

  return (
    <>
      <h1 style={header_style}>{data.name}</h1>
      <br/>
        <div style={card_style} className="card card-body bg-light mb-2 mx-auto">
          <div className="row">
            <div className="col-8">
              <p><b>Name:</b> {data.name}</p>
              <p><b>Shelter:</b> {data.shelter}</p>
              <p><b>Description:</b> {data.description}</p>
          </div>
        </div>
      </div>
      <hr/>
      <div style={btn_style}>
        <Link href={"/shelter/room/edit/" + data.id} style={link_style} className="btn btn-primary btn-lg btn-block mb-2">EDIT BUILDING</Link>
        <br/>
        <Link href="/shelter/list" className="btn btn-secondary btn-lg btn-block">BACK</Link>
      </div>
    </>
  );
};