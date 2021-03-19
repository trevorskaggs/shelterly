import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'raviger';
import { Card, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faHome } from '@fortawesome/free-solid-svg-icons';
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
          <div className="row no-gutters" style={{ textTransform:"capitalize" }}>
            <div className="mb-0">
              <Row className="ml-0 mr-0">
                <div className="border-right" style={{width:"100px"}}>
                  <FontAwesomeIcon icon={faHome} size="6x" className="ml-1" style={{paddingRight:"10px"}} inverse />
                </div>
                <Col style={{marginLeft:"-5px"}}>
                  <h4 className="mt-1">{shelter.name}
                    <OverlayTrigger
                      key={"shelter-details"}
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-shelter-details`}>
                          Shelter details
                        </Tooltip>
                      }
                    >
                      <Link href={"/shelter/" + shelter.id}><FontAwesomeIcon icon={faClipboardList} className="ml-1" inverse /></Link>
                    </OverlayTrigger>
                  </h4>
                  <div>
                    {shelter.full_address}
                  </div>
                  <div>
                    {shelter.display_phone}
                  </div>
                </Col>
              </Row>
            </div>
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
