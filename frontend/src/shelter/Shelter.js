import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, navigate } from 'raviger';
import { Button, Card, Col, Row } from 'react-bootstrap';
import L from "leaflet";
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Map, { shelterMarkerIcon } from "../components/Map";
import Scrollbar from '../components/Scrollbars';

function Shelter({ incident }) {

  const [data, setData] = useState({shelters: [],  isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [selectedShelter, setSelectedShelter] = useState(null);

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
    <Row className="ml-0 mr-0 pl-0 pr-0">
      <Col xs={10} className="border rounded pl-0 pr-0">
        <Map bounds={data.bounds} className="landing-leaflet-container">
          {data.shelters.filter(shelter => shelter.id === selectedShelter || !selectedShelter ? shelter : null).map((shelter, index) => (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={shelterMarkerIcon}
              onClick={() => navigate("/" + incident + "/shelter/" + shelter.id)}
            >
              <MapTooltip key={`${index}-${selectedShelter}`} keepInView={false} autoPan={false} permanent={selectedShelter === shelter.id ? true : false}>
                <span>
                  <div>{shelter.name} - {shelter.animal_count} Animal{shelter.animal_count === 1 ? "" :"s"}</div>
                  <div>Address: {shelter.full_address}</div>
                  {shelter.phone ? <div>Phone: {shelter.display_phone}</div> : ""}
                </span>
              </MapTooltip>
            </Marker>
          ))}
        </Map>
        <Row style={{marginLeft:"0px", marginRight:"0px", maxHeight:"37px"}}>
          <h4 className="card-header text-center" style={{paddingTop:"4px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>Shelters</h4>
        </Row>
      </Col>
      <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
        <Scrollbar no_shadow="true" style={{height:"450px"}} renderThumbHorizontal={props => <div {...props} style={{...props.style, display: 'none'}} />}>
          <Button variant={selectedShelter === null ? "primary" : "secondary"} className="border" onClick={() => setSelectedShelter(null)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>All</Button>
          {data.shelters.map(shelter => (
            <Button key={shelter.id} title={shelter.name} variant={shelter.id === selectedShelter ? "primary" : "secondary"} className="border" onClick={() => setSelectedShelter(selectedShelter === shelter.id ? null : shelter.id)} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>
              {shelter.name}
            </Button>
          ))}
        </Scrollbar>
      </Col>
    </Row>
    <hr/>
    <Row className="ml-0">
      {data.shelters.map(shelter => (
        <span key={shelter.id} className="pl-0 pr-0 mr-3 mb-3">
          <Link href={"/" + incident + "/shelter/" + shelter.id} className="shelter-link" style={{textDecoration:"none", color:"white"}}>
            <Card className="border rounded shelter-hover-div" style={{height:"100px", whiteSpace:"nowrap", overflow:"hidden"}}>
              <div className="row no-gutters hover-div" style={{height:"100px", textTransform:"capitalize", marginRight:"-2px"}}>
                <Row className="ml-0 mr-0 w-100" style={{minWidth:"510px", maxWidth:"510px", flexWrap:"nowrap"}}>
                  <div className="border-right" style={{width:"100px"}}>
                    <FontAwesomeIcon icon={faHome} size="6x" className="ml-1 shelter-icon" style={{marginTop:"5px", paddingRight:"10px"}} inverse />
                  </div>
                  <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                    <div className="border" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"#615e5e"}}>
                      {shelter.name} - {shelter.animal_count} Animal{shelter.animal_count === 1 ? "" :"s"}
                    </div>
                    <div style={{marginTop:"6px"}}>
                      {shelter.full_address}
                    </div>
                    <div>
                      {shelter.display_phone}
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Link>
        </span>
      ))}
      <span className="pl-0 pr-0 mr-3 mb-3">
        <Link href={"/" + incident + "/shelter/new"} className="shelter-link" style={{textDecoration:"none", color:"white"}}>
          <Card className="border rounded shelter-hover-div" style={{height:"100px", whiteSpace:"nowrap", overflow:"hidden"}}>
            <div className="row no-gutters hover-div" style={{height:"100px", textTransform:"capitalize", marginRight:"-2px"}}>
              <Row className="ml-0 mr-0 w-100" style={{minWidth:"510px", maxWidth:"510px", flexWrap:"nowrap"}}>
                <div className="border-right" style={{width:"100px"}}>
                  <FontAwesomeIcon icon={faPlusSquare} size="7x" className="shelter-icon" style={{paddingLeft:"7px", paddingBottom:"7px"}} inverse />
                </div>
                <Col style={{marginLeft:"-5px", marginRight:"-25px"}}>
                  <div className="border" style={{paddingTop:"5px", paddingBottom:"7px", paddingLeft:"10px", marginLeft:"-11px", marginTop: "-1px", fontSize:"18px", width:"100%", backgroundColor:"#615e5e"}}>
                    Create New Shelter
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Link>
      </span>
    </Row>
    </>
  )
}

export default Shelter
