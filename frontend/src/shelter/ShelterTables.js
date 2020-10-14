import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'raviger';
import { Card, CardGroup, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { ShelterDetailsTable } from "./ShelterDetails";

const header_style = {
  textAlign: "center",
};

export function ShelterTable() {

  const [data, setData] = useState({shelters: [],  isFetching: false});

  // Hook for initializing data.
  useEffect(() => {
    let source = axios.CancelToken.source();
    const fetchShelters = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('/shelter/api/shelter', {
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
        <div key={shelter.id} className="mt-3">
          <div className="card-header">{shelter.name}
            <Link href={"/shelter/" + shelter.id}> <FontAwesomeIcon icon={faClipboardList} inverse/></Link>
            <Link href={"/shelter/edit/" + shelter.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
            <div style={{width:400,height:25, minHeight:25}}>{shelter.full_address}</div>
          </div>
          <CardGroup>
            <Card key={shelter.id}>
              <Card.Body>
                  <ListGroup>
                    {! shelter.buildings.length ? <span><ListGroup.Item><Link href={"/shelter/" + shelter.id + "/building/new"}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>&nbsp;<b>Add Building</b></ListGroup.Item></span> : 
                      <span>{shelter.buildings.map(building => (
                        <ListGroup.Item key={building.id}>
                          <Link href={"/shelter/" + shelter.id + "/building/new"}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>
                          &nbsp;<b>Building:</b> {building.name} 
                          <Link href={"/shelter/building/" + building.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                          <Link href={"/shelter/building/edit/" + building.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                          {! building.rooms.length ? <span><ListGroup.Item><Link href={"/shelter/building/" + building.id + "/room/new"}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>&nbsp;<b>Add Room</b></ListGroup.Item></span> :
                            <span>{building.rooms.map(room => (
                              <ListGroup.Item key={room.id}>
                                <Link href={"/shelter/building/" + building.id + "/room/new"}> <FontAwesomeIcon icon={faPlusSquare} inverse /></Link>
                                &nbsp;<b>Room:</b> {room.name}
                                <Link href={"/shelter/room/" + room.id}> <FontAwesomeIcon icon={faClipboardList} inverse /></Link>
                                <Link href={"/shelter/room/edit/" + room.id}> <FontAwesomeIcon icon={faEdit} inverse /></Link>
                              </ListGroup.Item>
                            ))}
                            </span>}
                        </ListGroup.Item>))}
                      </span>}
                  </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
        </div>
      ))}
    </div>
  )
}

export const ShelterDetails = ({id}) => (
  <div>
    <ShelterDetailsTable id={id} />
  </div>
)
