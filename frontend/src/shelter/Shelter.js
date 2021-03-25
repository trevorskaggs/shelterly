import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'raviger';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Map, { shelterMarkerIcon } from "../components/Map";

function Shelter() {

  const [data, setData] = useState({shelters: [],  isFetching: false, bounds:L.latLngBounds([[0,0]])});

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchShelters = async () => {
      setData({shelters: [], isFetching: true});
      // Fetch Shelter data.
      await axios.get('/shelter/api/shelter/', {
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          const bounds = [];
          for (const shelter of response.data) {
            bounds.push([shelter.latitude, shelter.longitude]);
          }
          setData({shelters: response.data, isFetching: false, bounds:bounds.length > 0 ? bounds : L.latLngBounds([[0,0]])});
        }
      })
      .catch(error => {
        if (!unmounted) {
          console.log(error.response);
          setData({shelters: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
        }
      });
    };
    fetchShelters();
    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return (
    <>
    <Header>Shelter</Header>
    <hr/>
    <Row className="mr-0">
      <Col xs={4}>
        <ListGroup className="flex-fill">
          <Link href="/shelter/new">
            <ListGroup.Item className="rounded" action>CREATE NEW SHELTER</ListGroup.Item>
          </Link>
          <Link href="/animals/search">
            <ListGroup.Item className="rounded" action>SEARCH ANIMALS</ListGroup.Item>
          </Link>
          <Link href="/people/owner/search">
          <ListGroup.Item className="rounded" action>SEARCH OWNERS</ListGroup.Item>
        </Link>
        </ListGroup>
      </Col>
      <Col xs={8} className="border rounded pl-0 pr-0">
        <Map bounds={data.bounds} className="landing-leaflet-container">
          {data.shelters.map(shelter => (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={shelterMarkerIcon}
              onClick={() => window.open("/shelter/" + shelter.id, "_blank")}
            >
              <MapTooltip autoPan={false}>
                <span>
                  <div>{shelter.name}</div>
                  <div>Address: {shelter.full_address}</div>
                  {shelter.phone ? <div>Phone: {shelter.display_phone}</div> : ""}
                </span>
              </MapTooltip>
            </Marker>
          ))}
        </Map>
      </Col>
    </Row>
    <hr/>
    <Row className="ml-0">
    {data.shelters.map(shelter => (
      <Col key={shelter.id} xs="6" className="pl-0 pr-0">
        <Card className="border rounded mr-3 mb-3" style={{whiteSpace:"nowrap", overflow:"hidden"}}>
          <div className="row no-gutters" style={{textTransform:"capitalize", marginRight:"-2px"}}>
            <Row className="ml-0 mr-0 w-100" style={{flexWrap:"nowrap"}}>
              <div className="border-right hover-div" style={{width:"100px"}}>
                <Link href={"/shelter/" + shelter.id}><FontAwesomeIcon icon={faHome} size="6x" className="ml-1 shelter-icon" style={{paddingRight:"10px"}} inverse /></Link>
              </div>
              <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                <h4 className="card-header border" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", width:"100%", backgroundColor:"#808080"}}>
                  {shelter.name}</h4>
                <div style={{marginTop:"2px"}}>
                  {shelter.full_address}
                </div>
                <div>
                  {shelter.display_phone}
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </Col>
    ))}
    <p>{data.isFetching ? 'Fetching Shelters...' : <span>{!data.shelters.length ? 'No shelters have been created yet.' : ''}</span>}</p>
    </Row>
    </>
  )
}

export default Shelter
