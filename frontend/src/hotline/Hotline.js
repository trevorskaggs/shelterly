import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'raviger';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import { Marker, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import Moment from 'react-moment';
import Map, { prettyText, closedMarkerIcon, reportedMarkerIcon, SIPMarkerIcon, UTLMarkerIcon } from "../components/Map";
import Header from "../components/Header";
import { S3_BUCKET } from '../constants';

function Hotline() {

  const [data, setData] = useState({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
  const [mapState, setMapState] = useState({});
  const [statusOptions, setStatusOptions] = useState("open");

  // Counts the number of species matches for a service request.
  const countMatches = (service_request) => {
    let species_matches = {};

    service_request.animals.forEach((animal) => {
      if (!species_matches[[animal.species]]) {
        species_matches[[animal.species]] = 1;
      }
      else {
        species_matches[[animal.species]] += 1;
      }
    });
    return species_matches
  }

  // Hook for initializing data.
  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    const fetchServiceRequests = async () => {
      // Fetch ServiceRequest data.
      await axios.get('/hotline/api/servicerequests/', {
        params: {
          map: true
        },
        cancelToken: source.token,
      })
      .then(response => {
        if (!unmounted) {
          setData({service_requests: response.data, isFetching: false, bounds:L.latLngBounds([[0,0]])});
          const map_dict = {};
          const bounds = [];
          for (const service_request of response.data) {
            const matches = countMatches(service_request);
            map_dict[service_request.id] = {matches:matches, latitude:service_request.latitude, longitude:service_request.longitude};
            bounds.push([service_request.latitude, service_request.longitude]);
          }
          setMapState(map_dict);
          if (bounds.length > 0) {
            setData({service_requests: response.data, isFetching: false, bounds:bounds});
          }
        }
      })
      .catch(error => {
        if (!unmounted) {
          setData({service_requests: [], isFetching: false, bounds:L.latLngBounds([[0,0]])});
        }
      });
    };

    fetchServiceRequests();

    // Cleanup.
    return () => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return (
    <>
    <Header>Hotline</Header>
    <hr/>
    <Row className="mr-0">
      <Col xs={4}>
        <ListGroup className="pb-3">
          <Link href="/hotline/workflow/owner">
            <ListGroup.Item className="rounded" action>OWNER CALLING</ListGroup.Item>
          </Link>
          <Link href="/hotline/workflow/reporter">
            <ListGroup.Item className="rounded" action>NON-OWNER CALLING</ListGroup.Item>
          </Link>
          <Link href="/hotline/workflow/first_responder">
            <ListGroup.Item className="rounded" action>FIRST RESPONDER CALLING</ListGroup.Item>
          </Link>
          <Link href="/hotline/servicerequest/search">
            <ListGroup.Item className="rounded" action>SEARCH SERVICE REQUESTS</ListGroup.Item>
          </Link>
        </ListGroup>
      </Col>
      <Col xs={8} className="ml-0 mr-0 pl-0 pr-0">
        <Row xs={12} className="ml-0 mr-0 pl-0 pr-0" style={{marginBottom:"-1px"}}>
          <Col xs={10} className="border rounded pl-0 pr-0">
            <Map bounds={data.bounds} boundsOptions={{padding:[10,10]}} className="landing-leaflet-container">
              {data.service_requests.filter(service_request => (service_request.status === statusOptions || statusOptions === "all")).map(service_request => (
                <Marker
                  key={service_request.id}
                  position={[service_request.latitude, service_request.longitude]}
                  icon={service_request.sheltered_in_place > 0 ? SIPMarkerIcon : service_request.unable_to_locate > 0 ? UTLMarkerIcon : service_request.reported_animals > 0 ? reportedMarkerIcon : closedMarkerIcon}
                  onClick={() => window.open("/hotline/servicerequest/" + service_request.id)}
                >
                  <MapTooltip autoPan={false}>
                    <span>
                      {mapState[service_request.id] ?
                        <span>
                          {Object.keys(mapState[service_request.id].matches).map((key,i) => (
                            <span key={key} style={{textTransform:"capitalize"}}>
                              {i > 0 && ", "}{prettyText('', key.split(',')[0], mapState[service_request.id].matches[key])}
                            </span>
                          ))}
                        </span>
                      :""}
                      <br />
                      {service_request.full_address}
                      {service_request.followup_date ? <div>Followup Date: <Moment format="L">{service_request.followup_date}</Moment></div> : ""}
                      <div>
                      {service_request.aco_required ? <img width={16} height={16} src={`${S3_BUCKET}images/badge-sheriff.png`} alt="ACO Required" className="mr-1" /> : ""}
                        {service_request.injured ? <img width={16} height={16} src={`${S3_BUCKET}images/band-aid-solid.png`} alt="Injured" className="mr-1" /> : ""}
                        {service_request.accessible ? <img width={16} height={16} src={`${S3_BUCKET}images/car-solid.png`} alt="Accessible" className="mr-1" /> : ""}
                        {service_request.turn_around ? <img width={16} height={16} src={`${S3_BUCKET}images/trailer-solid.png`} alt="Turn Around" /> : ""}
                      </div>
                    </span>
                  </MapTooltip>
                </Marker>
              ))}
            </Map>
          </Col>
          <Col xs={2} className="ml-0 mr-0 pl-0 pr-0 border rounded">
            <Button variant={statusOptions === "all" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("all")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>All</Button>
            <Button variant={statusOptions === "open" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("open")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Open</Button>
            <Button variant={statusOptions === "assigned" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("assigned")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Assigned</Button>
            <Button variant={statusOptions === "closed" ? "primary" : "secondary"} className="border" onClick={() => setStatusOptions("closed")} style={{maxHeight:"36px", width:"100%", marginTop:"-1px"}}>Closed</Button>
          </Col>
        </Row>
        <Row className="ml-0 mr-0 border rounded" style={{maxHeight:"38px"}}>
          <h4 className="card-header text-center" style={{paddingTop:"4px", paddingLeft:"10px", paddingRight:"10px", height:"36px", width:"100%", backgroundColor:"#808080"}}>Service Requests</h4>
        </Row>
      </Col>
    </Row>
  </>
  )
}

export default Hotline
