import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, CardGroup, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { ShelterDetailsTable } from "./ShelterDetails";


const header_style = {
  textAlign: "center",
};

const link_style = {
  textDecoration: "none",
};

export function ShelterTable() {

  const [data, setData] = useState({shelters: [],  isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelters = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('http://localhost:8000/shelter/api/shelter', {
        cancelToken: source.token,
      })
      .then(response => {
        setData({shelters: response.data, isFetching: false});
      })
      .catch(error => {
        console.log(error.response);
        setData({shelters: [], isFetching: false});
      });
    };
    fetchShelters();
    // Cleanup.
    return () => {
      source.cancel();
    };
  }, []);

  return (
    <div className="ml-2 mr-2">
      {data.shelters.map(shelter => (
        <div key={shelter.id} className="mt-5">
          <div className="card-header">{shelter.name}<Link href={"/shelter/" + shelter.id}> <FontAwesomeIcon icon={faClipboardList} inverse/></Link>
          <div style={{width:400,height:25, minHeight:25}}>{shelter.full_address}</div></div>
        
          <CardGroup>
            <Card key={shelter.id}>
              <Card.Body>
                <Card.Title>Buildings</Card.Title>
                  <ListGroup>
                    {shelter.buildings ? <span>{shelter.buildings.map(building => (<ListGroup.Item key={building.id}>{building.name} <Link href={"/shelter/building/" + building.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>))}</span> : <span><li>None</li></span>}
                  </ListGroup>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Rooms</Card.Title>
                  <ListGroup>
                    {shelter.rooms ? <span>{shelter.rooms.map(room => (<ListGroup.Item key={room.id}>{room.name} <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link></ListGroup.Item>))}</span> : <span><li>None</li></span>}
                  </ListGroup>
                </Card.Body>
            </Card>
          </CardGroup>
          
        </div>
      ))}
    </div>
  )
}

export const ShelterDetails = ({sid}) => (
  <div>
    <h1 style={header_style}>Shelters</h1>
    <br/>
    <ShelterDetailsTable sid={sid} />
  </div>
)
